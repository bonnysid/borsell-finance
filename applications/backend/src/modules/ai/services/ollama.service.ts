import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerateResponse, Ollama } from 'ollama';

@Injectable()
export class OllamaService {
  private readonly ollama: Ollama;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('OLLAMA_URL', 'http://localhost:11434');
    this.model = this.configService.get<string>('AI_MODEL', 'llama3');

    this.ollama = new Ollama({ host });
  }

  async generateResponse(prompt: string, context?: string): Promise<GenerateResponse> {
    const fullPrompt = context ? `Context: ${context}\n\nQuestion: ${prompt}` : prompt;
    const response = await this.ollama.generate({ model: this.model, prompt: fullPrompt });
    return response;
  }
}
