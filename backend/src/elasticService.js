const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTIC_URL,
  auth: {
    apiKey: process.env.ELASTIC_API_KEY
  },
  ssl: {
    rejectUnauthorized: false
  }
});

const INDEX_NAME = 'emails';

async function createIndex() {
  try {
    const exists = await client.indices.exists({ index: INDEX_NAME });
    if (!exists) {
      await client.indices.create({
        index: INDEX_NAME,
        body: {
          mappings: {
            properties: {
              subject: { type: 'text' },
              from: { type: 'text' },
              body: { type: 'text' },
              category: { type: 'keyword' },
              date: { type: 'date' }
            }
          }
        }
      });
      console.log(`Index "${INDEX_NAME}" created`);
    } else {
      console.log(`Index "${INDEX_NAME}" already exists`);
    }
  } catch (error) {
    console.error('Error creating index:', error.meta?.body || error);
  }
}

async function indexEmail(email) {
  if (!email.subject || !email.from || !email.body) {
    console.warn('Skipping invalid email:', email);
    return;
  }

  try {
    await client.index({
      index: INDEX_NAME,
      id: email.id,
      body: email
    });
    console.log(`Indexed email: ${email.subject}`);
  } catch (error) {
    console.error('Failed to index email:', error.meta?.body || error);
  }
}

module.exports = { createIndex, indexEmail, client };
