# Flower Bloom Demo

Touch or click anywhere on the screen to spawn a blooming flower. Each touch creates a flower at the touch point and the flower color is chosen randomly.

## Files
- [index.html](index.html)
- [styles.css](styles.css)
- [script.js](script.js)

## Run

Open `index.html` in your browser, or run a simple HTTP server in this folder:

```bash
python -m http.server 8000
# then open http://localhost:8000/index.html
```

## Features
- Initial landing page with animated heart-shaped `love` button. Click it to enter the experience.
- `Yes` / `No` buttons on the Valentine screen.
  - **Yes**: Transitions to flower collection page with instruction text.
  - **No**: Starts counting screen taps for 10 seconds, then sends the count to your email.
- Click anywhere on the instruction screen to dismiss it and start blooming flowers.
- Each tap creates a random-colored flower that blooms and fades.

## Developer Analytics

All user interactions are automatically tracked and stored in the browser's `localStorage`. Developers can view tracking data using the browser console:

```javascript
// In browser console, run:
getFlowerAppAnalytics()
```

This will display a table of all tracked interactions including:
- **LOVE_BUTTON_CLICKED**: When user clicked the love button
- **YES_BUTTON_CLICKED**: When user clicked Yes
- **NO_BUTTON_CLICKED**: When user clicked No
- **STAGE_CLICK_ON_INSTRUCTION**: When user dismisses instruction text
- **FLOWER_CREATED**: When a flower is created (includes x, y coordinates)
- **SCREEN_TAP_COUNTED**: When a tap is counted during No phase
- **NO_COUNT_COLLECTED**: When the counting period ends

Data includes:
- Timestamp (ISO format)
- Action name
- Details object with specific metadata

### Viewing Interaction Data
1. Open the app in your browser
2. Use the app normally
3. Open browser DevTools (F12 or Right-click → Inspect)
4. Go to Console tab
5. Type `getFlowerAppAnalytics()` and press Enter
6. View the interaction table

The data persists in localStorage for reviewing even after page refresh.

## About Email Sending

The browser cannot silently send emails without a backend service. The demo POSTs the count to `/send-count` — you must provide a server endpoint or use EmailJS integration.

Minimal Node example:

```js
// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());
app.post('/send-count', async (req, res) => {
  const { email, count } = req.body;
  const transporter = nodemailer.createTransport({ /* SMTP config */ });
  await transporter.sendMail({
    from: 'no-reply@example.com',
    to: email,
    subject: 'Tap count',
    text: `Count: ${count}`,
  });
  res.sendStatus(200);
});
app.listen(3000);
```

If you'd like, I can add an example server implementation or integrate EmailJS so the client can send the count without you running a server. Tell me which you prefer.
