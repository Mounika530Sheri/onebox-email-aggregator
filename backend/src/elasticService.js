const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTIC_URL,
  auth: {
    apiKey: process.env.ELASTIC_API_KEY
  },
  
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
      console.log(`✅ Index "${INDEX_NAME}" created`);
    } else {
      console.log(`ℹ️ Index "${INDEX_NAME}" already exists`);
    }
  } catch (error) {
    console.error('❌ Error creating index:', error);
  }
}

async function indexEmail(email) {
  try {
    await client.index({
      index: INDEX_NAME,
      document: email,
    });
    console.log(`✅ Indexed email: ${email.subject}`);
  } catch (error) {
    console.error('❌ Error indexing email:', error);
  }
}

module.exports = { client, createIndex, indexEmail };
