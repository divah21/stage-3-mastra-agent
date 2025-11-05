# URL Safety Scanner Agent 🔒

An intelligent AI agent built with Mastra that scans URLs for security threats, malware, and phishing attempts. Integrated with Telex.im using the A2A (Agent-to-Agent) protocol.

## 🎯 Overview

The URL Safety Scanner Agent helps users identify potentially dangerous URLs before visiting them. It combines:
- **AI-powered analysis** using OpenRouter (with DeepSeek/Kimi models)
- **Threat intelligence** from VirusTotal API
- **Heuristic scanning** for pattern-based threat detection
- **Smart caching** to improve response times and reduce API calls

## ✨ Features

- ✅ Real-time URL scanning for threats
- ✅ Integration with VirusTotal for comprehensive threat analysis
- ✅ Intelligent heuristic scanning as fallback
- ✅ In-memory caching for faster repeated scans
- ✅ Clear threat level classification (Safe, Suspicious, Malicious, Unknown)
- ✅ User-friendly explanations of security findings
- ✅ Full A2A protocol support for Telex.im
- ✅ Detailed security recommendations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- OpenRouter API key ([Get one here](https://openrouter.ai/))
- VirusTotal API key (optional but recommended - [Get free key](https://www.virustotal.com/gui/my-apikey))

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd stage-3-mastra-agent
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
PORT=3000
CACHE_TTL=3600
```

4. **Run the development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
npm start
```

## 📡 API Endpoints

### A2A Endpoint (Telex.im Integration)
```
POST /a2a/agent/urlScanner
```

**Request format:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Can you check if https://example.com is safe?"
    }
  ],
  "resourceId": "optional-resource-id"
}
```

**Response format:**
```json
{
  "messages": [
    {
      "role": "assistant",
      "content": "I've scanned the URL and it appears SAFE. VirusTotal found no threats..."
    }
  ]
}
```

### Health Check
```
GET /health
```

Returns server status and cache statistics.

### Test Endpoint (Local Development)
```
POST /test
```

**Request:**
```json
{
  "message": "Is https://example.com safe?"
}
```

## 🔧 How It Works

### 1. URL Scanning Process

```
User Request → Cache Check → Threat Analysis → AI Interpretation → Response
```

1. **Cache Check**: First checks if URL was recently scanned
2. **Threat Analysis**:
   - If VirusTotal API key available: Query VirusTotal database
   - Otherwise: Perform heuristic analysis
3. **AI Interpretation**: Mastra agent analyzes results and generates user-friendly response
4. **Caching**: Store results for faster future lookups

### 2. Threat Detection Methods

#### VirusTotal Integration
- Queries 70+ security engines
- Provides detailed threat intelligence
- Identifies malware, phishing, and suspicious content

#### Heuristic Analysis (Fallback)
- Checks for suspicious patterns (IP addresses, random strings)
- Validates HTTPS usage
- Detects common phishing keywords
- Identifies URL shorteners

### 3. Threat Level Classification

| Level | Description |
|-------|-------------|
| **Safe** | No threats detected, safe to visit |
| **Suspicious** | Potential risks detected, proceed with caution |
| **Malicious** | Confirmed threats, do NOT visit |
| **Unknown** | Unable to fully analyze, exercise caution |

## 🔌 Telex.im Integration

### Setup Instructions

1. **Get Telex access**
```
/telex-invite your-email@example.com
```

2. **Deploy your agent**
   - Deploy to a hosting service (Heroku, Railway, Render, etc.)
   - Get your public URL

3. **Update workflow.json**
   - Replace `YOUR_DEPLOYMENT_URL` with your actual deployment URL
   - Example: `https://your-app.herokuapp.com/a2a/agent/urlScanner`

4. **Import workflow to Telex.im**
   - Use the `workflow.json` file in this repository
   - Configure in Telex.im dashboard

5. **Test your agent**
   - Send messages in Telex.im
   - View interaction logs at: `https://api.telex.im/agent-logs/{channel-id}.txt`

## 📦 Project Structure

```
stage-3-mastra-agent/
├── src/
│   ├── agent.ts              # Mastra agent configuration
│   ├── index.ts              # Express server and A2A endpoints
│   ├── tools/
│   │   └── url-scanner-tool.ts   # Tool definition and schemas
│   └── utils/
│       ├── cache.ts          # URL scan result caching
│       └── scanner.ts        # URL scanning logic
├── workflow.json             # Telex.im workflow configuration
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🧪 Testing

### Local Testing

```bash
# Test with curl
curl -X POST http://localhost:3000/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Is https://google.com safe?"}'

# Check health
curl http://localhost:3000/health
```

### Test A2A Endpoint

```bash
curl -X POST http://localhost:3000/a2a/agent/urlScanner \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Check this URL: https://example.com"
      }
    ]
  }'
```

## 🌐 Deployment

### Deploy to Railway (Recommended)

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Add environment variables in Railway dashboard
5. Deploy: `railway up`

### Deploy to Heroku

```bash
heroku create your-app-name
heroku config:set OPENROUTER_API_KEY=your_key
heroku config:set VIRUSTOTAL_API_KEY=your_key
git push heroku main
```

### Deploy to Render

1. Connect your GitHub repository
2. Configure environment variables
3. Deploy with auto-build

## 🔐 Security Best Practices

- Never commit API keys to version control
- Use `.env` files for local development
- Set environment variables in production
- Rotate API keys regularly
- Monitor API usage and rate limits

## 🐛 Troubleshooting

### "Cannot find module '@mastra/core'"
```bash
npm install
```

### "OPENROUTER_API_KEY not set"
- Check your `.env` file
- Ensure you've copied `.env.example` to `.env`
- Verify the API key is valid

### "VirusTotal API error"
- Free tier has rate limits (4 requests/minute)
- Agent will fallback to heuristic scanning automatically

### Agent not responding on Telex
- Verify your deployment URL is publicly accessible
- Check `workflow.json` has correct URL
- View logs at `https://api.telex.im/agent-logs/{channel-id}.txt`

## 📊 Cache Statistics

The agent includes intelligent caching to:
- Reduce API calls to VirusTotal
- Improve response times for repeated URLs
- Lower operational costs

Cache TTL (Time-To-Live) defaults to 1 hour, configurable via `CACHE_TTL` environment variable.

## 🛠️ Technologies Used

- **Mastra** - AI agent framework
- **OpenRouter** - AI model provider (Kimi K2)
- **Express.js** - Web server
- **TypeScript** - Type-safe development
- **VirusTotal API** - Threat intelligence
- **NodeCache** - In-memory caching

## 📝 License

MIT

## 👤 Author

Built for HNG Stage 3 Backend Task

## 🙏 Acknowledgments

- Mastra team for the excellent agent framework
- VirusTotal for threat intelligence API
- Telex.im for A2A protocol integration

---

**Need help?** Open an issue or contact via Telex.im

**Happy URL scanning! 🔒✨**
