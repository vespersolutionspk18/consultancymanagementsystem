import { Injectable, Logger } from '@nestjs/common';

import { streamText } from 'ai';
import { v4 as uuidV4 } from 'uuid';

import { GlobalWorkspaceOrmManager } from 'src/engine/cms-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/cms-orm/utils/build-system-auth-context.util';
import { FileContentExtractionService } from 'src/engine/metadata-modules/ai/ai-chat/services/file-content-extraction.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import {
  ProjectChatMessage,
  ProjectChatSelectedFile,
  ProjectChatWorkspaceEntity,
} from 'src/modules/project-chat/standard-objects/project-chat.workspace-entity';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';

const GEMINI_CHAT_MODEL = 'gemini-2.5-flash';
const MAX_SELECTED_FILES = 5;
const MAX_RETRY_ATTEMPTS = 3;

interface StreamChatOptions {
  chatId: string;
  userMessage: string;
  workspaceId: string;
}

interface CreateChatOptions {
  projectId: string;
  title?: string;
  selectedFileIds?: string[];
  workspaceId: string;
}

@Injectable()
export class ProjectChatService {
  private readonly logger = new Logger(ProjectChatService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly fileContentExtractionService: FileContentExtractionService,
    private readonly aiModelRegistryService: AiModelRegistryService,
  ) {}

