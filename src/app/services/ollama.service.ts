import { Injectable } from "@angular/core";
import { OllamaConfig } from "../models/types";

@Injectable({
  providedIn: "root",
})
export class OllamaService {
  private config: OllamaConfig = {
    host: "localhost",
    port: 11434,
    model: "llama2",
  };

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    const saved = localStorage.getItem("ollama-config");
    if (saved) {
      this.config = JSON.parse(saved);
    }
  }

  saveConfig(config: OllamaConfig): void {
    this.config = config;
    localStorage.setItem("ollama-config", JSON.stringify(config));
  }

  getConfig(): OllamaConfig {
    return { ...this.config };
  }

  async generate(prompt: string, system?: string): Promise<string> {
    // Use direct Ollama URL for Electron app
    const url = `http://${this.config.host}:${this.config.port}/api/generate`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: prompt,
          system: system,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || "";
    } catch (error) {
      console.error("Error calling Ollama API:", error);
      throw error;
    }
  }

  async *generateStream(
    prompt: string,
    system?: string
  ): AsyncGenerator<string, void, unknown> {
    // Use direct Ollama URL for Electron app
    const url = `http://${this.config.host}:${this.config.port}/api/generate`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: prompt,
          system: system,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete JSON lines
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                yield data.response;
              }
              if (data.done) {
                return;
              }
            } catch (e) {
              // Skip malformed JSON lines
              continue;
            }
          }
        }
      }
    } catch (error) {
      console.error("Error calling Ollama streaming API:", error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Use direct Ollama URL for Electron app
      const url = `http://${this.config.host}:${this.config.port}/api/tags`;
      const response = await fetch(url);
      return response.ok;
    } catch {
      return false;
    }
  }
}
