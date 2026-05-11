import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Message, Ollama } from 'ollama';

@Injectable()
export class OllamaService {
  private readonly ollama: Ollama;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('OLLAMA_URL', 'http://localhost:11434');
    this.model = this.configService.get<string>('AI_MODEL', 'llama3');

    this.ollama = new Ollama({ host });
  }

  async generate(prompt: string, context?: string): Promise<string> {
    const fullPrompt = context ? `Context: ${context}\n\nQuestion: ${prompt}` : prompt;
    const response = await this.ollama.generate({ model: this.model, prompt: fullPrompt });
    return response.response;
  }

  async chat(messages: Message[], system?: string): Promise<string> {
    const allMessages: Message[] = system
      ? [{ role: 'system', content: system }, ...messages]
      : messages;

    const response = await this.ollama.chat({ model: this.model, messages: allMessages });
    return response.message.content;
  }
}
