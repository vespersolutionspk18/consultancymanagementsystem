import { Module } from '@nestjs/common';

import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { CMSConfigModule } from 'src/engine/core-modules/cms-config/cms-config.module';
import { MicrosoftAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/microsoft/services/microsoft-api-refresh-tokens.service';

@Module({
  imports: [CMSConfigModule, JwtModule],
  providers: [MicrosoftAPIRefreshAccessTokenService],
  exports: [MicrosoftAPIRefreshAccessTokenService],
})
export class MicrosoftAPIRefreshAccessTokenModule {}
