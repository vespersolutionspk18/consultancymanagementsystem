import { Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { CMSConfigModule } from 'src/engine/core-modules/cms-config/cms-config.module';
import { CMSConfigService } from 'src/engine/core-modules/cms-config/cms-config.service';

const InternalJwtModule = NestJwtModule.registerAsync({
  useFactory: async (cmsConfigService: CMSConfigService) => {
    return {
      secret: cmsConfigService.get('APP_SECRET'),
      signOptions: {
        expiresIn: cmsConfigService.get('ACCESS_TOKEN_EXPIRES_IN'),
      },
    };
  },
  inject: [CMSConfigService],
});

@Module({
  imports: [InternalJwtModule, CMSConfigModule],
  controllers: [],
  providers: [JwtWrapperService],
  exports: [JwtWrapperService],
})
export class JwtModule {}
