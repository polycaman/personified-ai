import { Injectable } from '@angular/core';
import { Memory } from '../models/types';
import { OllamaService } from './ollama.service';

@Injectable({
  providedIn: 'root'
})
export class MemoryService {
  private memories: Memory[] = [];
  private readonly MAX_MEMORIES = 50;

  constructor(private ollama: OllamaService) {
    this.loadMemories();
  }

  private loadMemories(): void {
    const saved = localStorage.getItem('memories');
    if (saved) {
      this.memories = JSON.parse(saved);
      // Convert string dates back to Date objects
      this.memories = this.memories.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
    }
  }

  private saveMemories(): void {
    localStorage.setItem('memories', JSON.stringify(this.memories));
  }

  async summarizeInteraction(
    userMessage: string,
    assistantResponse: string,
    character: string
  ): Promise<void> {
    const prompt = `Summarize this conversation interaction into a brief memory (1-2 sentences) that captures:
1. The key topic or question
2. The essence of how the character responded
3. Any important context for future interactions

User: ${userMessage}
Assistant: ${assistantResponse}

Provide only the summary, nothing else.`;

    try {
      const summary = await this.ollama.generate(
        prompt,
        `You are creating a memory summary for the character ${character}. Be concise and focus on behavioral patterns.`
      );

      const memory: Memory = {
        id: crypto.randomUUID(),
        summary: summary.trim(),
        context: `User asked about: "${userMessage.substring(0, 50)}..."`,
        timestamp: new Date(),
        importance: this.calculateImportance(userMessage, assistantResponse)
      };

      this.memories.unshift(memory);

      // Keep only the most important memories
      if (this.memories.length > this.MAX_MEMORIES) {
        this.memories.sort((a, b) => b.importance - a.importance);
        this.memories = this.memories.slice(0, this.MAX_MEMORIES);
      }

      this.saveMemories();
    } catch (error) {
      console.error('Error summarizing interaction:', error);
    }
  }

  private calculateImportance(userMessage: string, assistantResponse: string): number {
    // Simple importance calculation based on length and content
    let importance = 0.5;

    // Longer interactions might be more important
    const totalLength = userMessage.length + assistantResponse.length;
    if (totalLength > 500) importance += 0.2;

    // Questions might be more important
    if (userMessage.includes('?')) importance += 0.1;

    // Emotional keywords increase importance
    const emotionalKeywords = ['feel', 'think', 'believe', 'remember', 'why', 'how'];
    const lowerMessage = userMessage.toLowerCase();
    for (const keyword of emotionalKeywords) {
      if (lowerMessage.includes(keyword)) {
        importance += 0.05;
      }
    }

    return Math.min(importance, 1.0);
  }

  getRecentMemories(count: number = 10): Memory[] {
    return this.memories
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, count);
  }

  getMemoryContext(count: number = 5): string {
    const recentMemories = this.getRecentMemories(count);
    
    if (recentMemories.length === 0) {
      return 'No previous memories.';
    }

    return recentMemories
      .map(m => `- ${m.summary}`)
      .join('\n');
  }

  getAllMemories(): Memory[] {
    return [...this.memories];
  }

  clearMemories(): void {
    this.memories = [];
    localStorage.removeItem('memories');
  }
}
