# 🚀 Quick Start Guide

Get your URL Safety Scanner Agent running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
OPENROUTER_API_KEY=sk-or-v1-xxxxx
VIRUSTOTAL_API_KEY=your_vt_key_here
PORT=3000
CACHE_TTL=3600
```

### Getting API Keys:

**OpenRouter** (Required):
1. Go to https://openrouter.ai/
2. Sign up / Login
3. Go to Keys section
4. Create a new API key
5. Copy the key (starts with `sk-or-v1-`)

**VirusTotal** (Optional but recommended):
1. Go to https://www.virustotal.com/gui/my-apikey
2. Sign up if needed
3. Copy your API key from the dashboard

## Step 3: Run Development Server

```bash
npm run dev
```

You should see:
```
🚀 URL Safety Scanner Agent running on port 3000
📍 A2A endpoint: http://localhost:3000/a2a/agent/urlScanner
🧪 Test endpoint: http://localhost:3000/test
❤️  Health check: http://localhost:3000/health
```

## Step 4: Test the Agent

### Option A: Using the test script
```bash
npm run test-agent
```

### Option B: Using curl
```bash
curl -X POST http://localhost:3000/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Is https://google.com safe?"}'
```

### Option C: Test A2A endpoint
```bash
curl -X POST http://localhost:3000/a2a/agent/urlScanner \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{
      "role": "user",
      "content": "Check this URL: https://github.com"
    }]
  }'
```

## Step 5: Deploy (Optional)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick Railway deployment:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables
railway variables set OPENROUTER_API_KEY=your_key
railway variables set VIRUSTOTAL_API_KEY=your_key

# Get your public URL
railway domain
```

## Step 6: Integrate with Telex.im

1. **Get Telex access:**
   ```
   /telex-invite your-email@example.com
   ```

2. **Update workflow.json:**
   - Replace `YOUR_DEPLOYMENT_URL` with your actual URL
   - Example: `https://your-app.up.railway.app/a2a/agent/urlScanner`

3. **Import to Telex.im:**
   - Upload your `workflow.json` to Telex.im dashboard

4. **Test on Telex:**
   - Send a message: "Can you check if https://example.com is safe?"
   - View logs: `https://api.telex.im/agent-logs/{channel-id}.txt`

## Common Issues

### "Cannot find module @mastra/core"
```bash
npm install
```

### "OPENROUTER_API_KEY not set"
Make sure you:
1. Copied `.env.example` to `.env`
2. Added your actual API key
3. Restarted the server

### "Port 3000 already in use"
Change the port in `.env`:
```env
PORT=3001
```

### Agent not responding
1. Check the logs in terminal
2. Verify API keys are valid
3. Test with curl first
4. Check VirusTotal rate limits (4 req/min on free tier)

## Project Structure

```
stage-3-mastra-agent/
├── src/
│   ├── agent.ts           # Mastra agent configuration
│   ├── index.ts           # Express server
│   ├── test-agent.ts      # Test script
│   ├── tools/
│   │   └── url-scanner-tool.ts
│   └── utils/
│       ├── cache.ts       # Caching logic
│       └── scanner.ts     # URL scanning
├── workflow.json          # Telex.im configuration
├── .env                   # Your environment variables (git-ignored)
├── .env.example           # Template
├── package.json
├── tsconfig.json
├── README.md              # Full documentation
├── DEPLOYMENT.md          # Deployment guide
└── BLOG_TEMPLATE.md       # Blog post template
```

## Next Steps

- ✅ Test the agent locally
- ✅ Deploy to your preferred platform
- ✅ Integrate with Telex.im
- ✅ Write your blog post (use BLOG_TEMPLATE.md)
- ✅ Tweet about your agent (tag @mastra)
- ✅ Submit via `/submit` on Telex.im

## Need Help?

- Check [README.md](./README.md) for detailed documentation
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Review code comments
- Open an issue on GitHub

---

**Happy coding! 🎉**
