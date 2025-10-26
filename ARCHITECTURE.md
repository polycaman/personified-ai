# System Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Electron Desktop App                          │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Angular 20 Frontend                       │   │
│  │                                                               │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │   │
│  │  │   Chat UI    │  │  Config UI   │  │  App Router  │     │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │   │
│  │         │                  │                  │              │   │
│  │         └──────────────────┴──────────────────┘              │   │
│  │                            │                                 │   │
│  │  ┌─────────────────────────┴──────────────────────────────┐│   │
│  │  │                   Service Layer                         ││   │
│  │  │                                                          ││   │
│  │  │  ┌────────────┐  ┌──────────────┐  ┌──────────────┐  ││   │
│  │  │  │   Chat     │  │  Character   │  │   Memory     │  ││   │
│  │  │  │  Service   │  │   Service    │  │   Service    │  ││   │
│  │  │  └─────┬──────┘  └──────┬───────┘  └──────┬───────┘  ││   │
│  │  │        │                 │                  │          ││   │
│  │  │  ┌─────┴─────────────────┴──────────────────┴───────┐ ││   │
│  │  │  │           Thinkers & Decider Services            │ ││   │
│  │  │  │  ┌────────────────────────────────────────────┐  │ ││   │
│  │  │  │  │  14 Thinkers → 15th Decider → Response    │  │ ││   │
│  │  │  │  └────────────────────────────────────────────┘  │ ││   │
│  │  │  └─────────────────────┬────────────────────────────┘ ││   │
│  │  │                        │                               ││   │
│  │  │  ┌─────────────────────┴────────────────────────────┐ ││   │
│  │  │  │              Ollama Service                       │ ││   │
│  │  │  └──────────────────────┬───────────────────────────┘ ││   │
│  │  └─────────────────────────┼──────────────────────────────┘│   │
│  └────────────────────────────┼───────────────────────────────┘   │
│                               │                                     │
│  ┌────────────────────────────┴───────────────────────────────┐   │
│  │                    LocalStorage Persistence                 │   │
│  │  • Character  • Memories  • Messages  • Configuration      │   │
│  └─────────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                │ HTTP API Calls
                                │
                        ┌───────┴────────┐
                        │                 │
                        │  Ollama Server  │
                        │  (Local LLM)    │
                        │                 │
                        └─────────────────┘
```

## Message Processing Flow

```
User Input: "Tell me about yourself"
         │
         ▼
    ┌────────────────┐
    │  Chat Service  │
    └────┬───────────┘
         │
         ├─► Get Character (Echo: reflective, thoughtful...)
         ├─► Get Memory Context (recent 5 memories)
         │
         ▼
    ┌──────────────────────┐
    │   Thinkers Service   │
    └──────────────────────┘
         │
         │  Parallel Processing (14 concurrent LLM calls)
         │
    ┌────┴────┬────┬────┬────┬────┬────┬─────┬────┬────┬────┬────┬────┬────┬────┐
    ▼         ▼    ▼    ▼    ▼    ▼    ▼     ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼
  Pride    Greed Lust Envy Glut Wrath Sloth | Hum Char Chast Kind Temp Pat Dili
  (Sin)    (Sin) ...  ...  ...  ...   (Sin) | (V) (V)  (V)   (V)  (V)  (V) (V)
    │         │    │    │    │    │     │    │  │   │    │     │    │    │   │
    └─────────┴────┴────┴────┴────┴─────┴────┴──┴───┴────┴─────┴────┴────┴───┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │   Decider Service    │
                    │  (15th perspective)  │
                    └──────────────────────┘
                                │
                                │ Fusion LLM Call
                                │
                                ▼
                        Final Response:
                    "I'm Echo, a reflective AI..."
                                │
                                ├─► Display to User
                                │
                                └─► Memory Service (async)
                                    │
                                    ▼
                            Memory Summarization:
                        "User asked about character,
                         Echo introduced itself"
```

## Thinker System Detail

```
Input: "What should I do about my problem?"

