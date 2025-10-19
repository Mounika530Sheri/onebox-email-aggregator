require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createIndex, client } = require('./elasticService');
const { startAllImap } = require('./imapService');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

// Root route
app.get('/', (req, res) => {
  res.send('OneBox Backend Running');
});

// Search emails
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

// Start server
app.listen(PORT, async () => {
  console.log(`Backend listening on port ${PORT}`);

  try {
    // Create Elasticsearch index first
    await createIndex();
    console.log('Elasticsearch index ready');

    // Then start all IMAP connections
    startAllImap();
  } catch (err) {
    console.error('Initialization error:', err);
  }
});
