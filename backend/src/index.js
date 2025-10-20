require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createIndex, client } = require('./elasticService');
const { startAllImap } = require('./imapService');
const OpenAI = require('openai');
const { generateReply } = require("./aiService");


const app = express();
const PORT = process.env.PORT || 4000;


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());
app.use(cors());

// Health check route
app.get('/', (req, res) => {
  res.send('OneBox Backend Running');
});

// Elasticsearch search route
app.get('/api/emails/search', async (req, res) => {
  const { q } = req.query;

  try {
    const response = await client.search({
      index: 'emails',
      body: {
        query: q
          ? {
              multi_match: {
                query: q,
                fields: ['subject', 'from', 'body'],
                fuzziness: 'AUTO'
              }
            }
          : { match_all: {} }
      },
      size: 50
    });

    const emails = response.hits.hits.map(hit => ({
      id: hit._id,
      subject: hit._source.subject,
      from: hit._source.from,
      body: hit._source.body,
      category: hit._source.category || "N/A"
    }));

    res.json(emails);
  } catch (err) {
    console.error('Search failed:', err);
    res.status(500).send('Search failed');
  }
});

// Suggest reply route
app.post("/api/emails/suggest-reply", async (req, res) => {
  try {
    const { emailBody, context } = req.body;
    if (!emailBody) return res.status(400).json({ error: "Email body is required" });

    const suggestion = await generateReply(emailBody, context);
    res.json({ suggestion });
  } catch (err) {
    console.error("Error generating reply:", err);

    if (err.code === "insufficient_quota" || err.status === 429) {
      return res.status(429).json({ error: "Quota exceeded. Please try again later." });
    }

    res.status(500).json({ error: "Failed to generate suggestion. Please try again." });
  }
});

// Start backend
app.listen(PORT, async () => {
  console.log(`Backend listening on port ${PORT}`);

  // Create Elasticsearch index if not exists
  await createIndex();

  // Start fetching emails via IMAP
  startAllImap();
});
