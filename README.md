# Personified AI

An AI that works offline which is no different than a human being.

## Overview

Personified AI is an Electron + Angular 20 application that creates a unique chat experience with an AI character powered by local Ollama models. Each response is crafted through a sophisticated multi-perspective system that creates consistent, evolving personalities.

## Key Features

### 🎭 Auto-Generated AI Characters
- Unique AI personalities generated automatically
- Persistent character traits and backstory
- Characters evolve based on interactions

### 🧠 14 Thinkers System
Each message is processed by 14 distinct "thinkers" representing different perspectives:
- **7 Deadly Sins**: Pride, Greed, Lust, Envy, Gluttony, Wrath, Sloth
- **7 Heavenly Virtues**: Humility, Charity, Chastity, Kindness, Temperance, Patience, Diligence

### ⚖️ 15th Decider
A fusion agent that synthesizes all 14 thinker perspectives into a coherent, balanced response that maintains character consistency.

### 💾 Memory System
- Stores summarized interaction outcomes (not full chat logs)
- Referenced for every new response
- Enables consistent, adaptive personality evolution
- Keeps behavior patterns realistic and human-like

### 🔌 Fully Offline
- Runs completely offline using local Ollama API
- No external API calls or internet dependency
- Configurable model and port settings

## Architecture

```
User Message
    ↓
Character Context + Memory Context
    ↓
14 Thinkers (Parallel Processing)
    ├── 7 Sins: Pride, Greed, Lust, Envy, Gluttony, Wrath, Sloth
    └── 7 Virtues: Humility, Charity, Chastity, Kindness, Temperance, Patience, Diligence
    ↓
15th Decider (Fusion)
    ↓
Final Response
    ↓
Memory Summarization (Async)
```

## Prerequisites

1. **Node.js** (v20 or higher)
2. **Ollama** - Install from [ollama.ai](https://ollama.ai)
3. **Ollama Model** - Pull a model:
   ```bash
   ollama pull llama2
   # or
   ollama pull llama3
   # or
   ollama pull mistral
   ```

## Installation

```bash
# Clone the repository
git clone https://github.com/polycaman/personified-ai.git
cd personified-ai

# Install dependencies
npm install
```

## Usage

### Development Mode

```bash
# Start Angular dev server and Electron
npm run electron-dev
```

This will:
1. Start the Angular dev server on `http://localhost:4200`
2. Launch Electron once the server is ready
3. Enable hot-reload for development

### Build for Production

```bash
# Build the application
npm run build

# Run Electron with production build
npm run electron
```

### Package as Desktop App

```bash
# Build and package the application
npm run build-electron
```

The packaged application will be available in the `release/` directory.

## Configuration

1. Launch the application
2. Click the **⚙️ Config** button in the navigation bar
3. Configure Ollama settings:
   - **Host**: Default is `localhost`
   - **Port**: Default is `11434`
   - **Model**: Choose from installed models (llama2, llama3, mistral, etc.)
4. Click **Test Connection** to verify
5. Click **Save Configuration**

## How It Works

### 1. Character Generation
When you first start the app, generate a character using the **🎭** button. The system will:
- Create a unique name
- Define personality traits
- Generate a backstory
- Establish behavioral patterns

### 2. Conversation Flow
When you send a message:
1. **Context Gathering**: The system retrieves the character profile and recent memories
2. **Thinker Processing**: All 14 thinkers (7 sins + 7 virtues) process your message in parallel, each providing their unique perspective
3. **Fusion**: The 15th decider synthesizes all perspectives into a coherent response
4. **Memory Creation**: The interaction is summarized and stored for future reference
5. **Response**: You receive a natural, character-consistent response

### 3. Memory Evolution
- Only interaction summaries are stored, not full conversations
- Memories are weighted by importance
- System maintains up to 50 memories, prioritizing the most relevant
- Referenced in every response to maintain consistency

### 4. Personality Consistency
The multi-thinker system ensures:
- Balanced responses that feel natural
- Character-appropriate reactions
- Evolution over time based on interaction history
- Human-like adaptability and growth

## Project Structure

```
personified-ai/
├── electron/               # Electron main process
│   └── main.js
├── src/
│   ├── app/
│   │   ├── components/     # Angular components
│   │   │   ├── chat/      # Main chat interface
│   │   │   └── config/    # Configuration UI
│   │   ├── services/      # Core services
│   │   │   ├── ollama.service.ts      # Ollama API integration
│   │   │   ├── character.service.ts   # Character management
│   │   │   ├── thinkers.service.ts    # 14 thinkers system
│   │   │   ├── decider.service.ts     # 15th fusion agent
│   │   │   ├── memory.service.ts      # Memory system
│   │   │   └── chat.service.ts        # Chat orchestration
│   │   └── models/        # TypeScript interfaces
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── angular.json
├── package.json
└── tsconfig.json
```

## Technologies

- **Angular 20**: Modern web framework
- **Electron 33**: Desktop application wrapper
- **TypeScript 5.8**: Type-safe development
- **Ollama**: Local LLM inference
- **RxJS**: Reactive programming
- **SCSS**: Styling

## Data Persistence

All data is stored locally in the browser's localStorage:
- **Character**: Current character profile
- **Memories**: Summarized interactions
- **Chat History**: Recent messages (thinker responses not persisted)
- **Configuration**: Ollama settings

## Tips for Best Results

1. **Choose an appropriate model**: Larger models (llama2-13b, llama3) provide better responses but require more resources
2. **Let the character evolve**: The personality becomes more consistent over multiple conversations
3. **Explore thinker perspectives**: Click "Show Thinkers" on any response to see how different perspectives contributed
4. **Monitor memories**: Check the sidebar to see what the character remembers
5. **Clear strategically**: Use "Clear Chat" to start fresh while keeping memories and character, or "Clear All" for a complete reset

## Troubleshooting

### Ollama Connection Failed
- Ensure Ollama is running: `ollama serve`
- Verify the port (default 11434)
- Check that the model is pulled: `ollama list`

### Slow Responses
- The system processes 15 LLM calls per message (14 thinkers + 1 decider)
- Use a smaller model for faster responses
- Consider reducing the number of thinkers if needed (requires code modification)

### Build Errors
- Ensure Node.js v20+ is installed
- Clear cache: `rm -rf node_modules && npm install`
- Check TypeScript version compatibility

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

ISC

## Acknowledgments

- Built with Angular 20 and Electron 33
- Powered by Ollama for local LLM inference
- Inspired by the concept of multi-perspective AI reasoning

