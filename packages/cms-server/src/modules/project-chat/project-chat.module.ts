import { Module } from '@nestjs/common';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { AiChatModule } from 'src/engine/metadata-modules/ai/ai-chat/ai-chat.module';
import { AiModelsModule } from 'src/engine/metadata-modules/ai/ai-models/ai-models.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

import { ProjectChatController } from './controllers/project-chat.controller';
import { ProjectChatService } from './services/project-chat.service';

@Module({
  imports: [AuthModule, AiChatModule, AiModelsModule, WorkspaceCacheStorageModule],
  controllers: [ProjectChatController],
  providers: [ProjectChatService],
  exports: [ProjectChatService],
})
export class ProjectChatModule {}