  async createChat(options: CreateChatOptions): Promise<ProjectChatWorkspaceEntity> {
    const { projectId, title, selectedFileIds, workspaceId } = options;

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const projectChatRepository =
          await this.globalWorkspaceOrmManager.getRepository<ProjectChatWorkspaceEntity>(
            workspaceId,
            'projectChat',
          );

        // Get selected files info if provided
        let selectedFiles: ProjectChatSelectedFile[] = [];

        if (selectedFileIds && selectedFileIds.length > 0) {
          selectedFiles = await this.getSelectedFilesInfo(
            selectedFileIds.slice(0, MAX_SELECTED_FILES),
            workspaceId,
          );
        }

        const chat = projectChatRepository.create({
          projectId,
          title: title || 'New Chat',
          messages: [],
          selectedFiles,
        });

        await projectChatRepository.save(chat);

        this.logger.log(`Created new project chat ${chat.id} for project ${projectId}`);

        return chat;
      },
    );
  }

  async getChat(chatId: string, workspaceId: string): Promise<ProjectChatWorkspaceEntity | null> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const projectChatRepository =
          await this.globalWorkspaceOrmManager.getRepository<ProjectChatWorkspaceEntity>(
            workspaceId,
            'projectChat',
          );

        return projectChatRepository.findOne({
          where: { id: chatId },
        });
      },
    );
  }

  async getChatsByProject(projectId: string, workspaceId: string): Promise<ProjectChatWorkspaceEntity[]> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const projectChatRepository =
          await this.globalWorkspaceOrmManager.getRepository<ProjectChatWorkspaceEntity>(
            workspaceId,
            'projectChat',
          );

        return projectChatRepository.find({
          where: { projectId },
          order: { createdAt: 'DESC' },
        });
      },
    );
  }

  async updateSelectedFiles(
    chatId: string,
    selectedFileIds: string[],
    workspaceId: string,
  ): Promise<ProjectChatWorkspaceEntity> {
    this.logger.log(`updateSelectedFiles called - chatId: ${chatId}, fileIds: ${JSON.stringify(selectedFileIds)}`);

    const authContext = buildSystemAuthContext(workspaceId);

    // Get selected files info FIRST (outside the chat update context)
    const selectedFiles = await this.getSelectedFilesInfo(
      selectedFileIds.slice(0, MAX_SELECTED_FILES),
      workspaceId,
    );

    this.logger.log(`Got selectedFiles info: ${JSON.stringify(selectedFiles)}`);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const projectChatRepository =
          await this.globalWorkspaceOrmManager.getRepository<ProjectChatWorkspaceEntity>(
            workspaceId,
            'projectChat',
          );

        const chat = await projectChatRepository.findOne({
          where: { id: chatId },
        });

        if (!chat) {
          throw new Error(`Chat ${chatId} not found`);
        }

        chat.selectedFiles = selectedFiles;
        await projectChatRepository.save(chat);

        this.logger.log(`Saved chat with ${selectedFiles.length} selected files`);

        return chat;
      },
    );
  }

  async streamChatResponse(options: StreamChatOptions): Promise<{
    stream: ReturnType<typeof streamText>;
    messageId: string;
  }> {
    const { chatId, userMessage, workspaceId } = options;

    const authContext = buildSystemAuthContext(workspaceId);

    const chat = await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const projectChatRepository =
          await this.globalWorkspaceOrmManager.getRepository<ProjectChatWorkspaceEntity>(
            workspaceId,
            'projectChat',
          );

        const chatRecord = await projectChatRepository.findOne({
          where: { id: chatId },
        });

        if (!chatRecord) {
          throw new Error(`Chat ${chatId} not found`);
        }

        // Add user message
        const userMessageEntry: ProjectChatMessage = {
          id: uuidV4(),
          role: 'user',
          content: userMessage,
          timestamp: new Date().toISOString(),
        };

        const messages = [...(chatRecord.messages || []), userMessageEntry];
        chatRecord.messages = messages;
        await projectChatRepository.save(chatRecord);

        return chatRecord;
      },
    );

    // Build context from selected files
    this.logger.log(`=== STREAM CHAT RESPONSE ===`);
    this.logger.log(`Chat ID: ${chatId}`);
    this.logger.log(`Chat selectedFiles from DB: ${JSON.stringify(chat.selectedFiles)}`);
    this.logger.log(`Building context from ${(chat.selectedFiles || []).length} selected files`);
    if (chat.selectedFiles && chat.selectedFiles.length > 0) {
      this.logger.log(`Selected files details: ${JSON.stringify(chat.selectedFiles.map(f => ({ name: f.name, fullPath: f.fullPath, mimeType: f.mimeType })))}`);
    } else {
      this.logger.warn(`NO SELECTED FILES in chat! This is why the AI has no file context.`);
    }

    let fileContext: { textContext: string; images: Array<{ filename: string; mimeType: string; base64: string }> };

    try {
      fileContext = await this.buildFileContext(
        chat.selectedFiles || [],
        workspaceId,
      );
    } catch (fileError) {
      this.logger.error(`File context extraction failed:`, fileError);
      // Don't crash - just proceed without file context
      fileContext = { textContext: '', images: [] };
    }

    this.logger.log(`File context built - textContext length: ${fileContext.textContext.length}, images: ${fileContext.images.length}`);

    // Get Gemini model with rotation
    const geminiModel = await this.getGeminiModelWithRetry();

    if (!geminiModel) {
      const keyStats = this.aiModelRegistryService.getGeminiKeyStats();
      this.logger.error(`Gemini key stats: total=${keyStats.total}, available=${keyStats.available}, rateLimited=${keyStats.rateLimited}`);
      throw new Error(`No Gemini API keys available. Key stats: ${JSON.stringify(keyStats)}. Make sure GEMINI_API_KEYS is set in .env and server was restarted.`);
    }

    const systemPrompt = this.buildSystemPrompt(fileContext);
    const messageId = uuidV4();

    // Convert messages to AI SDK format
    const aiMessages = this.convertMessagesToAIFormat(chat.messages || []);

    this.logger.log(`Starting streamText with model: ${geminiModel.model.modelId}`);
    this.logger.log(`System prompt length: ${systemPrompt.length}, messages count: ${aiMessages.length}`);

    let stream;

    try {
      stream = streamText({
        model: geminiModel.model.model,
        system: systemPrompt,
        messages: aiMessages,
      });
    } catch (streamError) {
      this.logger.error(`streamText failed to initialize:`, streamError);
      throw new Error(`Failed to start AI stream: ${streamError instanceof Error ? streamError.message : 'Unknown error'}`);
    }

    // Save assistant message after streaming completes
    // Use Promise.resolve to convert PromiseLike to Promise for .catch() support
    Promise.resolve(stream.text)
      .then(async (fullText) => {
        await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
          authContext,
          async () => {
            const projectChatRepository =
              await this.globalWorkspaceOrmManager.getRepository<ProjectChatWorkspaceEntity>(
                workspaceId,
                'projectChat',
              );

            const updatedChat = await projectChatRepository.findOne({
              where: { id: chatId },
            });

            if (updatedChat) {
              const assistantMessage: ProjectChatMessage = {
                id: messageId,
                role: 'assistant',
                content: fullText,
                timestamp: new Date().toISOString(),
              };

              updatedChat.messages = [...(updatedChat.messages || []), assistantMessage];
              await projectChatRepository.save(updatedChat);

              this.logger.log(`Saved assistant response for chat ${chatId}`);
            }
          },
        );
      })
      .catch((error: Error) => {
        this.logger.error(`Failed to save assistant response:`, error);
      });

    return { stream, messageId };
  }

  private async getGeminiModelWithRetry(attempts = 0): Promise<{
    model: NonNullable<ReturnType<typeof this.aiModelRegistryService.getGeminiModelWithRotation>>;
  } | null> {
    if (attempts >= MAX_RETRY_ATTEMPTS) {
      this.logger.warn('Max retry attempts reached for Gemini model');

      return null;
    }

    const result = this.aiModelRegistryService.getGeminiModelWithRotation(GEMINI_CHAT_MODEL);

    if (!result) {
      this.logger.warn(`Attempt ${attempts + 1}: No available Gemini model, retrying...`);
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempts + 1)));

      return this.getGeminiModelWithRetry(attempts + 1);
    }

    return { model: result };
  }

  private async getSelectedFilesInfo(
    fileIds: string[],
    workspaceId: string,
  ): Promise<ProjectChatSelectedFile[]> {
    this.logger.log(`getSelectedFilesInfo called with fileIds: ${JSON.stringify(fileIds)}`);

    if (!fileIds || fileIds.length === 0) {
      this.logger.log('No file IDs provided');
      return [];
    }

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const attachmentRepository =
          await this.globalWorkspaceOrmManager.getRepository<AttachmentWorkspaceEntity>(
            workspaceId,
            'attachment',
          );

        // Use In operator for better query
        const attachments = await attachmentRepository.find({
          where: fileIds.map(id => ({ id })),
        });

        this.logger.log(`Found ${attachments.length} attachments for ${fileIds.length} file IDs`);

        const result = attachments.map(attachment => {
          this.logger.log(`Attachment: id=${attachment.id}, name=${attachment.name}, fullPath=${attachment.fullPath}, type=${attachment.type}`);
          return {
            attachmentId: attachment.id,
            name: attachment.name || 'Unnamed file',
            fullPath: attachment.fullPath || '',
            mimeType: attachment.type || undefined,
          };
        });

        return result;
      },
    );
  }

  private async buildFileContext(
    selectedFiles: ProjectChatSelectedFile[],
    workspaceId: string,
  ): Promise<{
    textContext: string;
    images: Array<{ filename: string; mimeType: string; base64: string }>;
  }> {
    if (!selectedFiles || selectedFiles.length === 0) {
      this.logger.log('[BUILD_CONTEXT] No selected files');
      return { textContext: '', images: [] };
    }

    const files = selectedFiles.map(file => ({
      fullPath: file.fullPath,
      mimeType: file.mimeType,
    }));

    this.logger.log(`[BUILD_CONTEXT] Processing ${files.length} files: ${JSON.stringify(files.map(f => f.fullPath))}`);

    let extractedFiles: Map<string, import('src/engine/metadata-modules/ai/ai-chat/services/file-content-extraction.service').FileExtractionResult>;

    try {
      // Add timeout for the entire extraction process
      const extractionPromise = this.fileContentExtractionService.extractMultipleFiles(
        files,
        workspaceId,
      );

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('File extraction timed out after 180 seconds')), 180000);
      });

      extractedFiles = await Promise.race([extractionPromise, timeoutPromise]);

      this.logger.log(`[BUILD_CONTEXT] Extraction complete for ${extractedFiles.size} files`);
    } catch (extractionError) {
      this.logger.error(`[BUILD_CONTEXT] Extraction failed:`, extractionError);
      // Return empty context instead of failing the whole request
      return {
        textContext: `[File extraction failed: ${extractionError instanceof Error ? extractionError.message : 'Unknown error'}. Please try again or contact support.]`,
        images: [],
      };
    }

    // Log extraction results
    for (const [filePath, result] of extractedFiles) {
      if (result.success) {
        this.logger.log(`[BUILD_CONTEXT] OK ${filePath}: ${result.data?.chunks?.length || 0} chunks`);
      } else {
        this.logger.error(`[BUILD_CONTEXT] FAIL ${filePath}: ${result.error}`);
      }
    }

    try {
      return this.fileContentExtractionService.buildContextFromExtractedFiles(
        extractedFiles,
      );
    } catch (buildError) {
      this.logger.error(`[BUILD_CONTEXT] buildContextFromExtractedFiles failed:`, buildError);
      return { textContext: '', images: [] };
    }
  }

  private buildSystemPrompt(fileContext: {
    textContext: string;
    images: Array<{ filename: string; mimeType: string; base64: string }>;
  }): string {
    // Check if we have any actual file content
    const hasTextContent = fileContext.textContext && fileContext.textContext.trim().length > 0;
    const hasImages = fileContext.images.length > 0;

    if (!hasTextContent && !hasImages) {
      // No files selected - be clear about this
      return `You are an AI assistant for a project management system.

IMPORTANT: No files have been selected for this chat. You do NOT have access to any project documents.
If the user asks about files or documents, politely explain that they need to select files in the file selector above the chat before you can analyze them.
Do NOT make up or hallucinate file names or content. You genuinely have no file context.

You can still help with general questions, but be clear that you cannot see or analyze any project files until they are selected.`;
    }

    const parts = [
      `You are an AI assistant helping to analyze and discuss project documents.`,
      `Be helpful, accurate, and cite specific parts of the documents when relevant.`,
      `Only discuss content that is actually present in the provided documents below. Never make up or hallucinate file names or content.`,
    ];

    if (hasTextContent) {
      parts.push(`\n\n## Document Context\n\nThe following is the actual content from the selected files:\n\n${fileContext.textContext}`);
    }

    if (hasImages) {
      parts.push(
        `\n\n## Images\n\nYou have access to ${fileContext.images.length} image(s) from the project files. Analyze them when relevant to the user's questions.`,
      );
    }

    return parts.join('\n');
  }

  private convertMessagesToAIFormat(
    messages: ProjectChatMessage[],
  ): Array<{ role: 'user' | 'assistant'; content: string }> {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  async deleteChat(chatId: string, workspaceId: string): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const projectChatRepository =
          await this.globalWorkspaceOrmManager.getRepository<ProjectChatWorkspaceEntity>(
            workspaceId,
            'projectChat',
          );

        await projectChatRepository.delete({ id: chatId });
        this.logger.log(`Deleted chat ${chatId}`);
      },
    );
  }

  async updateChatTitle(chatId: string, title: string, workspaceId: string): Promise<ProjectChatWorkspaceEntity> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const projectChatRepository =
          await this.globalWorkspaceOrmManager.getRepository<ProjectChatWorkspaceEntity>(
            workspaceId,
            'projectChat',
          );

        const chat = await projectChatRepository.findOne({
          where: { id: chatId },
        });

        if (!chat) {
          throw new Error(`Chat ${chatId} not found`);
        }

        chat.title = title;
        await projectChatRepository.save(chat);

        return chat;
      },
    );
  }
}
