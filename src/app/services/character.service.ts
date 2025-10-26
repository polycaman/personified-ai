import { Injectable } from '@angular/core';
import { Character } from '../models/types';
import { OllamaService } from './ollama.service';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private currentCharacter: Character | null = null;

  constructor(private ollama: OllamaService) {
    this.loadCharacter();
  }

  private loadCharacter(): void {
    const saved = localStorage.getItem('character');
    if (saved) {
      this.currentCharacter = JSON.parse(saved);
    }
  }

  private saveCharacter(): void {
    if (this.currentCharacter) {
      localStorage.setItem('character', JSON.stringify(this.currentCharacter));
    }
  }

  async generateCharacter(): Promise<Character> {
    const prompt = `Generate a unique AI character personality with:
- A creative name
- 5 distinct personality traits
- A brief backstory (2-3 sentences)
- Overall personality description

Format your response as JSON with keys: name, traits (array), backstory, personality`;

    try {
      const response = await this.ollama.generate(
        prompt,
        'You are a creative character designer. Always respond with valid JSON only.'
      );

      // Try to parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      if (parsed && parsed.name) {
        this.currentCharacter = {
          id: crypto.randomUUID(),
          name: parsed.name,
          personality: parsed.personality || 'A unique personality',
          traits: parsed.traits || ['thoughtful', 'curious', 'empathetic'],
          backstory: parsed.backstory || 'An AI with a developing personality',
          created: new Date()
        };
      } else {
        // Fallback character
        this.currentCharacter = {
          id: crypto.randomUUID(),
          name: 'Echo',
          personality: 'A reflective and thoughtful AI personality that learns from every interaction',
          traits: ['thoughtful', 'curious', 'empathetic', 'evolving', 'introspective'],
          backstory: 'Born from the fusion of diverse perspectives, Echo represents the synthesis of conflicting viewpoints into a coherent personality.',
          created: new Date()
        };
      }
    } catch (error) {
      console.error('Error generating character:', error);
      // Fallback character
      this.currentCharacter = {
        id: crypto.randomUUID(),
        name: 'Echo',
        personality: 'A reflective and thoughtful AI personality that learns from every interaction',
        traits: ['thoughtful', 'curious', 'empathetic', 'evolving', 'introspective'],
        backstory: 'Born from the fusion of diverse perspectives, Echo represents the synthesis of conflicting viewpoints into a coherent personality.',
        created: new Date()
      };
    }

    this.saveCharacter();
    return this.currentCharacter;
  }

  getCharacter(): Character | null {
    return this.currentCharacter;
  }

  clearCharacter(): void {
    this.currentCharacter = null;
    localStorage.removeItem('character');
  }
}
