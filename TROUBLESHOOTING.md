# Troubleshooting Guide

Common issues and solutions for Personified AI.

## Installation Issues

### "npm install fails with ERESOLVE errors"

**Solution 1** (Recommended):
```bash
rm -rf node_modules package-lock.json
npm install
```

**Solution 2** (If Solution 1 fails):
```bash
npm install --legacy-peer-deps
```

### "Cannot find module '@angular/cli'"

**Solution**:
```bash
npm install -g @angular/cli@20
```

### "electron: command not found"

**Solution**:
Electron is a dev dependency. Run via npm:
```bash
npm run electron
```

## Build Issues

### "ng: command not found"

**Solution**:
Use npm scripts instead:
```bash
npm run build
# instead of: ng build
```

### "TypeScript version mismatch"

**Solution**:
Ensure TypeScript 5.8+:
```bash
npm install typescript@5.8 --save-dev
```

### Build succeeds but app won't start

**Check**:
1. Verify dist folder exists: `ls dist/personified-ai`
2. Check electron/main.js path is correct
3. Try: `npm run build && npm run electron`

## Ollama Connection Issues

### "Ollama API error: Connection refused"

**Cause**: Ollama is not running

**Solution**:
```bash
# Start Ollama
ollama serve

# Verify it's running
curl http://localhost:11434/api/tags
```

### "Ollama API error: 404 Not Found"

**Cause**: Model not installed

**Solution**:
```bash
# List installed models
ollama list

# Pull the model you want
ollama pull llama2
# or
ollama pull mistral
```

### "Connection test fails in Config"

**Checklist**:
1. ✓ Ollama is running (`ollama serve`)
2. ✓ Correct host (default: localhost)
3. ✓ Correct port (default: 11434)
4. ✓ Model is installed (`ollama list`)
5. ✓ Firewall allows connection

**Test manually**:
```bash
curl http://localhost:11434/api/tags
# Should return JSON with model list
```

### "Cannot connect to Ollama on Windows"

**Solution**:
Windows may use a different port or host. Check Ollama settings:
```bash
# Check Ollama environment variables
echo %OLLAMA_HOST%

# If set, use that in Config
# Otherwise, try: localhost:11434
```

## Character Generation Issues

### "Character generation takes forever"

**Causes & Solutions**:

1. **First time loading model** (expected)
   - Wait 30-60 seconds
   - Model needs to load into memory

2. **Slow machine/model too large**
   - Use smaller model: `ollama pull phi`
   - Check system resources (RAM, CPU)

3. **Ollama not responding**
   - Restart Ollama: Stop and `ollama serve`
   - Check Ollama logs

### "Character generation fails"

**Solution**:
The app uses a fallback character if generation fails:
- Name: "Echo"
- Pre-defined personality and traits
- Check console for errors

**To fix**:
1. Verify Ollama connection in Config
2. Try smaller model
3. Check Ollama logs: `ollama logs`

### "Generated character seems generic"

**Why**: LLM might not follow JSON format exactly

**Solutions**:
1. Try generating again (results vary)
2. Use different model (mistral, llama3)
3. Accept fallback "Echo" character (well-designed)

## Chat Response Issues

### "Responses are too slow (>60 seconds)"

**Causes & Solutions**:

1. **Model too large for hardware**
   ```bash
   # Use lighter model
   ollama pull phi      # ~1.6GB
   ollama pull gemma    # ~2.6GB
   ```

2. **CPU-only inference (no GPU)**
   - Expected: 30-60 seconds per message
   - Consider GPU-enabled machine
   - Or use smaller model

3. **14 thinkers + decider = 15 LLM calls**
   - This is by design
   - Thinkers run in parallel (helps)
   - Total time still significant

**Performance expectations**:
- **With GPU**: 6-15 seconds
- **Without GPU**: 30-60 seconds
- **First message**: Always slowest (model loading)

### "Responses are empty or errors"

**Check**:
1. Console errors (F12 → Console)
2. Ollama logs
3. Model is compatible
4. Enough system memory

**Solution**:
```bash
# Test Ollama directly
ollama run llama2 "test"
# Should respond with text
```

### "Thinker perspectives not showing"

**Cause**: Thinker responses not persisted (by design)

**Check**:
1. Only NEW messages show thinkers
2. Reloaded messages won't have thinkers
3. This is intentional (saves storage)

**To see thinkers**:
- Send a new message
- Click "Show Thinkers" immediately

### "Responses don't match character personality"

**Causes**:
1. Memory system needs more interactions
2. Thinker fusion not balanced well
3. Model not following instructions

**Solutions**:
1. Have 5-10 conversations (memory builds)
2. Try different model (llama3, mistral)
3. Regenerate character
4. Check character traits in header

## Memory Issues

### "Memories not appearing"

**Check**:
1. Have you sent at least 2 messages?
2. Check sidebar (right side of chat)
3. Memories create async (may take 5-10 seconds)

**Debug**:
```javascript
// In browser console (F12)
localStorage.getItem('memories')
```

### "Memories don't seem to influence responses"

**Why**: 
- Memory system needs time to build context
- Only top 5 memories used per response

**Solutions**:
1. Have more conversations (10+ messages)
2. Ask about previous topics (tests memory)
3. Clear all and start fresh

### "Too many/old memories"

**Automatic**: System keeps max 50, prioritizing important ones

**Manual clear**:
```javascript
// In browser console (F12)
localStorage.removeItem('memories')
// Then refresh app
```

## UI/Display Issues

### "Chat messages not scrolling"

**Solution**:
Usually auto-scrolls. If not:
1. Manually scroll to bottom
2. Send another message (triggers scroll)

