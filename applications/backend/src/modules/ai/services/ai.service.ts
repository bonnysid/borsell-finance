import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly provider: string;
  private readonly ollamaUrl: string;
  private readonly model: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.provider = this.configService.get<string>('AI_PROVIDER', 'ollama');
    this.ollamaUrl = this.configService.get<string>('OLLAMA_URL', 'http://localhost:11434');
    this.model = this.configService.get<string>('AI_MODEL', 'llama3');
  }

  async generateResponse(prompt: string, context?: string): Promise<string> {
    if (this.provider === 'ollama') {
      return this.generateOllamaResponse(prompt, context);
    }

    // Fallback or other providers
    return 'AI provider not configured or not supported.';
  }

  private async generateOllamaResponse(prompt: string, context?: string): Promise<string> {
    try {
      const fullPrompt = context ? `Context: ${context}\n\nQuestion: ${prompt}` : prompt;

      const response = await firstValueFrom(
        this.httpService.post(`${this.ollamaUrl}/api/generate`, {
          model: this.model,
          prompt: fullPrompt,
          stream: false,
        })
      );

      return response.data.response;
    } catch (error) {
      this.logger.error('Failed to generate response from Ollama', error);
      return 'Error connecting to local AI. Make sure Ollama is running.';
    }
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
