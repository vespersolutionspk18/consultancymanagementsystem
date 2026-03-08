import { Injectable } from '@nestjs/common';

import { anthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI, openai } from '@ai-sdk/openai';
import { xai } from '@ai-sdk/xai';
import { type LanguageModel } from 'ai';

import { CMSConfigService } from 'src/engine/core-modules/cms-config/cms-config.service';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import {
  AI_MODELS,
  DEFAULT_FAST_MODEL,
  DEFAULT_SMART_MODEL,
  ModelProvider,
  type AIModelConfig,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-models.const';
import { ANTHROPIC_MODELS } from 'src/engine/metadata-modules/ai/ai-models/constants/anthropic-models.const';
import { GEMINI_MODELS } from 'src/engine/metadata-modules/ai/ai-models/constants/gemini-models.const';
import { OPENAI_MODELS } from 'src/engine/metadata-modules/ai/ai-models/constants/openai-models.const';
import { XAI_MODELS } from 'src/engine/metadata-modules/ai/ai-models/constants/xai-models.const';
import { GeminiKeyRotationService } from 'src/engine/metadata-modules/ai/ai-models/services/gemini-key-rotation.service';

export interface RegisteredAIModel {
  modelId: string;
  provider: ModelProvider;
  model: LanguageModel;
  doesSupportThinking?: boolean;
}

@Injectable()
export class AiModelRegistryService {
  private modelRegistry: Map<string, RegisteredAIModel> = new Map();
  private geminiKeyRotationService: GeminiKeyRotationService;

  constructor(private cmsConfigService: CMSConfigService) {
    this.geminiKeyRotationService = new GeminiKeyRotationService(
      cmsConfigService,
    );
    this.buildModelRegistry();
  }

  private buildModelRegistry(): void {
    this.modelRegistry.clear();

    const openaiApiKey = this.cmsConfigService.get('OPENAI_API_KEY');

    if (openaiApiKey) {
      this.registerOpenAIModels();
    }

    const anthropicApiKey = this.cmsConfigService.get('ANTHROPIC_API_KEY');

    if (anthropicApiKey) {
      this.registerAnthropicModels();
    }

    const xaiApiKey = this.cmsConfigService.get('XAI_API_KEY');

    if (xaiApiKey) {
      this.registerXaiModels();
    }

    // Gemini uses key rotation service which checks for GEMINI_API_KEYS
    if (this.geminiKeyRotationService.hasAvailableKeys()) {
      this.registerGeminiModels();
    }

    const openaiCompatibleBaseUrl = this.cmsConfigService.get(
      'OPENAI_COMPATIBLE_BASE_URL',
    );
    const openaiCompatibleModelNames = this.cmsConfigService.get(
      'OPENAI_COMPATIBLE_MODEL_NAMES',
    );

    if (openaiCompatibleBaseUrl && openaiCompatibleModelNames) {
      this.registerOpenAICompatibleModels(
        openaiCompatibleBaseUrl,
        openaiCompatibleModelNames,
      );
    }
  }

  private registerOpenAIModels(): void {
    OPENAI_MODELS.forEach((modelConfig) => {
      this.modelRegistry.set(modelConfig.modelId, {
        modelId: modelConfig.modelId,
        provider: ModelProvider.OPENAI,
        model: openai(modelConfig.modelId),
        doesSupportThinking: modelConfig.doesSupportThinking,
      });
    });
  }

  private registerAnthropicModels(): void {
    ANTHROPIC_MODELS.forEach((modelConfig) => {
      this.modelRegistry.set(modelConfig.modelId, {
        modelId: modelConfig.modelId,
        provider: ModelProvider.ANTHROPIC,
        model: anthropic(modelConfig.modelId),
        doesSupportThinking: modelConfig.doesSupportThinking,
      });
    });
  }

  private registerXaiModels(): void {
    XAI_MODELS.forEach((modelConfig) => {
      this.modelRegistry.set(modelConfig.modelId, {
        modelId: modelConfig.modelId,
        provider: ModelProvider.XAI,
        model: xai(modelConfig.modelId),
        doesSupportThinking: modelConfig.doesSupportThinking,
      });
    });
  }

  private registerGeminiModels(): void {
    GEMINI_MODELS.forEach((modelConfig) => {
      const geminiModel =
        this.geminiKeyRotationService.createGeminiProvider(modelConfig.modelId);

      if (geminiModel) {
        this.modelRegistry.set(modelConfig.modelId, {
          modelId: modelConfig.modelId,
          provider: ModelProvider.GEMINI,
          model: geminiModel,
          doesSupportThinking: modelConfig.doesSupportThinking,
        });
      }
    });
  }

  // Get a fresh Gemini model with potentially rotated API key
  getGeminiModelWithRotation(modelId: string): RegisteredAIModel | null {
    const { model, apiKey } =
      this.geminiKeyRotationService.createGeminiProviderWithRotation(modelId);

    if (!model || !apiKey) {
      return null;
    }

    return {
      modelId,
      provider: ModelProvider.GEMINI,
      model,
    };
  }

  // Mark a Gemini key as rate limited (call this when you get a 429 error)
  markGeminiKeyAsRateLimited(apiKey: string, retryAfterSeconds = 60): void {
    this.geminiKeyRotationService.markKeyAsRateLimited(
      apiKey,
      retryAfterSeconds,
    );
  }

  getGeminiKeyStats() {
    return this.geminiKeyRotationService.getKeyStats();
  }

  private registerOpenAICompatibleModels(
    baseUrl: string,
    modelNamesString: string,
  ): void {
    const apiKey = this.cmsConfigService.get('OPENAI_COMPATIBLE_API_KEY');
    const provider = createOpenAI({
      baseURL: baseUrl,
      apiKey: apiKey,
    });

    const modelNames = modelNamesString
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    modelNames.forEach((modelId) => {
      this.modelRegistry.set(modelId, {
        modelId,
        provider: ModelProvider.OPENAI_COMPATIBLE,
        model: provider(modelId),
      });
    });
  }

  getModel(modelId: string): RegisteredAIModel | undefined {
    return this.modelRegistry.get(modelId);
  }

  getAvailableModels(): RegisteredAIModel[] {
    return Array.from(this.modelRegistry.values());
  }

  private getFirstAvailableModelFromList(
    modelIdList: string,
  ): RegisteredAIModel | undefined {
    const modelIds = modelIdList
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    for (const modelId of modelIds) {
      const model = this.getModel(modelId);

      if (model) {
        return model;
      }
    }

    return undefined;
  }

  getDefaultSpeedModel(): RegisteredAIModel {
    const defaultModelIds = this.cmsConfigService.get(
      'DEFAULT_AI_SPEED_MODEL_ID',
    );
    let model = this.getFirstAvailableModelFromList(defaultModelIds);

    if (!model) {
      const availableModels = this.getAvailableModels();

      model = availableModels[0];
    }

    if (!model) {
      throw new AgentException(
        'No AI models are available. Please configure at least one AI provider API key (OPENAI_API_KEY, ANTHROPIC_API_KEY, or XAI_API_KEY).',
        AgentExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }

    return model;
  }

  getDefaultPerformanceModel(): RegisteredAIModel {
    const defaultModelIds = this.cmsConfigService.get(
      'DEFAULT_AI_PERFORMANCE_MODEL_ID',
    );
    let model = this.getFirstAvailableModelFromList(defaultModelIds);

    if (!model) {
      const availableModels = this.getAvailableModels();

      model = availableModels[0];
    }

    if (!model) {
      throw new AgentException(
        'No AI models are available. Please configure at least one AI provider API key (OPENAI_API_KEY, ANTHROPIC_API_KEY, or XAI_API_KEY).',
        AgentExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }

    return model;
  }

  getEffectiveModelConfig(modelId: string): AIModelConfig {
    if (modelId === DEFAULT_FAST_MODEL || modelId === DEFAULT_SMART_MODEL) {
      // getDefaultSpeedModel/getDefaultPerformanceModel will throw AgentException if no models available
      const defaultModel =
        modelId === DEFAULT_FAST_MODEL
          ? this.getDefaultSpeedModel()
          : this.getDefaultPerformanceModel();

      const modelConfig = AI_MODELS.find(
        (model) => model.modelId === defaultModel.modelId,
      );

      if (modelConfig) {
        return modelConfig;
      }

      return this.createDefaultConfigForCustomModel(defaultModel);
    }

    const predefinedModel = AI_MODELS.find(
      (model) => model.modelId === modelId,
    );

    if (predefinedModel) {
      return predefinedModel;
    }

    const registeredModel = this.getModel(modelId);

    if (registeredModel) {
      return this.createDefaultConfigForCustomModel(registeredModel);
    }

    throw new AgentException(
      `Model with ID ${modelId} not found`,
      AgentExceptionCode.AGENT_EXECUTION_FAILED,
    );
  }

  private createDefaultConfigForCustomModel(
    registeredModel: RegisteredAIModel,
  ): AIModelConfig {
    return {
      modelId: registeredModel.modelId,
      label: registeredModel.modelId,
      description: `Custom model: ${registeredModel.modelId}`,
      provider: registeredModel.provider,
      inputCostPer1kTokensInCents: 0,
      outputCostPer1kTokensInCents: 0,
      contextWindowTokens: 128000,
      maxOutputTokens: 4096,
    };
  }

  // Force refresh the registry (useful if config changes)
  refreshRegistry(): void {
    this.buildModelRegistry();
  }

  async resolveModelForAgent(agent: { modelId: string } | null) {
    const aiModel = this.getEffectiveModelConfig(
      agent?.modelId ?? DEFAULT_SMART_MODEL,
    );

    await this.validateApiKey(aiModel.provider);
    const registeredModel = this.getModel(aiModel.modelId);

    if (!registeredModel) {
      throw new AgentException(
        `Model ${aiModel.modelId} not found in registry`,
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    return registeredModel;
  }

  async validateApiKey(provider: ModelProvider): Promise<void> {
    let apiKey: string | undefined;
    let hasKeys = false;

    switch (provider) {
      case ModelProvider.OPENAI:
        apiKey = this.cmsConfigService.get('OPENAI_API_KEY');
        break;
      case ModelProvider.ANTHROPIC:
        apiKey = this.cmsConfigService.get('ANTHROPIC_API_KEY');
        break;
      case ModelProvider.XAI:
        apiKey = this.cmsConfigService.get('XAI_API_KEY');
        break;
      case ModelProvider.OPENAI_COMPATIBLE:
        apiKey = this.cmsConfigService.get('OPENAI_COMPATIBLE_API_KEY');
        break;
      case ModelProvider.GEMINI:
        // Gemini uses key rotation, check if any keys are available
        hasKeys = this.geminiKeyRotationService.hasAvailableKeys();
        if (hasKeys) {
          return; // Valid keys exist
        }
        break;
      default:
        return;
    }

    if (!apiKey && !hasKeys) {
      throw new AgentException(
        `${provider.toUpperCase()} API key not configured. Please set the appropriate environment variable.`,
        AgentExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }
  }
}
