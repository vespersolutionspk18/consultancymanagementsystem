import { Injectable } from '@nestjs/common';

import axios from 'axios';

import { SearchHelpCenterToolParametersZodSchema } from 'src/engine/core-modules/tool/tools/search-help-center-tool/search-help-center-tool.schema';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import {
  type Tool,
  type ToolExecutionContext,
} from 'src/engine/core-modules/tool/types/tool.type';
import { CMSConfigService } from 'src/engine/core-modules/cms-config/cms-config.service';

@Injectable()
export class SearchHelpCenterTool implements Tool {
  description =
    'Search CMS documentation and help center to find information about features, setup, usage, and troubleshooting.';
  inputSchema = SearchHelpCenterToolParametersZodSchema;

  constructor(private readonly cmsConfigService: CMSConfigService) {}

  async execute(
    parameters: ToolInput,
    _context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    const { query } = parameters;

    try {
      const MINTLIFY_API_KEY = this.cmsConfigService.get('MINTLIFY_API_KEY');
      const MINTLIFY_SUBDOMAIN =
        this.cmsConfigService.get('MINTLIFY_SUBDOMAIN');

      const useDirectApi = MINTLIFY_API_KEY && MINTLIFY_SUBDOMAIN;

      const endpoint = useDirectApi
        ? `https://api-dsc.mintlify.com/v1/search/${MINTLIFY_SUBDOMAIN}`
        : 'https://cms-help-search.com/search/cms';

      const headers = {
        'Content-Type': 'application/json',
        ...(useDirectApi && { Authorization: `Bearer ${MINTLIFY_API_KEY}` }),
      };

      const response = await axios.post(
        endpoint,
        { query, pageSize: 10 },
        { headers },
      );

      const results = response.data;

      if (results.length === 0) {
        return {
          success: true,
          message: `No help center articles found for "${query}"`,
          result: [],
        };
      }

      return {
        success: true,
        message: `Found ${results.length} relevant help center article${results.length === 1 ? '' : 's'} for "${query}"`,
        result: results,
      };
    } catch (error) {
      const errorDetail = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
          ? error.message
          : 'Help center search failed';

      return {
        success: false,
        message: `Failed to search help center for "${query}"`,
        error: errorDetail,
      };
    }
  }
}
