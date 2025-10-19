const { Client } = require('@elastic/elasticsearch');

const client = new Client({ node: process.env.ELASTIC_URL || 'http://localhost:9200' });
const INDEX_NAME = 'emails';

async function createIndex() {
  try {
    const exists = await client.indices.exists({ index: INDEX_NAME });
    if (!exists.body) {
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
    console.error('Error creating index:', error.message);
  }
}

async function indexEmail(email) {
  try {
    await client.index({
      index: INDEX_NAME,
      body: email
    });
    console.log(`Email indexed: ${email.subject}`);
  } catch (error) {
    console.error(' Failed to index email:', error.message);
  }
}

module.exports = { createIndex, indexEmail, client };
