# 📮 Postman Testing Guide

Complete guide to testing your URL Safety Scanner Agent with Postman.

---

## 🚀 Quick Setup

### Step 1: Start Your Server

```bash
# Make sure you have your .env configured
npm run dev
```

You should see:
```
🚀 URL Safety Scanner Agent running on port 3000
📍 A2A endpoint: http://localhost:3000/a2a/agent/urlScanner
🧪 Test endpoint: http://localhost:3000/test
❤️  Health check: http://localhost:3000/health
```

### Step 2: Open Postman

Download Postman if you haven't: https://www.postman.com/downloads/

---

## 📡 Endpoints to Test

### 1. Health Check Endpoint ✅

**Purpose**: Verify server is running and check cache statistics

**Method**: `GET`  
**URL**: `http://localhost:3000/health`  
**Headers**: None required

**Expected Response** (200 OK):
```json
{
  "status": "healthy",
  "service": "URL Safety Scanner Agent",
  "cache": {
    "hits": 0,
    "misses": 0,
    "keys": 0
  },
  "timestamp": "2025-11-05T12:34:56.789Z"
}
```

#### Postman Setup:
1. Click **"New"** → **"HTTP Request"**
2. Method: **GET**
3. URL: `http://localhost:3000/health`
4. Click **"Send"**

---

### 2. Test Endpoint (Simple) 🧪

**Purpose**: Quick testing with simple message format

**Method**: `POST`  
**URL**: `http://localhost:3000/test`  
**Headers**: 
- `Content-Type: application/json`

**Body** (raw JSON):
```json
{
  "message": "Is https://google.com safe?"
}
```

**Expected Response** (200 OK):
```json
{
  "message": "I've scanned the URL https://google.com and it appears SAFE. VirusTotal found no threats across 70+ security engines. This is a well-known and trusted domain.",
  "usage": {
    "inputTokens": 45,
    "outputTokens": 32
  }
}
```

#### Postman Setup:
1. Method: **POST**
2. URL: `http://localhost:3000/test`
3. Go to **Headers** tab:
   - Key: `Content-Type`
   - Value: `application/json`
4. Go to **Body** tab:
   - Select **"raw"**
   - Select **"JSON"** from dropdown
   - Paste the JSON above
5. Click **"Send"**

---

### 3. A2A Endpoint (Telex Format) 🔌

**Purpose**: Test the actual Telex.im integration endpoint

**Method**: `POST`  
**URL**: `http://localhost:3000/a2a/agent/urlScanner`  
**Headers**: 
- `Content-Type: application/json`

**Body** (raw JSON):
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Can you check if https://github.com is safe?"
    }
  ],
  "resourceId": "test-resource-123"
}
```

**Expected Response** (200 OK):
```json
{
  "messages": [
    {
      "role": "assistant",
      "content": "I've scanned https://github.com and it appears SAFE. VirusTotal found no threats. GitHub is a trusted platform for developers."
    }
  ]
}
```

#### Postman Setup:
1. Method: **POST**
2. URL: `http://localhost:3000/a2a/agent/urlScanner`
3. Go to **Headers** tab:
   - Key: `Content-Type`
   - Value: `application/json`
4. Go to **Body** tab:
   - Select **"raw"**
   - Select **"JSON"** from dropdown
   - Paste the JSON above
5. Click **"Send"**

---

## 🧪 Test Cases Collection

Here are various test cases to try:

### Test Case 1: Safe URL (Well-known site)
```json
{
  "message": "Is https://google.com safe?"
}
```

### Test Case 2: Another Safe URL
```json
{
  "message": "Check this: https://github.com"
}
```

### Test Case 3: URL with IP Address (Suspicious)
```json
{
  "message": "Is http://192.168.1.1 safe?"
}
```

### Test Case 4: URL Shortener (Suspicious)
```json
{
  "message": "Can you scan bit.ly/test123"
}
```

### Test Case 5: Non-HTTPS URL
```json
{
  "message": "What about http://example.com?"
}
```

