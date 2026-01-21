# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
# lweemee-lethu
# lweemee-lethu

## Meta Webhook Integration

This section documents the setup for the Meta (Instagram) webhook.

### 1. Callback URL

When setting up your webhook subscription in the Meta App Dashboard, use the following URL:

```
https://<your-app-domain>/api/meta/webhook
```

Replace `<your-app-domain>` with your application's public domain name.

### 2. Environment Variable

You must set the following environment variable in your deployment environment (e.g., Netlify, Vercel, Firebase App Hosting):

```
META_VERIFY_TOKEN="lweemee_meta_verify_2026_01_21__Q7m4vN9cK2pL8xR1tD6hZ0"
```

This token must exactly match the "Verify Token" you enter in the Meta App Dashboard.

### 3. Manual Testing

You can test the webhook endpoint locally using `curl`.

#### Testing GET (Verification)

This command simulates Meta's verification request. Replace `http://localhost:9002` with your local development URL.

```bash
curl -X GET 'http://localhost:9002/api/meta/webhook?hub.mode=subscribe&hub.challenge=123456789&hub.verify_token=lweemee_meta_verify_2026_01_21__Q7m4vN9cK2pL8xR1tD6hZ0'
```

If successful, the server will respond with `123456789`.

#### Testing POST (Event Notification)

This command simulates Meta sending a webhook event (e.g., a new comment).

```bash
curl -X POST 'http://localhost:9002/api/meta/webhook' \
-H 'Content-Type: application/json' \
-d '{
  "object": "instagram",
  "entry": [
    {
      "id": "1234567890",
      "time": 1674312961,
      "changes": [
        {
          "field": "comments",
          "value": {
            "media_id": "9876543210",
            "text": "This is an awesome post!"
          }
        }
      ]
    }
  ]
}'
```

If successful, the server will respond with `{"status":"EVENT_RECEIVED"}`.
