import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ChatService } from "../../services/chat.service";
import { CharacterService } from "../../services/character.service";
import { MemoryService } from "../../services/memory.service";
import { Message, Character, Memory } from "../../models/types";

@Component({
  selector: "app-chat",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ChatComponent implements OnInit {
  @ViewChild("messagesContainer") messagesContainer?: ElementRef;

  messages: Message[] = [];
  character: Character | null = null;
  memories: Memory[] = [];
  userInput = "";
  isLoading = false;
  isThinking = false; // New state for thinkers phase
  isDeciding = false; // New state for decider phase
  showThinkers = false;
  showThinkersRealTime = false; // Track if user wants to see real-time thinkers
  selectedMessage: Message | null = null;

  constructor(
    private chatService: ChatService,
    private characterService: CharacterService,
    private memoryService: MemoryService
  ) {}

  ngOnInit(): void {
    this.character = this.characterService.getCharacter();
    this.messages = this.chatService.getMessages();
    this.memories = this.memoryService.getAllMemories();
  }

  async sendMessage(): Promise<void> {
    if (!this.userInput.trim() || this.isLoading) return;

    const content = this.userInput.trim();
    this.userInput = "";
    this.isThinking = true; // Show thinking phase

    try {
      // Use streaming for real-time response updates
      for await (const message of this.chatService.sendMessageStream(
        content,
        this.showThinkersRealTime
      )) {
        this.messages = this.chatService.getMessages();
        this.scrollToBottom();

        // Check if we have thinker responses and they are complete
        if (message.thinkersComplete && this.isThinking) {
          this.isThinking = false;
          this.isDeciding = true;
        }

        // Hide deciding indicator when streaming is complete
        if (!message.isStreaming && this.isDeciding) {
          this.isDeciding = false;
          break;
        }
      }

      this.memories = this.memoryService.getAllMemories();
    } catch (error: any) {
      console.error("Error sending message:", error);
      alert("Error: " + (error.message || "Failed to send message"));
    } finally {
      this.isThinking = false;
      this.isDeciding = false;
      this.isLoading = false;
      this.scrollToBottom();
    }
  }

  toggleThinkers(message: Message): void {
    if (this.selectedMessage === message) {
      this.selectedMessage = null;
      this.showThinkers = false;
    } else {
      this.selectedMessage = message;
      this.showThinkers = true;
    }
  }

  async generateNewCharacter(): Promise<void> {
    this.isLoading = true;
    try {
      this.character = await this.characterService.generateCharacter();
      alert(`New character generated: ${this.character.name}`);
    } catch (error) {
      console.error("Error generating character:", error);
      alert("Error generating character. Using fallback character.");
      this.character = this.characterService.getCharacter();
    } finally {
      this.isLoading = false;
    }
  }

  get isProcessing(): boolean {
    return this.isLoading || this.isThinking || this.isDeciding;
  }

  getCurrentStreamingMessage(): Message | null {
    // Find the last message that is currently streaming
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const message = this.messages[i];
      if (
        message.role === "assistant" &&
        (message.isStreaming || this.isThinking)
      ) {
        return message;
      }
    }
    return null;
  }

  clearChat(): void {
    if (
      confirm(
        "Clear all chat history? This will not delete memories or character."
      )
    ) {
      this.chatService.clearMessages();
      this.messages = [];
    }
  }

  clearAll(): void {
    if (
      confirm(
        "Clear everything? This will delete chat history, memories, and character."
      )
    ) {
      this.chatService.clearAll();
      this.messages = [];
      this.memories = [];
      this.character = null;
    }
  }

  flushMemories(): void {
    if (
      confirm(
        "Flush all memories? This will clear all stored memories but keep the character and chat history."
      )
    ) {
      this.memoryService.clearMemories();
      this.memories = [];
      alert("All memories have been flushed.");
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
