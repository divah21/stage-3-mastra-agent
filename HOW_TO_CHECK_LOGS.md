# How to Check Telex Agent Logs

## Getting Your Channel ID

Your Telex channel ID is the **first UUID** in the Telex URL:

**Example URL:**
```
https://telex.im/telex-im/home/colleagues/01989dec-0d08-71ee-9017-00e4556e1942/01989dec-01be-71ee-a273-7744838298d6
                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                      This is your channel ID
```

## Agent Logs URL Format

```
https://api.telex.im/agent-logs/{YOUR-CHANNEL-ID}.txt
```

**Your SafeLink agent logs:**
```
https://api.telex.im/agent-logs/01989dec-0d08-71ee-9017-00e4556e1942.txt
```

(Replace with your actual channel ID from the Telex URL)

## What to Look For in Logs

The logs will show:
- ✅ Incoming messages from users
- ✅ Outgoing responses from SafeLink
- ✅ Any errors or timeout issues
- ✅ Request/response timestamps
- ✅ Full conversation flow

## Troubleshooting

If you don't see responses in Telex but logs show they were sent:
1. Check that workflow.json URL is correct
2. Verify Railway deployment is running
3. Test endpoint directly with Postman
4. Re-import workflow.json in Telex

## Quick Test

After updating your workflow in Telex:

1. Send: "is google.com safe?"
2. Wait 2-3 seconds
3. Check logs at the URL above
4. You should see both your message and SafeLink's response

## Railway Logs

You can also check Railway deployment logs:
1. Go to railway.app
2. Select your project
3. Click "Deployments" → "Logs"
4. Look for `[A2A] Request received` and `[A2A] Response ready` messages

---

**Note:** If Railway shows the response was sent but Telex logs show it wasn't received, there may be a network/timeout issue between Railway and Telex servers.