### Test Case 6: Multiple URLs in Conversation (A2A Format)
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hi, can you help me check some URLs?"
    },
    {
      "role": "assistant",
      "content": "Of course! I can scan URLs for safety. Just send me the URL you'd like me to check."
    },
    {
      "role": "user",
      "content": "Check https://example.com"
    }
  ]
}
```

### Test Case 7: Cached URL (Test Caching)
```json
{
  "message": "Is https://google.com safe?"
}
```
**Note**: Run this twice - second request should be faster (cache hit)!

### Test Case 8: Without Explicit Question
```json
{
  "message": "https://suspicious-site-example.com"
}
```
**Note**: Agent should proactively offer to scan it

---

## 📦 Postman Collection (Import This!)

You can import this as a Postman collection:

1. In Postman, click **"Import"**
2. Select **"Raw text"**
3. Paste the JSON below:

```json
{
  "info": {
    "name": "URL Safety Scanner Agent",
    "description": "Test endpoints for URL Safety Scanner Agent",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/health",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["health"]
        }
      }
    },
    {
      "name": "Test Endpoint - Safe URL",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"message\": \"Is https://google.com safe?\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/test",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["test"]
        }
      }
    },
    {
      "name": "Test Endpoint - Suspicious URL",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"message\": \"Check http://192.168.1.1\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/test",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["test"]
        }
      }
    },
    {
      "name": "A2A Endpoint - GitHub",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"messages\": [\n    {\n      \"role\": \"user\",\n      \"content\": \"Can you check if https://github.com is safe?\"\n    }\n  ],\n  \"resourceId\": \"test-123\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/a2a/agent/urlScanner",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["a2a", "agent", "urlScanner"]
        }
      }
    },
    {
      "name": "A2A Endpoint - Conversation",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"messages\": [\n    {\n      \"role\": \"user\",\n      \"content\": \"Hi!\"\n    },\n    {\n      \"role\": \"assistant\",\n      \"content\": \"Hello! I can help you check URLs for safety.\"\n    },\n    {\n      \"role\": \"user\",\n      \"content\": \"Check https://example.com\"\n    }\n  ]\n}"
        },
        "url": {
          "raw": "http://localhost:3000/a2a/agent/urlScanner",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["a2a", "agent", "urlScanner"]
        }
      }
    }
  ]
}
```

---

## 🎯 Testing Workflow

### Step-by-Step Testing Process:

1. **Start with Health Check**
   - Verify server is running
   - Check cache statistics (should be 0 initially)

2. **Test Simple Endpoint First**
   - Use `/test` endpoint with safe URL
   - Verify you get a response
   - Check response format

3. **Test A2A Endpoint**
   - Use `/a2a/agent/urlScanner`
   - Verify response matches A2A format
   - Test with conversation history

4. **Test Caching**
   - Send same URL twice
   - Second request should be faster
   - Check `/health` to see cache hits

5. **Test Different Scenarios**
   - Safe URLs (google.com, github.com)
   - Suspicious patterns (IPs, shorteners)
   - Invalid URLs
   - Edge cases

---

## 📊 What to Look For

### ✅ Success Indicators:

- **Status**: 200 OK
- **Response Time**: <500ms for cached, ~2s for new URLs
- **Response Format**: Valid JSON
- **Content**: Sensible security analysis
- **Cache Hits**: Increasing on repeated URLs

### ❌ Error Indicators:

- **Status**: 400 (Bad Request), 500 (Server Error)
- **Missing Fields**: Required fields not present
- **Timeout**: Request takes too long
- **Invalid JSON**: Malformed response

---

## 🔍 Advanced Testing

### Testing Cache Performance

1. First request:
   ```json
   {"message": "Is https://google.com safe?"}
   ```
   **Note the response time** (e.g., 2000ms)

2. Check health endpoint:
   ```
   GET /health
   ```
   Should show: `"hits": 0, "misses": 1`

3. Second request (same URL):
   ```json
   {"message": "Is https://google.com safe?"}
   ```
   **Should be much faster** (e.g., 300ms)

4. Check health again:
   ```
   GET /health
   ```
   Should show: `"hits": 1, "misses": 1`

### Testing Error Handling

1. **Missing message**:
   ```json
   {}
   ```
   Should return 400 error

2. **Invalid JSON**:
   ```
   {message: "test"}
   ```
   Should return 400 error

3. **Missing messages array (A2A)**:
   ```json
   {"resourceId": "123"}
   ```
   Should return 400 error

---

## 🌐 Testing Deployed Version

Once deployed, update the URLs:

**Local**: `http://localhost:3000`  
**Deployed**: `https://your-app.railway.app`

### Example with Deployed URL:

**Health Check**:
```
GET https://your-app.railway.app/health
```

**Test Endpoint**:
```
POST https://your-app.railway.app/test
Content-Type: application/json

{
  "message": "Is https://google.com safe?"
}
```

---

## 💡 Pro Tips

1. **Save Requests**: Save commonly used requests in Postman
2. **Use Environment Variables**: Set `{{baseUrl}}` variable
3. **Test Sequences**: Use Postman Runner for sequential tests
4. **Monitor Responses**: Check response times in Postman
5. **Compare Results**: Use Postman's comparison features
6. **Export Collection**: Share collection with team

### Setting Up Environment Variable:

1. Click **"Environments"** (top right)
2. Create new environment: "Local"
3. Add variable:
   - Name: `baseUrl`
   - Value: `http://localhost:3000`
4. Use in requests: `{{baseUrl}}/health`

---

## 📝 Expected Behavior

### First Request (Cache Miss):
- ⏱️ Response time: ~2 seconds
- 🔍 Scans with VirusTotal or heuristics
- 💾 Stores result in cache

### Subsequent Requests (Cache Hit):
- ⚡ Response time: <500ms
- 📦 Retrieves from cache
- ✅ Same accurate results

### Different URLs:
- Each unique URL triggers new scan
- Cache stores multiple URLs
- Cache expires after 1 hour (configurable)

---

## 🐛 Troubleshooting

### "Connection Refused"
**Problem**: Server not running  
**Solution**: Run `npm run dev`

### "OPENROUTER_API_KEY not set"
**Problem**: Missing API key  
**Solution**: Add to `.env` file and restart

### "Request timeout"
**Problem**: VirusTotal API slow or rate limited  
**Solution**: Normal on first request, faster on cached

### "Invalid JSON"
**Problem**: Malformed request body  
**Solution**: Copy exact JSON from this guide

---

## ✅ Testing Checklist

- [ ] Health endpoint returns 200
- [ ] Test endpoint works with safe URL
- [ ] Test endpoint works with suspicious URL
- [ ] A2A endpoint returns proper format
- [ ] Caching works (second request faster)
- [ ] Cache statistics update correctly
- [ ] Error handling works (invalid input)
- [ ] Response times acceptable
- [ ] All JSON responses valid
- [ ] Agent provides sensible analysis

---

## 🎉 You're All Set!

Start with the health check, then work through the test cases.

**Happy Testing! 🧪**

---

**Need help?** Check the main README.md or create an issue.
