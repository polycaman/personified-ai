import { Injectable } from "@angular/core";
import { Thinker, ThinkerResponse } from "../models/types";
import { OllamaService } from "./ollama.service";

@Injectable({
  providedIn: "root",
})
export class ThinkersService {
  private readonly thinkers: Thinker[] = [
    // 7 Deadly Sins
    {
      name: "Pride",
      type: "sin",
      archetype: "The Arrogant",
      promptModifier:
        "Respond with excessive confidence in 1-2 short sentences. Be superior and absolute.",
    },
    {
      name: "Greed",
      type: "sin",
      archetype: "The Hoarder",
      promptModifier:
        "Respond focusing on personal gain in 1-2 short sentences. What can you get from this?",
    },
    {
      name: "Lust",
      type: "sin",
      archetype: "The Passionate",
      promptModifier:
        "Respond with intense desire in 1-2 short sentences. Want it now, want it all.",
    },
    {
      name: "Envy",
      type: "sin",
      archetype: "The Comparative",
      promptModifier:
        "Respond by comparing to others in 1-2 short sentences. Focus on what others have.",
    },
    {
      name: "Gluttony",
      type: "sin",
      archetype: "The Excessive",
      promptModifier:
        "Respond with excess in 1-2 short sentences. More is always better.",
    },
    {
      name: "Wrath",
      type: "sin",
      archetype: "The Angry",
      promptModifier:
        "Respond with righteous anger in 1-2 short sentences. Be harsh and judgmental.",
    },
    {
      name: "Sloth",
      type: "sin",
      archetype: "The Apathetic",
      promptModifier:
        "Respond with minimal effort in 1-2 short sentences. Take the lazy way out.",
    },
    // 7 Heavenly Virtues
    {
      name: "Humility",
      type: "virtue",
      archetype: "The Modest",
      promptModifier:
        "Respond with modesty in 1-2 short sentences. Acknowledge limitations humbly.",
    },
    {
      name: "Charity",
      type: "virtue",
      archetype: "The Generous",
      promptModifier:
        "Respond with generosity in 1-2 short sentences. Focus on helping others.",
    },
    {
      name: "Chastity",
      type: "virtue",
      archetype: "The Pure",
      promptModifier:
        "Respond with restraint in 1-2 short sentences. Maintain appropriate boundaries.",
    },
    {
      name: "Kindness",
      type: "virtue",
      archetype: "The Compassionate",
      promptModifier:
        "Respond with compassion in 1-2 short sentences. Be genuinely understanding.",
    },
    {
      name: "Temperance",
      type: "virtue",
      archetype: "The Balanced",
      promptModifier:
        "Respond with balance in 1-2 short sentences. Give just the right amount.",
    },
    {
      name: "Patience",
      type: "virtue",
      archetype: "The Forgiving",
      promptModifier:
        "Respond with patience in 1-2 short sentences. Take time to consider carefully.",
    },
    {
      name: "Diligence",
      type: "virtue",
      archetype: "The Dedicated",
      promptModifier:
        "Respond with thoroughness in 1-2 short sentences. Be careful and precise.",
    },
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
      const draft = await this.getThinkerDraft(
        thinker,
        userMessage,
        character,
        memoryContext
      );
      return {
        thinkerType: thinker.type,
        name: thinker.name,
        draft: draft,
        weight: 1.0, // Equal weight for all thinkers
      } as ThinkerResponse;
    });

    const results = await Promise.all(promises);
    return results;
  }

  async *gatherThinkerResponsesWithStreaming(
    userMessage: string,
    character: string,
    memoryContext: string
  ): AsyncGenerator<
    { responses: ThinkerResponse[]; isComplete: boolean },
    void,
    unknown
  > {
    const responses: ThinkerResponse[] = [];

    // Initialize all thinkers with empty responses
    for (const thinker of this.thinkers) {
      responses.push({
        thinkerType: thinker.type,
        name: thinker.name,
        draft: "",
        weight: 1.0,
        isStreaming: true,
      });
    }

    // Yield initial empty state
    yield { responses: [...responses], isComplete: false };

    // Process each thinker sequentially for better streaming visibility
    for (let i = 0; i < this.thinkers.length; i++) {
      const thinker = this.thinkers[i];

      try {
        let fullContent = "";
        for await (const chunk of this.getThinkerDraftStream(
          thinker,
          userMessage,
          character,
          memoryContext
        )) {
          fullContent += chunk;
          responses[i].draft = fullContent.trim();

          // Yield current state with this thinker's updated content
          yield { responses: [...responses], isComplete: false };
        }

        // Mark this thinker as complete
        responses[i].isStreaming = false;
        responses[i].draft = fullContent.trim();

        // Yield completion state for this thinker
        yield { responses: [...responses], isComplete: false };
      } catch (error) {
        console.error(`Error streaming from ${thinker.name}:`, error);
        responses[i].draft = `[${thinker.name} response unavailable]`;
        responses[i].isStreaming = false;

        yield { responses: [...responses], isComplete: false };
      }
    }

    // Final yield with all complete
    yield { responses: [...responses], isComplete: true };
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

IMPORTANT: Provide a very brief draft response (maximum 1-2 short sentences) from your unique perspective. Be concise and focused.`;

    try {
      const response = await this.ollama.generate(userMessage, systemPrompt);
      return response.trim();
    } catch (error) {
      console.error(`Error getting draft from ${thinker.name}:`, error);
      return `[${thinker.name} response unavailable]`;
    }
  }

  private async *getThinkerDraftStream(
    thinker: Thinker,
    userMessage: string,
    character: string,
    memoryContext: string
  ): AsyncGenerator<string, void, unknown> {
    const systemPrompt = `You are the ${thinker.name} aspect (${thinker.archetype}) of the character ${character}.
${thinker.promptModifier}

Character context: ${character}
Memory context: ${memoryContext}

IMPORTANT: Provide a very brief draft response (maximum 1-2 short sentences) from your unique perspective. Be concise and focused.`;

    try {
      for await (const chunk of this.ollama.generateStream(
        userMessage,
        systemPrompt
      )) {
        yield chunk;
      }
    } catch (error) {
      console.error(`Error getting draft from ${thinker.name}:`, error);
      yield `[${thinker.name} response unavailable]`;
    }
  }

  getThinkers(): Thinker[] {
    return [...this.thinkers];
  }
}
