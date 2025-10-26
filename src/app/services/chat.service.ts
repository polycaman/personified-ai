import { Injectable } from '@angular/core';
import { Message } from '../models/types';
import { CharacterService } from './character.service';
import { ThinkersService } from './thinkers.service';
import { DeciderService } from './decider.service';
import { MemoryService } from './memory.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messages: Message[] = [];

  constructor(
    private characterService: CharacterService,
    private thinkersService: ThinkersService,
    private deciderService: DeciderService,
    private memoryService: MemoryService
  ) {
    this.loadMessages();
  }

  private loadMessages(): void {
    const saved = localStorage.getItem('chat-messages');
    if (saved) {
      this.messages = JSON.parse(saved);
      // Convert string dates back to Date objects
      this.messages = this.messages.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
    }
  }

  private saveMessages(): void {
    // Save only messages, not the thinker responses (too large)
    const messagesToSave = this.messages.map(m => ({
      ...m,
      thinkerResponses: undefined // Don't persist thinker responses
    }));
    localStorage.setItem('chat-messages', JSON.stringify(messagesToSave));
  }

  async sendMessage(content: string): Promise<Message> {
    // Get character
    const character = this.characterService.getCharacter();
    if (!character) {
      throw new Error('No character available. Please generate a character first.');
    }

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content,
      timestamp: new Date()
    };
    this.messages.push(userMessage);
    this.saveMessages();

    // Get memory context
    const memoryContext = this.memoryService.getMemoryContext(5);

    // Step 1: Gather responses from all 14 thinkers
    const thinkerResponses = await this.thinkersService.gatherThinkerResponses(
      content,
      `${character.name}: ${character.personality}. Traits: ${character.traits.join(', ')}`,
      memoryContext
    );

    // Step 2: Use the 15th decider to fuse all responses
    const fusedResponse = await this.deciderService.fuseResponses(
      thinkerResponses,
      content,
      `${character.name}: ${character.personality}`,
      memoryContext
    );

    // Create assistant message
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: fusedResponse,
      timestamp: new Date(),
      thinkerResponses: thinkerResponses
    };
    this.messages.push(assistantMessage);
    this.saveMessages();

    // Step 3: Summarize interaction for memory (async, don't wait)
    this.memoryService.summarizeInteraction(
      content,
      fusedResponse,
      character.name
    ).catch(err => console.error('Error creating memory:', err));

    return assistantMessage;
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  clearMessages(): void {
    this.messages = [];
    localStorage.removeItem('chat-messages');
  }

  clearAll(): void {
    this.clearMessages();
    this.memoryService.clearMemories();
    this.characterService.clearCharacter();
  }
}
