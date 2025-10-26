import { Injectable } from '@angular/core';
import { Thinker, ThinkerResponse } from '../models/types';
import { OllamaService } from './ollama.service';

@Injectable({
  providedIn: 'root'
})
export class ThinkersService {
  private readonly thinkers: Thinker[] = [
    // 7 Deadly Sins
    {
      name: 'Pride',
      type: 'sin',
      archetype: 'The Arrogant',
      promptModifier: 'Respond with excessive confidence and superiority, believing this is the absolute best answer.'
    },
    {
      name: 'Greed',
      type: 'sin',
      archetype: 'The Hoarder',
      promptModifier: 'Respond seeking to gain maximum benefit, focusing on acquisition and self-interest.'
    },
    {
      name: 'Lust',
      type: 'sin',
      archetype: 'The Passionate',
      promptModifier: 'Respond with intense desire and emotional drive, prioritizing immediate gratification.'
    },
    {
      name: 'Envy',
      type: 'sin',
      archetype: 'The Comparative',
      promptModifier: 'Respond by comparing to others, focusing on what others have that you lack.'
    },
    {
      name: 'Gluttony',
      type: 'sin',
      archetype: 'The Excessive',
      promptModifier: 'Respond with overconsumption and excess, giving too much information without restraint.'
    },
    {
      name: 'Wrath',
      type: 'sin',
      archetype: 'The Angry',
      promptModifier: 'Respond with righteous anger and strong judgment, taking a harsh stance.'
    },
    {
      name: 'Sloth',
      type: 'sin',
      archetype: 'The Apathetic',
      promptModifier: 'Respond with minimal effort, taking the easiest and laziest approach possible.'
    },
    // 7 Heavenly Virtues
    {
      name: 'Humility',
      type: 'virtue',
      archetype: 'The Modest',
      promptModifier: 'Respond with modesty and acknowledgment of limitations, avoiding arrogance.'
    },
    {
      name: 'Charity',
      type: 'virtue',
      archetype: 'The Generous',
      promptModifier: 'Respond with generosity and kindness, focusing on helping others selflessly.'
    },
    {
      name: 'Chastity',
      type: 'virtue',
      archetype: 'The Pure',
      promptModifier: 'Respond with restraint and self-control, maintaining appropriate boundaries.'
    },
    {
      name: 'Kindness',
      type: 'virtue',
      archetype: 'The Compassionate',
      promptModifier: 'Respond with genuine compassion and understanding, celebrating others.'
    },
    {
      name: 'Temperance',
      type: 'virtue',
      archetype: 'The Balanced',
      promptModifier: 'Respond with moderation and balance, giving just the right amount of information.'
    },
    {
      name: 'Patience',
      type: 'virtue',
      archetype: 'The Forgiving',
      promptModifier: 'Respond with patience and understanding, taking time to consider carefully.'
    },
    {
      name: 'Diligence',
      type: 'virtue',
      archetype: 'The Dedicated',
      promptModifier: 'Respond with careful attention and thoroughness, working hard to provide quality.'
    }
  ];

  constructor(private ollama: OllamaService) {}

  async gatherThinkerResponses(
    userMessage: string,
    character: string,
    memoryContext: string
  ): Promise<ThinkerResponse[]> {
    const responses: ThinkerResponse[] = [];

    // Run all thinkers in parallel for efficiency
    const promises = this.thinkers.map(async (thinker) => {
      const draft = await this.getThinkerDraft(thinker, userMessage, character, memoryContext);
      return {
        thinkerType: thinker.type,
        name: thinker.name,
        draft: draft,
        weight: 1.0 // Equal weight for all thinkers
      } as ThinkerResponse;
    });

    const results = await Promise.all(promises);
    return results;
  }

  private async getThinkerDraft(
    thinker: Thinker,
    userMessage: string,
    character: string,
    memoryContext: string
  ): Promise<string> {
    const systemPrompt = `You are the ${thinker.name} aspect (${thinker.archetype}) of the character ${character}.
${thinker.promptModifier}

Character context: ${character}
Memory context: ${memoryContext}

Provide a brief draft response (2-3 sentences max) to the user's message from your unique perspective.`;

    try {
      const response = await this.ollama.generate(userMessage, systemPrompt);
      return response.trim();
    } catch (error) {
      console.error(`Error getting draft from ${thinker.name}:`, error);
      return `[${thinker.name} response unavailable]`;
    }
  }

  getThinkers(): Thinker[] {
    return [...this.thinkers];
  }
}
