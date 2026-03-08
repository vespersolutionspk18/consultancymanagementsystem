import { Injectable, Logger } from '@nestjs/common';

import { createGoogleGenerativeAI } from '@ai-sdk/google';

import { CMSConfigService } from 'src/engine/core-modules/cms-config/cms-config.service';

// Using 'any' for model type due to AI SDK version differences between providers
// The Google SDK uses LanguageModelV3 while others use LanguageModelV2
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeminiModel = any;

interface GeminiKeyState {
  key: string;
  isRateLimited: boolean;
  rateLimitedUntil: number | null;
  usageCount: number;
  lastUsed: number;
}

@Injectable()
export class GeminiKeyRotationService {
  private readonly logger = new Logger(GeminiKeyRotationService.name);
  private keyStates: GeminiKeyState[] = [];
  private currentKeyIndex = 0;

  constructor(private cmsConfigService: CMSConfigService) {
    this.initializeKeys();
  }

  private initializeKeys(): void {
    const keysString = this.cmsConfigService.get('GEMINI_API_KEYS');

    if (!keysString) {
      this.logger.warn('No Gemini API keys configured (GEMINI_API_KEYS)');

      return;
    }

    const keys = keysString
      .split(',')
      .map((key) => key.trim())
      .filter((key) => key.length > 0);

    this.keyStates = keys.map((key) => ({
      key,
      isRateLimited: false,
      rateLimitedUntil: null,
      usageCount: 0,
      lastUsed: 0,
    }));

    this.logger.log(`Initialized ${this.keyStates.length} Gemini API keys`);
  }

  hasAvailableKeys(): boolean {
    return this.keyStates.some((state) => !this.isKeyRateLimited(state));
  }

  private isKeyRateLimited(state: GeminiKeyState): boolean {
    if (!state.isRateLimited) {
      return false;
    }

    // Check if rate limit has expired (default: 60 seconds)
    if (state.rateLimitedUntil && Date.now() > state.rateLimitedUntil) {
      state.isRateLimited = false;
      state.rateLimitedUntil = null;

      return false;
    }

    return true;
  }

  getNextAvailableKey(): string | null {
    if (this.keyStates.length === 0) {
      return null;
    }

    // Try to find an available key starting from current index
    const startIndex = this.currentKeyIndex;

    for (let i = 0; i < this.keyStates.length; i++) {
      const index = (startIndex + i) % this.keyStates.length;
      const state = this.keyStates[index];

      if (!this.isKeyRateLimited(state)) {
        this.currentKeyIndex = (index + 1) % this.keyStates.length;
        state.usageCount++;
        state.lastUsed = Date.now();

        return state.key;
      }
    }

    // All keys are rate limited, find the one that will be available soonest
    const soonestAvailable = this.keyStates.reduce((prev, curr) =>
      (prev.rateLimitedUntil || Infinity) < (curr.rateLimitedUntil || Infinity)
        ? prev
        : curr,
    );

    this.logger.warn(
      `All Gemini API keys are rate limited. Next available in ${Math.ceil(((soonestAvailable.rateLimitedUntil || Date.now()) - Date.now()) / 1000)}s`,
    );

    return null;
  }

  markKeyAsRateLimited(key: string, retryAfterSeconds = 60): void {
    const state = this.keyStates.find((s) => s.key === key);

    if (state) {
      state.isRateLimited = true;
      state.rateLimitedUntil = Date.now() + retryAfterSeconds * 1000;
      this.logger.warn(
        `Gemini API key marked as rate limited for ${retryAfterSeconds}s`,
      );
    }
  }

  createGeminiProvider(modelId: string): GeminiModel | null {
    const apiKey = this.getNextAvailableKey();

    if (!apiKey) {
      return null;
    }

    const google = createGoogleGenerativeAI({
      apiKey,
    });

    return google(modelId);
  }

  // Create a provider that will automatically retry with a new key on rate limit
  createGeminiProviderWithRotation(modelId: string): {
    model: GeminiModel | null;
    apiKey: string | null;
  } {
    const apiKey = this.getNextAvailableKey();

    if (!apiKey) {
      return { model: null, apiKey: null };
    }

    const google = createGoogleGenerativeAI({
      apiKey,
    });

    return {
      model: google(modelId),
      apiKey,
    };
  }

  getKeyStats(): {
    total: number;
    available: number;
    rateLimited: number;
  } {
    const available = this.keyStates.filter(
      (s) => !this.isKeyRateLimited(s),
    ).length;

    return {
      total: this.keyStates.length,
      available,
      rateLimited: this.keyStates.length - available,
    };
  }

  // Refresh keys from config (useful if keys are updated)
  refreshKeys(): void {
    this.initializeKeys();
  }
}
