# Development Guide

## Project Architecture

### Core Concept: Multi-Perspective AI

The system creates realistic, human-like AI personalities by simulating multiple internal perspectives (thinkers) that debate and discuss before responding, similar to how humans consider different viewpoints before speaking.

```
User Input → Context → 14 Thinkers → Fusion → Response → Memory
```

## Service Layer

### OllamaService
**Purpose**: Interface with local Ollama API

**Key Methods**:
- `generate(prompt, system)`: Send prompt to LLM
- `testConnection()`: Verify Ollama availability
- `saveConfig()`: Persist Ollama settings

**Location**: `src/app/services/ollama.service.ts`

### CharacterService
**Purpose**: Manage AI character personality

**Key Methods**:
- `generateCharacter()`: Create new AI persona using LLM
- `getCharacter()`: Retrieve current character
- `clearCharacter()`: Reset character

**Character Structure**:
```typescript
{
  id: string;
  name: string;
  personality: string;
  traits: string[];
  backstory: string;
  created: Date;
}
```

**Location**: `src/app/services/character.service.ts`

### ThinkersService
**Purpose**: Implement 14-thinker system (7 sins + 7 virtues)

**Architecture**:
```
14 Thinkers (Parallel Processing)
├── Sins (Shadow Aspects)
│   ├── Pride: Overconfident responses
│   ├── Greed: Self-interested perspectives
│   ├── Lust: Passionate, immediate gratification
│   ├── Envy: Comparative thinking
│   ├── Gluttony: Excessive information
│   ├── Wrath: Strong judgments
│   └── Sloth: Minimal effort
└── Virtues (Light Aspects)
    ├── Humility: Modest, aware of limits
    ├── Charity: Generous, helpful
    ├── Chastity: Restrained, appropriate
    ├── Kindness: Compassionate
    ├── Temperance: Balanced
    ├── Patience: Thoughtful
    └── Diligence: Thorough, careful
```

**Key Methods**:
- `gatherThinkerResponses()`: Run all 14 thinkers in parallel
- `getThinkerDraft()`: Get individual thinker's perspective

**Implementation Note**: Uses `Promise.all()` for parallel execution to minimize wait time.

**Location**: `src/app/services/thinkers.service.ts`

### DeciderService
**Purpose**: The 15th voice that fuses all thinker perspectives

**Fusion Strategy**:
1. Separate sins from virtues
2. Present all perspectives to LLM
3. Request natural synthesis maintaining character
4. Fallback to simple combination if fusion fails

**Key Methods**:
- `fuseResponses()`: Synthesize 14 drafts into coherent response
- `simpleFusion()`: Fallback fusion strategy

**Location**: `src/app/services/decider.service.ts`

### MemoryService
**Purpose**: Store and manage interaction summaries

