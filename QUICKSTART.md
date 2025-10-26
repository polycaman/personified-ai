# Quick Start Guide

## Getting Started in 5 Minutes

### 1. Prerequisites
```bash
# Install Ollama
# macOS/Linux:
curl -fsSL https://ollama.ai/install.sh | sh

# Windows: Download from https://ollama.ai/download

# Pull a model (choose one)
ollama pull llama2        # ~3.8GB - Good balance
ollama pull llama3        # ~4.7GB - Better quality
ollama pull mistral       # ~4.1GB - Fast and capable
ollama pull phi           # ~1.6GB - Lightweight
```

### 2. Install & Run
```bash
# Clone and install
git clone https://github.com/polycaman/personified-ai.git
cd personified-ai
npm install

# Start in development mode
npm run electron-dev
```

### 3. First Use

1. **Configure Ollama**
   - Click **⚙️ Config** button
   - Verify connection (should show "Connected")
   - Change model if desired
   - Click **Save Configuration**

2. **Generate Character**
   - Click **💬 Chat** button
   - Click **🎭 Generate Character**
   - Wait for character generation (~10-30 seconds)

3. **Start Chatting**
   - Type your first message
   - Press Enter to send
   - Wait for response (may take 30-60 seconds for first message)
   - Subsequent messages will be faster as the model warms up

### 4. Understanding the Interface

```
┌─────────────────────────────────────────┬──────────────┐
│ Character Name                          │  🎭  🗑️     │  <- Header
│ Personality description                 │              │
│ [trait1] [trait2] [trait3]             │              │
├─────────────────────────────────────────┼──────────────┤
│                                         │  Memories    │
│  Messages appear here                   │              │
│                                         │  - Memory 1  │
│  [Show Thinkers] <- Click to see       │  - Memory 2  │
│   all 14 perspectives                   │  - Memory 3  │
│                                         │              │
├─────────────────────────────────────────┤              │
│  Type your message...                   │              │
│  [Send]                                 │              │
└─────────────────────────────────────────┴──────────────┘
```

## Understanding Response Times

### First Message (Slowest)
- **Character Generation**: 10-30 seconds
- **First Response**: 30-90 seconds
  - Model loading
  - 14 thinker responses (parallel)
  - Fusion by decider
  - Memory summarization

### Subsequent Messages
- **Typical Response**: 15-45 seconds
  - 14 thinkers: ~1-3 seconds each (parallel)
  - Decider fusion: ~3-5 seconds
  - Memory: ~2-5 seconds (async)

### Performance Tips
- **Use a smaller model** (phi, gemma) for faster responses
- **GPU acceleration** helps significantly if available
- **First response is always slowest** as model loads

## Example Conversation Flow

```
You: Hello! What's your name?

[14 Thinkers Process in Parallel]
├─ Pride: "I am the most sophisticated AI..."
├─ Humility: "I'm just a simple AI trying to help..."
├─ Greed: "I want to know everything about you..."
├─ Charity: "How can I best serve you today..."
└─ ... (10 more perspectives)

[15th Decider Fuses All Perspectives]
→ "Hello! I'm Echo. I'm here to chat with you and learn 
   from our conversation. How are you doing today?"

[Memory System Stores]
→ "User greeted AI, Echo introduced itself politely"
```

## Troubleshooting

### "Error: No character available"
→ Click the 🎭 button to generate a character first

### "Ollama API error: 404"
→ The model isn't installed. Run: `ollama pull llama2`

### "Ollama API error: Connection refused"
→ Ollama isn't running. Start it: `ollama serve`

### Response takes too long
→ Try a smaller model: `ollama pull phi`

### "Failed to fetch"
→ Check Ollama host/port in Config (default: localhost:11434)

## Advanced Features

### View Thinker Perspectives
Click "Show Thinkers" on any assistant message to see:
- All 14 individual thinker drafts
- How sins and virtues balanced the response
- The raw perspectives before fusion

### Memory Management
- **Automatic**: Memories created after each interaction
- **Visible**: Check sidebar to see what's remembered
- **Weighted**: Important conversations remembered longer
- **Limited**: Max 50 memories kept (most important retained)

### Character Regeneration
- Click 🎭 anytime to generate a new character
- Previous memories will still influence behavior
- Creates completely new personality traits

### Clear Options
- **Clear Chat**: Remove messages, keep character & memories
- **Clear All** (via browser): Full reset including character

## Tips for Great Conversations

1. **Be patient with first message** - Model loading takes time
2. **Ask about the character** - They have backstories
3. **Reference past conversations** - Memory system works best over time
4. **Try emotional topics** - Sins vs virtues create interesting dynamics
5. **Explore different characters** - Each has unique personality

## Next Steps

- Read the full [README.md](README.md) for architecture details
- Experiment with different Ollama models
- Watch how the character evolves over conversations
- Try generating multiple characters to see variety

Enjoy your conversations with your personified AI! 🎭
