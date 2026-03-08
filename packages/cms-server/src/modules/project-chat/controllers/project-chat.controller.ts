import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';

import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import type { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ProjectChatService } from 'src/modules/project-chat/services/project-chat.service';

// UUID validation helper
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (str: string | undefined | null): boolean => {
  if (!str) return false;
  return UUID_REGEX.test(str);
};

interface CreateChatDto {
  projectId: string;
  title?: string;
  selectedFileIds?: string[];
}

interface SendMessageDto {
  message: string;
}

interface UpdateSelectedFilesDto {
  selectedFileIds: string[];
}

interface UpdateTitleDto {
  title: string;
}

@Controller('rest/project-chats')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
export class ProjectChatController {
  private readonly logger = new Logger(ProjectChatController.name);

  constructor(private readonly projectChatService: ProjectChatService) {}

  @Post()
  async createChat(
    @Body() body: CreateChatDto,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    // Validate projectId
    if (!isValidUUID(body.projectId)) {
      this.logger.error(`Invalid projectId: ${body.projectId}`);
      return {
        success: false,
        error: `Invalid project ID format: ${body.projectId}`,
      };
    }

    try {
      this.logger.log(`Creating chat for project ${body.projectId} in workspace ${workspace.id}`);
      const chat = await this.projectChatService.createChat({
        projectId: body.projectId,
        title: body.title,
        selectedFileIds: body.selectedFileIds,
        workspaceId: workspace.id,
      });

      return { success: true, chat };
    } catch (error) {
      this.logger.error(`Failed to create chat: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('project/:projectId')
  async getChatsByProject(
    @Param('projectId') projectId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    if (!isValidUUID(projectId)) {
      return { success: false, chats: [], error: `Invalid project ID format: ${projectId}` };
    }

    try {
      const chats = await this.projectChatService.getChatsByProject(
        projectId,
        workspace.id,
      );
      return { success: true, chats };
    } catch (error) {
      this.logger.error(`Failed to get chats: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, chats: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Get(':chatId')
  async getChat(
    @Param('chatId') chatId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    if (!isValidUUID(chatId)) {
      return { success: false, error: `Invalid chat ID format: ${chatId}` };
    }

    try {
      const chat = await this.projectChatService.getChat(chatId, workspace.id);

      if (!chat) {
        return { success: false, error: 'Chat not found' };
      }

      return { success: true, chat };
    } catch (error) {
      this.logger.error(`Failed to get chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Patch(':chatId/files')
  async updateSelectedFiles(
    @Param('chatId') chatId: string,
    @Body() body: UpdateSelectedFilesDto,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    if (!isValidUUID(chatId)) {
      return { success: false, error: `Invalid chat ID format: ${chatId}` };
    }

    try {
      const chat = await this.projectChatService.updateSelectedFiles(
        chatId,
        body.selectedFileIds,
        workspace.id,
      );

      return { success: true, chat };
    } catch (error) {
      this.logger.error(`Failed to update files: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Patch(':chatId/title')
  async updateTitle(
    @Param('chatId') chatId: string,
    @Body() body: UpdateTitleDto,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    if (!isValidUUID(chatId)) {
      return { success: false, error: `Invalid chat ID format: ${chatId}` };
    }

    try {
      const chat = await this.projectChatService.updateChatTitle(
        chatId,
        body.title,
        workspace.id,
      );

      return { success: true, chat };
    } catch (error) {
      this.logger.error(`Failed to update title: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  @Post(':chatId/messages')
  async sendMessage(
    @Param('chatId') chatId: string,
    @Body() body: SendMessageDto,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Res() res: Response,
  ) {
    // Validate chatId is a valid UUID
    if (!isValidUUID(chatId)) {
      this.logger.error(`Invalid chatId: ${chatId}`);
      res.status(400).json({
        success: false,
        error: `Invalid chat ID format: ${chatId}`,
      });
      return;
    }

    let headersWritten = false;

    try {
      const { stream } = await this.projectChatService.streamChatResponse({
        chatId,
        userMessage: body.message,
        workspaceId: workspace.id,
      });

      // Set headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      headersWritten = true;

      // Set a timeout to prevent hanging indefinitely (5 minutes max)
      const timeout = setTimeout(() => {
        this.logger.warn(`Stream timeout for chat ${chatId}`);
        res.write(
          `data: ${JSON.stringify({ type: 'error', content: 'Response timed out' })}\n\n`,
        );
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
      }, 5 * 60 * 1000);

      try {
        for await (const chunk of stream.textStream) {
          res.write(
            `data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`,
          );
        }

        clearTimeout(timeout);
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
      } catch (streamError) {
        clearTimeout(timeout);
        this.logger.error(
          `Stream error: ${streamError instanceof Error ? streamError.message : 'Unknown error'}`,
        );
        // Send error via SSE since headers are already sent
        res.write(
          `data: ${JSON.stringify({ type: 'error', content: streamError instanceof Error ? streamError.message : 'Stream failed' })}\n\n`,
        );
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
      }
    } catch (error) {
      this.logger.error(
        `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      if (headersWritten) {
        // Headers already sent, send error via SSE
        res.write(
          `data: ${JSON.stringify({ type: 'error', content: error instanceof Error ? error.message : 'Unknown error' })}\n\n`,
        );
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
      } else {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  @Delete(':chatId')
  async deleteChat(
    @Param('chatId') chatId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    if (!isValidUUID(chatId)) {
      return { success: false, error: `Invalid chat ID format: ${chatId}` };
    }

    try {
      await this.projectChatService.deleteChat(chatId, workspace.id);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to delete chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
