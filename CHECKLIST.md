# ✅ Pre-Deployment Checklist

Complete these steps before deploying and submitting your agent.

---

## 1. Environment Setup

### Required
- [ ] Get OpenRouter API key from https://openrouter.ai/
  - Sign up / Login
  - Navigate to Keys section
  - Create new API key
  - Copy the key (starts with `sk-or-v1-`)

### Recommended  
- [ ] Get VirusTotal API key from https://www.virustotal.com/gui/my-apikey
  - Sign up (free tier available)
  - Copy API key from dashboard

### Configure
- [ ] Copy `.env.example` to `.env`
- [ ] Add your `OPENROUTER_API_KEY` to `.env`
- [ ] Add your `VIRUSTOTAL_API_KEY` to `.env` (optional)
- [ ] Test that `.env` is loaded correctly

---

## 2. Local Testing

- [ ] Install dependencies: `npm install`
- [ ] Start dev server: `npm run dev`
- [ ] Verify server starts without errors
- [ ] Test health endpoint: `curl http://localhost:3000/health`
- [ ] Test with a safe URL (e.g., google.com)
- [ ] Test with a suspicious pattern
- [ ] Run test script: `npm run test-agent`
- [ ] Verify responses are sensible
- [ ] Check cache is working (repeated URLs faster)
- [ ] Test A2A endpoint format

---

## 3. Code Review

- [ ] All TypeScript errors resolved
- [ ] No console errors in runtime
- [ ] Error handling in place
- [ ] API keys not committed to git
- [ ] `.env` is in `.gitignore`
- [ ] Code is commented where needed
- [ ] No hardcoded secrets
- [ ] All imports work correctly

---

## 4. Documentation

- [ ] README.md is complete and accurate
- [ ] QUICKSTART.md tested by following steps
- [ ] DEPLOYMENT.md reviewed
- [ ] workflow.json validated
- [ ] All placeholders replaced with actual info
- [ ] Screenshots/demos prepared (optional but nice)

---

## 5. Git Repository

- [ ] Create GitHub repository
- [ ] Add meaningful README
- [ ] Push all code
- [ ] Verify `.env` is NOT pushed (check .gitignore)
- [ ] Add repository description
- [ ] Add topics/tags (typescript, ai, mastra, telex, security)
- [ ] Ensure repository is public

---

## 6. Deployment

### Choose Platform (pick one)
- [ ] Railway (recommended) - https://railway.app
- [ ] Render - https://render.com  
- [ ] Heroku - https://heroku.com
- [ ] Other (see DEPLOYMENT.md)

### Deploy Steps
- [ ] Connect GitHub repository
- [ ] Configure build settings
- [ ] Add environment variables
- [ ] Deploy and wait for build
- [ ] Get public URL
- [ ] Test deployed endpoint

### Verify Deployment
```bash
# Replace with your actual URL
export YOUR_URL="https://your-app.railway.app"

# Test health
curl $YOUR_URL/health

# Test agent
curl -X POST $YOUR_URL/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Is https://google.com safe?"}'

# Test A2A endpoint
curl -X POST $YOUR_URL/a2a/agent/urlScanner \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Check https://github.com"}]}'
```

- [ ] Health endpoint returns 200
- [ ] Test endpoint works
- [ ] A2A endpoint returns proper format
- [ ] Responses are sensible
- [ ] No 500 errors
- [ ] Check logs for errors

---

## 7. Telex.im Integration

### Get Access
- [ ] Request Telex invite: `/telex-invite your-email@example.com`
- [ ] Wait for invitation
- [ ] Login to Telex.im

### Configure Workflow
- [ ] Open `workflow.json`
- [ ] Replace `YOUR_DEPLOYMENT_URL` with actual URL
  - Example: `https://your-app.railway.app/a2a/agent/urlScanner`
- [ ] Verify JSON is valid (use jsonlint.com)
- [ ] Import workflow to Telex.im dashboard

### Test on Telex
- [ ] Send test message in Telex chat
- [ ] Verify agent responds
- [ ] Test with different URLs
- [ ] Check response quality
- [ ] View agent logs at: `https://api.telex.im/agent-logs/{channel-id}.txt`

---

## 8. Blog Post

- [ ] Use BLOG_TEMPLATE.md as starting point
- [ ] Customize with your experience
- [ ] Add screenshots/code snippets
- [ ] Include challenges faced
- [ ] Share what you learned
- [ ] Add links (GitHub, demo, etc.)
- [ ] Proofread for typos
- [ ] Publish on Medium/Dev.to/Hashnode

---

## 9. Social Media

- [ ] Choose tweet template from TWEET_TEMPLATES.md
- [ ] Customize with your info
- [ ] Add screenshots if possible
- [ ] Tag @mastra (required for TS/JS devs)
- [ ] Tag @hnginternship
- [ ] Tag @teleximapp
- [ ] Include relevant hashtags
- [ ] Add link to blog post
- [ ] Add link to GitHub repo
- [ ] Add link to live demo
- [ ] Post tweet
- [ ] Engage with replies

---

## 10. Final Submission

### HNG Submission Command
Run on Telex.im in `#stage-3-backend`:
```
/submit
```

### Fill in Submission Form
- [ ] Project name: URL Safety Scanner Agent
- [ ] GitHub repository URL
- [ ] Live deployment URL
- [ ] Blog post URL
- [ ] Tweet URL
- [ ] Any additional notes

### Verify Submission
- [ ] All URLs are accessible
- [ ] GitHub repo is public
- [ ] Live demo works
- [ ] Blog post is published
- [ ] Tweet is public

---

## 11. Post-Submission

- [ ] Monitor deployment logs
- [ ] Check for errors
- [ ] Respond to feedback
- [ ] Fix any issues found
- [ ] Update documentation if needed
- [ ] Share your experience with others
- [ ] Help other participants if possible

---

## Troubleshooting Common Issues

### "Agent not responding on Telex"
1. Check deployment logs
2. Verify URL in workflow.json
3. Test endpoint manually
4. Check environment variables
5. Review Telex agent logs

### "OpenRouter API error"
1. Verify API key is correct
2. Check account has credits
3. Test key with curl

### "VirusTotal rate limit"
1. Normal on free tier (4 req/min)
2. Agent will fallback to heuristics
3. Caching reduces API calls
4. Consider upgrading for production

### "Deployment failed"
1. Check build logs
2. Verify package.json scripts
3. Ensure all dependencies listed
4. Check Node.js version compatibility

---

## Success Criteria

Your agent is ready for submission when:

✅ Runs locally without errors  
✅ Deployed and publicly accessible  
✅ Integrated with Telex.im  
✅ Responds intelligently to queries  
✅ Blog post published  
✅ Tweet posted with required tags  
✅ All documentation complete  
✅ GitHub repository public  
✅ Submission form completed  

---

## Time Estimate

- Environment setup: 10 minutes
- Local testing: 15 minutes
- Deployment: 20 minutes
- Telex integration: 15 minutes
- Blog post: 1-2 hours
- Social media: 15 minutes
- Submission: 10 minutes

**Total: ~3 hours** (plus blog writing time)

---

## Need Help?

- Check README.md for details
- Review QUICKSTART.md for setup
- See DEPLOYMENT.md for deployment
- Open GitHub issue for bugs
- Ask in HNG community

---

**Good luck with your submission! 🚀**

You've got this! 💪
