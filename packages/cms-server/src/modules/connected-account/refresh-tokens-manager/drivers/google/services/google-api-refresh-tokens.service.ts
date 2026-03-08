import { Injectable } from '@nestjs/common';

import { GaxiosError } from 'gaxios';
import { google } from 'googleapis';
import { isDefined } from 'cms-shared/utils';

import { CMSConfigService } from 'src/engine/core-modules/cms-config/cms-config.service';
import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/modules/connected-account/refresh-tokens-manager/exceptions/connected-account-refresh-tokens.exception';
import { type ConnectedAccountTokens } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

@Injectable()
export class GoogleAPIRefreshAccessTokenService {
  constructor(private readonly cmsConfigService: CMSConfigService) {}

  async refreshTokens(refreshToken: string): Promise<ConnectedAccountTokens> {
    const oAuth2Client = new google.auth.OAuth2(
      this.cmsConfigService.get('AUTH_GOOGLE_CLIENT_ID'),
      this.cmsConfigService.get('AUTH_GOOGLE_CLIENT_SECRET'),
    );

    oAuth2Client.setCredentials({
      refresh_token: refreshToken,
    });
    try {
      const { token } = await oAuth2Client.getAccessToken();

      if (!isDefined(token)) {
        throw new ConnectedAccountRefreshAccessTokenException(
          'Error refreshing Google tokens: Invalid refresh token',
          ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
        );
      }

      return {
        accessToken: token,
        refreshToken,
      };
    } catch (error) {
      if (
        error instanceof GaxiosError &&
        error.response?.data?.error === 'invalid_grant'
      ) {
        throw new ConnectedAccountRefreshAccessTokenException(
          'Error refreshing Google tokens: Invalid refresh token',
          ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
        );
      }

      throw error;
    }
  }
}