**Memory Management**:
- Stores summaries, not full conversations (privacy & efficiency)
- Importance scoring based on content analysis
- Maximum 50 memories (keeps most important)
- Asynchronous summarization (doesn't block responses)

**Key Methods**:
- `summarizeInteraction()`: Create memory from conversation
- `getMemoryContext()`: Retrieve recent memories for context
- `calculateImportance()`: Score memory relevance

**Memory Structure**:
```typescript
{
  id: string;
  summary: string;        // AI-generated summary
  context: string;        // Brief original context
  timestamp: Date;
  importance: number;     // 0.0 - 1.0 score
}
```

**Location**: `src/app/services/memory.service.ts`

### ChatService
**Purpose**: Orchestrate entire conversation flow

**Message Flow**:
```typescript
async sendMessage(content: string): Promise<Message> {
  1. Add user message to history
  2. Load character & memory context
  3. Gather 14 thinker responses (parallel)
  4. Fuse responses with decider
  5. Create assistant message
  6. Trigger memory summarization (async)
  7. Return response
}
```

**Location**: `src/app/services/chat.service.ts`

## Component Layer

### ChatComponent
**Purpose**: Main chat interface

**Features**:
- Message display (user & assistant)
- Thinker perspective viewer
- Character management
- Loading states

**Key UI Elements**:
- Header with character info
- Scrollable message area
- Thinker expansion panels
- Input area with Enter-to-send
- Memory sidebar

**Location**: `src/app/components/chat/`

### ConfigComponent
**Purpose**: Ollama configuration UI

**Features**:
- Host/port/model settings
- Connection testing
- Save/load configuration

**Location**: `src/app/components/config/`

## Data Flow

### Message Send Flow
```
User types message
    ↓
ChatComponent.sendMessage()
    ↓
ChatService.sendMessage()
    ├→ CharacterService.getCharacter()
    ├→ MemoryService.getMemoryContext()
    ├→ ThinkersService.gatherThinkerResponses()
    │   ├→ [14 parallel calls to Ollama]
    │   └→ Returns ThinkerResponse[]
    ├→ DeciderService.fuseResponses()
    │   └→ [1 call to Ollama with all perspectives]
    └→ MemoryService.summarizeInteraction() [async]
        └→ [1 call to Ollama for summary]
    ↓
Response displayed
```

### Storage Architecture

**LocalStorage Keys**:
- `ollama-config`: Ollama connection settings
- `character`: Current character data
- `memories`: Array of memory objects
- `chat-messages`: Recent conversation (thinker data excluded)

**Why LocalStorage**:
- Fully offline capability
- Persistent across sessions
- No server needed
- Easy to clear/reset

## Development Setup

### Prerequisites
```bash
Node.js 20+
npm 10+
Ollama installed and running
```

### Install Dependencies
```bash
npm install
```

### Development Mode
```bash
npm run start         # Angular dev server only
npm run electron      # Electron with built files
npm run electron-dev  # Both Angular dev + Electron
```

### Build Process
```bash
npm run build         # Angular production build
npm run build-electron # Build + package Electron app
```

## Testing Locally

### Manual Testing Checklist

1. **Configuration**
   - [ ] Can change Ollama host/port/model
   - [ ] Connection test works
   - [ ] Settings persist after restart

2. **Character Generation**
   - [ ] Generate character creates unique persona
   - [ ] Character persists after refresh
   - [ ] Can regenerate character

3. **Chat Flow**
   - [ ] Can send messages
   - [ ] Receives responses
   - [ ] Messages display correctly
   - [ ] Loading states work

4. **Thinker System**
   - [ ] "Show Thinkers" reveals 14 perspectives
   - [ ] Sins and virtues clearly differentiated
   - [ ] All thinkers provide unique drafts

5. **Memory System**
   - [ ] Memories appear in sidebar
   - [ ] Memories persist after refresh
   - [ ] Recent memories influence responses

6. **Persistence**
   - [ ] Data survives browser/app restart
   - [ ] Clear chat removes messages only
   - [ ] Clear all removes everything

## Adding New Features

### Adding a New Thinker
Edit `src/app/services/thinkers.service.ts`:

```typescript
{
  name: 'NewThinker',
  type: 'virtue', // or 'sin'
  archetype: 'The Description',
  promptModifier: 'Respond with specific characteristics...'
}
```

### Changing Thinker Weights
Currently all thinkers have equal weight (1.0). To implement weighted fusion:

1. Modify `ThinkerResponse` weight field
2. Update `DeciderService.fuseResponses()` to use weights
3. Consider importance in fusion prompt

### Customizing Memory Importance
Edit `MemoryService.calculateImportance()`:

```typescript
private calculateImportance(userMessage: string, response: string): number {
  // Add your scoring logic
  // Higher score = more important
  return score; // 0.0 - 1.0
}
```

## Performance Optimization

### Current Performance
- **14 Thinker Calls**: Parallel (~3-5 seconds total)
- **1 Decider Call**: Sequential (~3-5 seconds)
- **1 Memory Call**: Async (doesn't block)
- **Total User Wait**: ~6-10 seconds per message

### Optimization Strategies

1. **Reduce Thinkers**: Use fewer than 14 (modify ThinkersService)
2. **Smaller Models**: Use phi/gemma instead of llama2/3
3. **Shorter Prompts**: Reduce system prompt lengths
4. **Caching**: Cache similar queries (would need implementation)
5. **Streaming**: Stream responses token-by-token (requires Ollama streaming API)

## Security Considerations

### Content Security Policy
The app uses CSP headers to restrict:
- Script execution to self
- Style sources to self
- No external network calls (except Ollama)

### Data Privacy
- All data stored locally (localStorage)
- No telemetry or external API calls
- Ollama API is local-only
- User has full control of data

### Recommendations
- Keep Ollama on localhost (default)
- Don't expose Ollama port externally
- Clear data when sharing device

## Debugging

### Enable Console Logging
All services have console.error() calls. Check DevTools console for:
- API errors
- Service failures
- Build warnings

### Common Issues

**"Character generation slow"**
→ Character generation requires LLM call, expected 10-30s

**"Thinkers not showing"**
→ Check if `thinkerResponses` exists on message object

**"Memory not working"**
→ Check localStorage quota (may be full)

**"Build fails"**
→ Ensure TypeScript 5.8+, Angular 20, Node 20+

## Code Style

- **TypeScript**: Strict mode enabled
- **Angular**: Standalone components
- **Async**: Use async/await over .then()
- **Types**: Explicit types for all public methods
- **Naming**: Clear, descriptive variable names

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following code style
4. Test thoroughly (manual testing checklist)
5. Update documentation if needed
6. Submit pull request

## Future Enhancements

Potential improvements:
- [ ] Streaming responses for faster perceived performance
- [ ] Multiple character support (switch between characters)
- [ ] Export/import character/memory data
- [ ] Visualization of thinker influences
- [ ] Adjustable thinker weights via UI
- [ ] Custom thinker definitions
- [ ] Memory search/filter
- [ ] Conversation branching
- [ ] Voice input/output
- [ ] Multi-language support

## Questions?

Check the [README.md](README.md) for user documentation or open an issue on GitHub.