### "Thinker panel doesn't expand"

**Check**:
1. Click "Show Thinkers" on assistant message
2. Only assistant messages have this button
3. Only new messages (after refresh, thinkers not saved)

### "Layout broken/overlapping"

**Solutions**:
1. Resize window
2. Refresh page (Ctrl+R / Cmd+R)
3. Clear browser cache

### "Styles not loading"

**Cause**: Build issue

**Solution**:
```bash
npm run build
npm run electron
```

## Data Persistence Issues

### "Character/memories lost after restart"

**Cause**: LocalStorage cleared

**Possible reasons**:
1. Private/Incognito mode (doesn't persist)
2. Browser/Electron cache cleared
3. Different user profile

**Solution**:
Don't use private mode. Character will persist.

### "Want to backup data"

**Export**:
```javascript
// In browser console (F12)
const backup = {
  character: localStorage.getItem('character'),
  memories: localStorage.getItem('memories'),
  config: localStorage.getItem('ollama-config')
};
console.log(JSON.stringify(backup));
// Copy the output
```

**Import**:
```javascript
// Paste your backup data
const backup = { /* ... */ };
localStorage.setItem('character', backup.character);
localStorage.setItem('memories', backup.memories);
localStorage.setItem('ollama-config', backup.config);
// Refresh app
```

### "Want to reset everything"

**In App**:
1. Clear messages: 🗑️ button
2. Clear all: F12 console → `localStorage.clear()` → refresh

**Complete reset**:
```javascript
// In browser console (F12)
localStorage.clear();
location.reload();
```

## Development Issues

### "electron-dev doesn't start"

**Check**:
1. Port 4200 available: `lsof -i :4200`
2. Wait for "ready" before Electron opens
3. Check terminal for errors

**Solution**:
```bash
# Kill process on port 4200
kill -9 $(lsof -t -i:4200)

# Try again
npm run electron-dev
```

### "Hot reload not working"

**Expected**: Angular hot-reloads, Electron requires restart

**For Electron changes**:
1. Close Electron window
2. Restart with `npm run electron-dev`

### "TypeScript errors in IDE but builds fine"

**Solution**:
```bash
# Restart TypeScript server in VSCode
Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Or restart IDE
```

### "Changes not reflecting"

**Checklist**:
1. ✓ Saved file?
2. ✓ Angular dev server running?
3. ✓ Refreshed browser/Electron? (Ctrl+R)
4. ✓ Cleared cache?

## Performance Issues

### "App uses too much memory"

**Causes**:
1. Ollama model loaded in RAM
2. Multiple Electron instances
3. Dev tools open

**Solutions**:
```bash
# Check memory usage
top -p $(pgrep -f ollama)

# Close extra Electron instances
pkill -f electron

# Use smaller model
ollama pull phi
```

### "CPU at 100% during responses"

**Expected**: LLM inference is CPU-intensive

**Normal**:
- Spikes to 100% during generation
- Returns to idle after response

**Not normal**:
- Stays at 100% when idle
- Check for background processes

## Platform-Specific Issues

### macOS: "App can't be opened" (security warning)

**Solution**:
```bash
# Right-click app → Open
# Or disable Gatekeeper temporarily
sudo spctl --master-disable
```

### Linux: "electron: error while loading shared libraries"

**Solution**:
```bash
# Install dependencies
sudo apt-get install libgtk-3-0 libnotify4 libnss3 libxtst6 xdg-utils
```

### Windows: "ollama not recognized"

**Solution**:
1. Add Ollama to PATH
2. Or use full path: `C:\Users\...\ollama.exe serve`

## Still Having Issues?

### Getting Help

1. **Check Console**: F12 → Console tab for errors
2. **Check Ollama Logs**: `ollama logs`
3. **Test Ollama**: `ollama run llama2 "test"`
4. **Verify Build**: `npm run build` (should succeed)

### Reporting Issues

Include:
- Operating system & version
- Node.js version: `node --version`
- npm version: `npm --version`
- Ollama version: `ollama --version`
- Error messages (full text)
- Console logs
- Steps to reproduce

### Last Resort

**Complete reinstall**:
```bash
# 1. Remove everything
rm -rf node_modules package-lock.json
rm -rf dist .angular

# 2. Fresh install
npm install

# 3. Build
npm run build

# 4. Test
npm run electron
```

**Nuclear option** (Windows):
```powershell
rmdir /s /q node_modules
rmdir /s /q dist
del package-lock.json
npm install
npm run build
npm run electron
```

## Tips for Smooth Experience

1. ✅ Keep Ollama running in background
2. ✅ Use appropriate model for your hardware
3. ✅ Wait patiently for first response (model loading)
4. ✅ Check Config connection before chatting
5. ✅ Monitor system resources (RAM, CPU)
6. ✅ Close other heavy applications
7. ✅ Use SSD if possible (faster model loading)
8. ✅ Keep Node.js and npm updated

## Quick Reference

### Essential Commands
```bash
# Development
npm run electron-dev

# Production
npm run build
npm run electron

# Package
npm run build-electron

# Ollama
ollama serve
ollama pull llama2
ollama list
```

### Essential Paths
- Config: ⚙️ button → Set Ollama settings
- Character: 🎭 button → Generate/regenerate
- Thinkers: "Show Thinkers" on message
- Memories: Right sidebar
- Console: F12 (for debugging)

### Performance Expectations
- First message: 30-90s (model loading)
- Subsequent: 15-45s (thinker processing)
- Character gen: 10-30s (one-time)
- Memory creation: 2-5s (async)
