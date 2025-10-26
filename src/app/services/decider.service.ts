import { Injectable } from '@angular/core';
import { ThinkerResponse } from '../models/types';
import { OllamaService } from './ollama.service';

@Injectable({
  providedIn: 'root'
})
export class DeciderService {
  constructor(private ollama: OllamaService) {}

  async fuseResponses(
    thinkerResponses: ThinkerResponse[],
    userMessage: string,
    character: string,
    memoryContext: string
  ): Promise<string> {
    // Create a summary of all thinker perspectives
    const sinPerspectives = thinkerResponses
      .filter(r => r.thinkerType === 'sin')
      .map(r => `${r.name}: ${r.draft}`)
      .join('\n');

    const virtuePerspectives = thinkerResponses
      .filter(r => r.thinkerType === 'virtue')
      .map(r => `${r.name}: ${r.draft}`)
      .join('\n');

    const systemPrompt = `You are the Decider, the 15th voice that synthesizes all perspectives into a coherent, balanced response.

Character: ${character}
Memory Context: ${memoryContext}

You have received perspectives from 14 different aspects:

SINS (shadow aspects):
${sinPerspectives}

VIRTUES (light aspects):
${virtuePerspectives}

Your role: Synthesize these 14 perspectives into a single, natural, coherent response that:
1. Reflects the character's personality
2. Balances the sins and virtues appropriately
3. Considers the memory context
4. Sounds natural and human-like, not like a list or analysis
5. Maintains consistency with past behavior

Respond directly as the character would, without explaining your process.`;

    try {
      const fusedResponse = await this.ollama.generate(userMessage, systemPrompt);
      return fusedResponse.trim();
    } catch (error) {
      console.error('Error in decider fusion:', error);
      // Fallback: simple concatenation if fusion fails
      return this.simpleFusion(thinkerResponses);
    }
  }

  private simpleFusion(responses: ThinkerResponse[]): string {
    // Simple fallback: take a balanced sample
    const virtues = responses.filter(r => r.thinkerType === 'virtue');
    const sins = responses.filter(r => r.thinkerType === 'sin');
    
    if (virtues.length > 0 && sins.length > 0) {
      return `${virtues[0].draft} ${sins[0].draft}`;
    }
    
    return responses[0]?.draft || 'I need a moment to think about that.';
  }
}
