import { Injectable } from "@angular/core";
import { Message, ThinkerResponse } from "../models/types";
import { CharacterService } from "./character.service";
import { ThinkersService } from "./thinkers.service";
import { DeciderService } from "./decider.service";
import { MemoryService } from "./memory.service";

@Injectable({
  providedIn: "root",
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
    const saved = localStorage.getItem("chat-messages");
    if (saved) {
      this.messages = JSON.parse(saved);
      // Convert string dates back to Date objects
      this.messages = this.messages.map((m) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
    }
  }

  private saveMessages(): void {
    // Save only messages, not the thinker responses (too large)
    const messagesToSave = this.messages.map((m) => ({
      ...m,
      thinkerResponses: undefined, // Don't persist thinker responses
    }));
    localStorage.setItem("chat-messages", JSON.stringify(messagesToSave));
  }

  async sendMessage(content: string): Promise<Message> {
    // Get character
    const character = this.characterService.getCharacter();
    if (!character) {
      throw new Error(
        "No character available. Please generate a character first."
      );
    }

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content,
      timestamp: new Date(),
    };
    this.messages.push(userMessage);
    this.saveMessages();

    // Get memory context
    const memoryContext = this.memoryService.getMemoryContext(5);

    // Step 1: Gather responses from all 14 thinkers
    const thinkerResponses = await this.thinkersService.gatherThinkerResponses(
      content,
      `${character.name}: ${
        character.personality
      }. Traits: ${character.traits.join(", ")}`,
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
      role: "assistant",
      content: fusedResponse,
      timestamp: new Date(),
      thinkerResponses: thinkerResponses,
    };
    this.messages.push(assistantMessage);
    this.saveMessages();

    // Step 3: Summarize interaction for memory (async, don't wait)
    this.memoryService
      .summarizeInteraction(content, fusedResponse, character.name)
      .catch((err) => console.error("Error creating memory:", err));

    return assistantMessage;
  }

  async *sendMessageStream(
    content: string,
    enableThinkerStreaming: boolean = false
  ): AsyncGenerator<Message, void, unknown> {
    // Get character
    const character = this.characterService.getCharacter();
    if (!character) {
      throw new Error(
        "No character available. Please generate a character first."
      );
    }

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content,
      timestamp: new Date(),
    };
    this.messages.push(userMessage);
    this.saveMessages();

    // Get memory context
    const memoryContext = this.memoryService.getMemoryContext(5);

    // Create initial assistant message
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      thinkerResponses: [],
      isStreaming: true,
    };
    this.messages.push(assistantMessage);

    let thinkerResponses: ThinkerResponse[] = [];

    try {
      if (enableThinkerStreaming) {
        // Step 1: Stream thinker responses as they complete
        for await (const thinkerState of this.thinkersService.gatherThinkerResponsesWithStreaming(
          content,
          `${character.name}: ${
            character.personality
          }. Traits: ${character.traits.join(", ")}`,
          memoryContext
        )) {
          thinkerResponses = thinkerState.responses;
          assistantMessage.thinkerResponses = thinkerState.responses;

          if (thinkerState.isComplete) {
            // Signal that thinkers phase is complete and decider phase starts
            assistantMessage.thinkersComplete = true;
          }

          yield { ...assistantMessage };

          if (thinkerState.isComplete) {
            break;
          }
        }
      } else {
        // Step 1: Gather responses from all 14 thinkers (non-streaming)
        thinkerResponses = await this.thinkersService.gatherThinkerResponses(
          content,
          `${character.name}: ${
            character.personality
          }. Traits: ${character.traits.join(", ")}`,
          memoryContext
        );

        assistantMessage.thinkerResponses = thinkerResponses;
        assistantMessage.thinkersComplete = true;
        yield { ...assistantMessage };
      }

      // Step 2: Stream the fused response
      let fullResponse = "";
      for await (const chunk of this.deciderService.fuseResponsesStream(
        thinkerResponses,
        content,
        `${character.name}: ${character.personality}`,
        memoryContext
      )) {
        fullResponse += chunk;
        assistantMessage.content = fullResponse;
        yield { ...assistantMessage };
      }

      // Mark streaming as complete
      assistantMessage.isStreaming = false;
      delete assistantMessage.thinkersComplete; // Clean up temporary property
      this.saveMessages();
      yield { ...assistantMessage };

      // Step 3: Summarize interaction for memory (async, don't wait)
      this.memoryService
        .summarizeInteraction(content, fullResponse, character.name)
        .catch((err) => console.error("Error creating memory:", err));
    } catch (error) {
      console.error("Error in streaming response:", error);
      assistantMessage.content =
        "Sorry, I encountered an error while generating my response.";
      assistantMessage.isStreaming = false;
      delete assistantMessage.thinkersComplete; // Clean up temporary property
      this.saveMessages();
      yield { ...assistantMessage };
    }
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  clearMessages(): void {
    this.messages = [];
    localStorage.removeItem("chat-messages");
  }

  clearAll(): void {
    this.clearMessages();
    this.memoryService.clearMemories();
    this.characterService.clearCharacter();
  }
}
