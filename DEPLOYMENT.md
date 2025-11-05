# Deployment Guide - URL Safety Scanner Agent

This guide will help you deploy your URL Safety Scanner Agent to various platforms.

## Prerequisites

Before deploying, ensure you have:
- ✅ OpenRouter API key
- ✅ VirusTotal API key (optional)
- ✅ Code pushed to a Git repository (GitHub, GitLab, etc.)

## Option 1: Deploy to Railway (Recommended)

Railway offers easy deployment with great developer experience.

### Steps:

1. **Install Railway CLI** (optional)
```bash
npm install -g @railway/cli
```

2. **Create a Railway account** at https://railway.app

3. **Deploy via GitHub**
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect it's a Node.js project

4. **Add Environment Variables**
   - In Railway dashboard, go to your project
   - Click on "Variables" tab
   - Add these variables:
     ```
     OPENROUTER_API_KEY=your_key_here
     VIRUSTOTAL_API_KEY=your_key_here
     PORT=3000
     CACHE_TTL=3600
     ```

5. **Configure Build Settings**
   Railway should auto-detect, but if needed:
   - Build Command: `npm run build`
   - Start Command: `npm start`

6. **Get Your Public URL**
   - Railway will provide a public URL like: `https://your-app.up.railway.app`
   - Use this URL in your `workflow.json`

### Deploy via CLI:
```bash
railway login
railway init
railway up
railway variables set OPENROUTER_API_KEY=your_key
railway variables set VIRUSTOTAL_API_KEY=your_key
```

## Option 2: Deploy to Render

1. **Create Render account** at https://render.com

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: `url-safety-scanner`
     - Environment: `Node`
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`

3. **Add Environment Variables**
   ```
   OPENROUTER_API_KEY=your_key
   VIRUSTOTAL_API_KEY=your_key
   PORT=3000
   CACHE_TTL=3600
   ```

4. **Deploy**
   - Render auto-deploys on git push
   - Get your URL: `https://your-app.onrender.com`

## Option 3: Deploy to Heroku

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Login and Create App**
```bash
heroku login
heroku create your-app-name
```

3. **Add Buildpack**
```bash
heroku buildpacks:set heroku/nodejs
```

4. **Set Environment Variables**
```bash
heroku config:set OPENROUTER_API_KEY=your_key
heroku config:set VIRUSTOTAL_API_KEY=your_key
heroku config:set PORT=3000
heroku config:set CACHE_TTL=3600
```

5. **Deploy**
```bash
git push heroku main
```

6. **Open App**
```bash
heroku open
heroku logs --tail
```

## Option 4: Deploy to Vercel

Note: Vercel is optimized for serverless/edge functions. You'll need to adapt the Express app.

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Create `vercel.json`**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ],
  "env": {
    "OPENROUTER_API_KEY": "@openrouter-api-key",
    "VIRUSTOTAL_API_KEY": "@virustotal-api-key"
  }
}
```

3. **Deploy**
```bash
npm run build
vercel
```

4. **Set Environment Variables**
```bash
vercel env add OPENROUTER_API_KEY
vercel env add VIRUSTOTAL_API_KEY
```

## Option 5: Deploy to DigitalOcean App Platform

1. **Create DigitalOcean account** at https://digitalocean.com

2. **Create New App**
   - Go to App Platform
   - Click "Create App"
   - Connect GitHub repository

3. **Configure Build**
   - Build Command: `npm run build`
   - Run Command: `npm start`

4. **Add Environment Variables** in the dashboard

5. **Deploy** - DigitalOcean handles the rest

## Post-Deployment Checklist

After deploying to any platform:

### 1. Test Your Deployment
```bash
# Health check
curl https://your-app-url.com/health

# Test endpoint
curl -X POST https://your-app-url.com/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Is https://google.com safe?"}'
```

### 2. Update `workflow.json`
Replace the URL in `workflow.json`:
```json
{
  "url": "https://your-actual-deployment-url.com/a2a/agent/urlScanner"
}
```

### 3. Configure Telex.im
1. Import your `workflow.json` to Telex.im
2. Test the agent in Telex chat
3. Check logs at: `https://api.telex.im/agent-logs/{channel-id}.txt`

### 4. Monitor Your Agent
- Check application logs regularly
- Monitor API usage (OpenRouter, VirusTotal)
- Set up error alerts if available
- Track cache hit rates via `/health` endpoint

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | ✅ Yes | Your OpenRouter API key |
| `VIRUSTOTAL_API_KEY` | ⚠️ Recommended | VirusTotal API key (free tier available) |
| `PORT` | ⚠️ Platform-specific | Server port (usually auto-set) |
| `CACHE_TTL` | ❌ Optional | Cache duration in seconds (default: 3600) |

## Troubleshooting

### "Cannot connect to agent"
- Verify your deployment URL is publicly accessible
- Check that environment variables are set
- Review application logs

### "OpenRouter API error"
- Verify API key is correct and active
- Check OpenRouter account balance/credits
- Review rate limits

### "Slow responses"
- VirusTotal free tier has rate limits (4 req/min)
- Consider caching (already implemented)
- Check network latency

### "Agent not responding on Telex"
- Verify `workflow.json` URL is correct
- Test endpoint manually with curl
- Check Telex agent logs

## Scaling Considerations

### For Production Use:
1. **Database Cache**: Replace in-memory cache with Redis
2. **Rate Limiting**: Add rate limiting middleware
3. **Monitoring**: Set up APM (DataDog, New Relic, etc.)
4. **Load Balancing**: Use multiple instances
5. **CI/CD**: Automate deployments with GitHub Actions

## Cost Estimates

| Service | Free Tier | Estimated Monthly Cost |
|---------|-----------|------------------------|
| Railway | $5 credit/month | ~$5-10 (hobby use) |
| Render | 750 hours/month | Free (for light use) |
| Heroku | No free tier | ~$7/month (Eco dyno) |
| OpenRouter | Pay-per-use | ~$1-5 (varies by model) |
| VirusTotal | 4 req/min | Free |

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Rotate API keys** regularly
3. **Use HTTPS** for all endpoints
4. **Implement rate limiting** for production
5. **Monitor for unusual activity**
6. **Keep dependencies updated**: `npm audit fix`

## Next Steps

After deployment:
1. ✅ Test your agent thoroughly
2. ✅ Write your blog post about the experience
3. ✅ Tweet about your agent (tag @mastra)
4. ✅ Submit via `/submit` command on Telex
5. ✅ Monitor and improve based on usage

---

**Need help?** Check the main README or create an issue on GitHub.

**Happy deploying! 🚀**
