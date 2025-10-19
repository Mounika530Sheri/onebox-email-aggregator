const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTIC_URL,
  auth: {
    apiKey: process.env.ELASTIC_API_KEY // ✅ required for Elastic Cloud
  }
  sniffOnStart: false,
});

const INDEX_NAME = 'emails';

async function createIndex() {
  try {
    const exists = await client.indices.exists({ index: INDEX_NAME });

    if (!exists) { // ✅ updated from deprecated exists.body
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
    console.error('❌ Error creating index:', error.meta?.body?.error || error);
  }
}

async function indexEmail(email) {
  if (!email.subject || !email.from || !email.body) {
    console.warn('⚠️ Skipping invalid email:', email);
    return;
  }

  try {
    await client.index({
      index: INDEX_NAME,
      id: email.id,
      body: email
    });
    console.log(`✅ Indexed email: ${email.subject}`);
  } catch (error) {
    console.error('❌ Failed to index email:', error.meta?.body?.error || error);
  }
}

module.exports = { createIndex, indexEmail, client };
