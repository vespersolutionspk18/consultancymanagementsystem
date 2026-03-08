import { type AIModelConfig, ModelProvider } from './ai-models-types.const';

export const GEMINI_MODELS: AIModelConfig[] = [
  {
    modelId: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash (Stable)',
    description:
      'Stable Gemini 2.5 Flash with 1M token context, best price-performance for document analysis',
    provider: ModelProvider.GEMINI,
    inputCostPer1kTokensInCents: 0, // Free tier
    outputCostPer1kTokensInCents: 0, // Free tier
    contextWindowTokens: 1048576, // 1M tokens
    maxOutputTokens: 65536,
    supportedFileTypes: [
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/html',
      'text/csv',
      'application/json',
    ],
    nativeCapabilities: {
      webSearch: false,
    },
  },
  {
    modelId: 'gemini-2.5-flash-preview-05-20',
    label: 'Gemini 2.5 Flash Preview',
    description:
      'Preview version of Gemini 2.5 Flash with thinking capabilities',
    provider: ModelProvider.GEMINI,
    inputCostPer1kTokensInCents: 0, // Free tier
    outputCostPer1kTokensInCents: 0, // Free tier
    contextWindowTokens: 1048576, // 1M tokens
    maxOutputTokens: 65536,
    supportedFileTypes: [
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/html',
      'text/csv',
      'application/json',
    ],
    nativeCapabilities: {
      webSearch: false,
    },
  },
  {
    modelId: 'gemini-2.0-flash',
    label: 'Gemini 2.0 Flash',
    description:
      'Fast and efficient Gemini model with strong multimodal capabilities',
    provider: ModelProvider.GEMINI,
    inputCostPer1kTokensInCents: 0, // Free tier
    outputCostPer1kTokensInCents: 0, // Free tier
    contextWindowTokens: 1048576, // 1M tokens
    maxOutputTokens: 8192,
    supportedFileTypes: [
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/html',
      'text/csv',
      'application/json',
    ],
    nativeCapabilities: {
      webSearch: false,
    },
  },
  {
    modelId: 'gemini-1.5-flash',
    label: 'Gemini 1.5 Flash',
    description:
      'Fast and versatile model optimized for diverse tasks with 1M context',
    provider: ModelProvider.GEMINI,
    inputCostPer1kTokensInCents: 0, // Free tier
    outputCostPer1kTokensInCents: 0, // Free tier
    contextWindowTokens: 1048576, // 1M tokens
    maxOutputTokens: 8192,
    supportedFileTypes: [
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/html',
      'text/csv',
      'application/json',
    ],
    nativeCapabilities: {
      webSearch: false,
    },
  },
  {
    modelId: 'gemini-1.5-pro',
    label: 'Gemini 1.5 Pro',
    description:
      'Most capable Gemini model for complex reasoning and analysis',
    provider: ModelProvider.GEMINI,
    inputCostPer1kTokensInCents: 0.125, // $1.25 per 1M tokens
    outputCostPer1kTokensInCents: 0.5, // $5 per 1M tokens
    contextWindowTokens: 2097152, // 2M tokens
    maxOutputTokens: 8192,
    supportedFileTypes: [
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/html',
      'text/csv',
      'application/json',
    ],
    nativeCapabilities: {
      webSearch: false,
    },
  },
];
