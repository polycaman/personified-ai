export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  thinkerResponses?: ThinkerResponse[];
  isStreaming?: boolean; // Track if message is being streamed
  thinkersComplete?: boolean; // Track if thinkers phase is complete
}

export interface ThinkerResponse {
  thinkerType: ThinkerType;
  name: string;
  draft: string;
  weight: number;
  isStreaming?: boolean; // Track if individual thinker is still streaming
}

export type ThinkerType = "sin" | "virtue";

export interface Thinker {
  name: string;
  type: ThinkerType;
  archetype: string;
  promptModifier: string;
}

export interface Character {
  id: string;
  name: string;
  personality: string;
  traits: string[];
  backstory: string;
  created: Date;
}

export interface Memory {
  id: string;
  summary: string;
  context: string;
  timestamp: Date;
  importance: number;
}

export interface OllamaConfig {
  host: string;
  port: number;
  model: string;
}