┌─────────────────── 7 SINS (Shadow Aspects) ────────────────────┐
│                                                                  │
│  Pride:     "Obviously, the best solution is..."                │
│  Greed:     "What can you gain from this situation?"            │
│  Lust:      "Follow your immediate desires..."                  │
│  Envy:      "Compare yourself to others who..."                 │
│  Gluttony:  "Here's everything you could possibly do: 1,2,3..." │
│  Wrath:     "This situation is clearly wrong and..."            │
│  Sloth:     "Maybe just wait and see what happens..."           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌────────────────── 7 VIRTUES (Light Aspects) ────────────────────┐
│                                                                  │
│  Humility:    "I may not have all answers, but..."              │
│  Charity:     "How can I help you most effectively..."          │
│  Chastity:    "Let's maintain appropriate boundaries..."        │
│  Kindness:    "I understand this is difficult for you..."       │
│  Temperance:  "A balanced approach would be..."                 │
│  Patience:    "Take time to carefully consider..."              │
│  Diligence:   "Let's work through this systematically..."       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

                              ▼
                    ┌──────────────────┐
                    │  15th DECIDER    │
                    │                  │
                    │  Synthesis of    │
                    │  all perspectives│
                    └──────────────────┘
                              ▼
                     Balanced Response:
        "I understand this is a challenging situation.
         While there may not be a perfect answer,
         let's think through this carefully together..."
```

## Memory System Flow

```
Conversation:
User: "What's your favorite color?"
Assistant: "I'm drawn to deep blues - they remind me of depth and contemplation."

                    ▼
        ┌──────────────────────┐
        │   Memory Service     │
        └──────────────────────┘
                    │
                    │ Summarization LLM Call
                    ▼
        Summary: "User asked about color preference,
                  character expressed liking for blue,
                  associated with depth/contemplation"
                    │
                    ▼
        ┌──────────────────────┐
        │  Calculate Importance│
        └──────────────────────┘
                    │
                    │ Scoring: 0.65
                    │ - Length: moderate
                    │ - Question mark: +0.1
                    │ - Emotional keywords: +0.05
                    ▼
        Store in top 50 memories
        (sorted by importance)
                    │
                    ▼
        Referenced in future responses:
        "As you know, I mentioned my appreciation
         for deep blues earlier..."
```

## Data Persistence

```
┌───────────────────────────────────────────────────┐
│              Browser LocalStorage                  │
├───────────────────────────────────────────────────┤
│                                                    │
│  ollama-config:                                   │
│    { host, port, model }                          │
│                                                    │
│  character:                                       │
│    { id, name, personality, traits, backstory }   │
│                                                    │
│  memories: [                                      │
│    { id, summary, context, timestamp, importance }│
│    ... (max 50, sorted by importance)             │
│  ]                                                │
│                                                    │
│  chat-messages: [                                 │
│    { id, role, content, timestamp }               │
│    (thinkerResponses excluded - too large)        │
│  ]                                                │
│                                                    │
└───────────────────────────────────────────────────┘
```

## Component Hierarchy

```
AppComponent
    │
    ├─► ChatComponent
    │     │
    │     ├─► Message Display
    │     │     ├─► User Messages
    │     │     └─► Assistant Messages
    │     │           └─► Thinker Viewer (expandable)
    │     │
    │     ├─► Input Area
    │     │     ├─► Textarea
    │     │     └─► Send Button
    │     │
    │     └─► Memory Sidebar
    │           └─► Memory List
    │
    └─► ConfigComponent
          │
          ├─► Configuration Form
          │     ├─► Host Input
          │     ├─► Port Input
          │     └─► Model Input
          │
          ├─► Connection Status
          │
          └─► Save Button
```

## Service Dependencies

```
ChatService
    ├─depends on─► CharacterService
    │                   └─depends on─► OllamaService
    │
    ├─depends on─► ThinkersService
    │                   └─depends on─► OllamaService
    │
    ├─depends on─► DeciderService
    │                   └─depends on─► OllamaService
    │
    └─depends on─► MemoryService
                        └─depends on─► OllamaService

All services are Singleton (providedIn: 'root')
```

## Time Complexity

```
Single Message Response Time:
├─ Character Retrieval: O(1) - localStorage
├─ Memory Context: O(n) - n recent memories (default 5)
├─ 14 Thinkers: O(1) - parallel processing
│  └─ Each thinker: ~3-5 seconds (LLM dependent)
├─ Decider Fusion: O(1) - single LLM call (~3-5 seconds)
└─ Memory Creation: O(1) - async, doesn't block

Total User Wait Time: ~6-10 seconds
(Dominated by LLM inference time, not algorithm complexity)
```

## Build & Deployment Pipeline

```
Source Code
    │
    ├─► TypeScript Compilation
    │     └─ Strict mode checks
    │
    ├─► Angular Build
    │     ├─ Template compilation
    │     ├─ Style processing (SCSS → CSS)
    │     └─ Tree shaking & minification
    │
    └─► Electron Packaging
          ├─ Bundle Angular dist
          ├─ Package main.js
          └─ Create platform-specific binaries
                ├─ Windows (NSIS)
                ├─ macOS (DMG)
                └─ Linux (AppImage)
```
