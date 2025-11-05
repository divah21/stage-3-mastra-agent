# Telex.im Integration Guide 🔌

Your URL Safety Scanner Agent is deployed and ready! Follow these steps to connect it to Telex.im.

## ✅ Pre-requisites (Completed)

- [x] Agent deployed to Railway: https://stage-3-mastra-agent-production.up.railway.app
- [x] Health check passes: https://stage-3-mastra-agent-production.up.railway.app/health
- [x] A2A endpoint tested and working
- [x] workflow.json updated with Railway URL

## 🚀 Telex.im Setup Steps

### Step 1: Get Telex Access

If you don't have Telex access yet, request an invite:

```
Send message in HNG Slack:
/telex-invite your-email@example.com
```

Wait for confirmation email from Telex.im.

### Step 2: Access Telex Dashboard

1. Log in to Telex.im
2. Navigate to the Workflows section
3. Click "Import Workflow" or "Create New Workflow"

### Step 3: Import Your Workflow

**Option A: Import from File**
1. Click "Import" button in Telex dashboard
2. Upload `workflow.json` from this repository
3. The workflow will load with your agent pre-configured

**Option B: Manual Configuration**
1. Create a new workflow
2. Add an "A2A Node" (Mastra)
3. Configure the node:
   - **Name**: URL Safety Scanner
   - **Type**: a2a/mastra-a2a-node
   - **URL**: `https://stage-3-mastra-agent-production.up.railway.app/a2a/agent/urlScanner`
   - **Description**: AI agent that scans URLs for security threats

### Step 4: Test the Integration

1. In Telex.im, start a conversation with your agent
2. Send test messages:
   ```
   "Is https://google.com safe?"
   "Check this URL: https://googl.com"
   "Can you scan https://github.com?"
   ```
3. Verify the agent responds with scan results

### Step 5: Monitor Agent Logs

View detailed interaction logs:
```
https://api.telex.im/agent-logs/{your-channel-id}.txt
```

Replace `{your-channel-id}` with your actual Telex channel ID (found in dashboard).

## 🧪 Test Scenarios

### Test 1: Safe URL Detection
**Input**: "Is https://google.com safe?"
**Expected**: 
```
Scan result for https://google.com: SAFE
- Safe: Yes
- Source: heuristic
- Details: URL passes all safety checks
```

### Test 2: Typosquatting Detection
**Input**: "Check https://googl.com"
**Expected**: 
```
Scan result for https://googl.com: SUSPICIOUS
- Safe: No
- Source: heuristic
- Details: Possible typosquatting: domain 'googl' is very similar to 'google'
```

### Test 3: Natural Conversation
**Input**: "I got this link in an email: https://github.com - is it legit?"
**Expected**: Agent extracts URL and provides safety analysis

## 📊 Monitoring & Debugging

### Health Check
```bash
curl https://stage-3-mastra-agent-production.up.railway.app/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "URL Safety Scanner Agent",
  "cache": {
    "hits": 0,
    "misses": 0,
    "keys": 0
  },
  "timestamp": "2025-11-05T..."
}
```

### Railway Logs
1. Visit Railway dashboard
2. Click on your deployment
3. View real-time logs in the "Logs" tab

### Telex Agent Logs
```
https://api.telex.im/agent-logs/{channel-id}.txt
```

Look for:
- Request payloads from Telex
- Agent responses
- Any error messages
- Timestamp of interactions

## 🔧 Troubleshooting

### Issue: Agent not responding in Telex

**Check:**
1. Workflow.json URL is correct and accessible
2. Railway deployment is running (check health endpoint)
3. Review Telex agent logs for errors

**Fix:**
```bash
# Test endpoint manually
curl -X POST https://stage-3-mastra-agent-production.up.railway.app/a2a/agent/urlScanner \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Test"}]}'
```

### Issue: Slow responses

**Possible causes:**
- Railway cold start (first request after inactivity)
- VirusTotal API rate limits
- Cache warming up

**Solutions:**
- Keep agent warm with periodic health checks
- Rely on heuristic scanning (faster)
- Consider paid VirusTotal tier for higher limits

### Issue: Incorrect scan results

**Debug:**
1. Test directly via `/test` endpoint:
```bash
curl -X POST https://stage-3-mastra-agent-production.up.railway.app/test \
  -H "Content-Type: application/json" \
  -d '{"message":"Is https://example.com safe?"}'
```

2. Check Railway environment variables:
   - OPENROUTER_API_KEY set?
   - VIRUSTOTAL_API_KEY set? (optional)

## 📝 Submission Checklist

For HNG Stage 3 submission:

- [x] Agent deployed on Railway
- [x] Health endpoint accessible
- [x] A2A endpoint tested
- [x] workflow.json configured with deployment URL
- [ ] Imported workflow into Telex.im
- [ ] Tested agent in Telex conversation
- [ ] Agent logs URL available
- [ ] README and documentation complete

## 🎯 What Telex Evaluators Will Check

1. **Workflow.json validity**
   - Correct A2A node structure
   - Valid deployment URL
   - Proper schema

2. **Agent functionality**
   - Responds to URL safety queries
   - Provides clear threat assessments
   - Handles various URL formats

3. **A2A protocol compliance**
   - Correct request/response format
   - Proper message structure
   - Error handling

4. **Documentation**
   - Clear setup instructions
   - Integration guide
   - Testing procedures

## 🔗 Important URLs

- **Production Agent**: https://stage-3-mastra-agent-production.up.railway.app
- **Health Check**: https://stage-3-mastra-agent-production.up.railway.app/health
- **A2A Endpoint**: https://stage-3-mastra-agent-production.up.railway.app/a2a/agent/urlScanner
- **Test Endpoint**: https://stage-3-mastra-agent-production.up.railway.app/test
- **Telex Logs**: https://api.telex.im/agent-logs/{your-channel-id}.txt

## 📧 Support

If you encounter issues:
1. Check Railway logs
2. Review Telex agent logs
3. Test endpoints manually with curl/Postman
4. Verify environment variables in Railway
5. Ask in HNG Slack #help channel

---

**Status**: ✅ Ready for Telex integration
**Next Step**: Import workflow.json to Telex.im dashboard
