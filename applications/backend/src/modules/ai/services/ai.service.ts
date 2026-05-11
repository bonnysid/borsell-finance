import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Message } from 'ollama';

import { OllamaService } from '@/modules/ai/services/ollama.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly provider: string;
  private readonly model: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly ollamaService: OllamaService,
  ) {
    this.provider = this.configService.get<string>('AI_PROVIDER', 'ollama');
    this.model = this.configService.get<string>('AI_MODEL', 'llama3');
  }

  async generateResponse(prompt: string, context?: string): Promise<string> {
    try {
      this.logger.log(`Generating response [${this.provider}/${this.model}]`);

      if (this.provider === 'ollama') {
        return await this.ollamaService.generate(prompt, context);
      }
    } catch (e) {
      this.logger.error(`Failed to generate response`, e);
      return 'Error connecting to AI.';
    }

    return 'AI provider not configured or not supported.';
  }

  async chatWithHistory(messages: Message[], system?: string): Promise<string> {
    try {
      this.logger.log(`Chat with history [${this.provider}/${this.model}], messages: ${messages.length}`);

      if (this.provider === 'ollama') {
        return await this.ollamaService.chat(messages, system);
      }
    } catch (e) {
      this.logger.error(`Failed to chat with history`, e);
      return 'Error connecting to AI.';
    }

    return 'AI provider not configured or not supported.';
  }

  async analyzeSentiment(text: string): Promise<'positive' | 'negative' | 'neutral'> {
    const prompt = `Analyze the sentiment of the following financial text. Reply with ONLY one word: positive, negative, or neutral.\n\nText: ${text}`;
    const response = await this.generateResponse(prompt);
    const sentiment = response.toLowerCase().trim();

    if (sentiment.includes('positive')) return 'positive';
    if (sentiment.includes('negative')) return 'negative';
    return 'neutral';
  }
}
