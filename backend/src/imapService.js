const Imap = require('imap-simple');
const { simpleParser } = require('mailparser');
const PQueue = require('p-queue').default;
const { indexEmail, client } = require('./elasticService'); 


const queue = new PQueue({ interval: 10000, intervalCap: 5 });

async function emailExists(uniqueId) {
  try {
    const res = await client.exists({
      index: 'emails',
      id: uniqueId
    });
    return res.body === true;
  } catch (err) {
    console.error(' Error checking email existence:', err.message);
    return false;
  }
}

async function startImapFor(account) {
  const config = {
    imap: {
      user: account.user,
      password: account.pass,
      host: account.host,
      port: account.port,
      tls: account.tls,
      tlsOptions: { rejectUnauthorized: false }
    }
  };

  try {
    const connection = await Imap.connect(config);
    console.log(`IMAP connected: ${account.user}`);

    await connection.openBox('INBOX');

   
    const fetchOptions = { bodies: [''], struct: true };
    const searchCriteria = ['ALL'];
    const messages = await connection.search(searchCriteria, fetchOptions);
    const recentMessages = messages.slice(-50);

    for (const msg of recentMessages) {
      queue.add(async () => {
        try {
          const parsed = await simpleParser(msg.parts[0].body);
          const uniqueId = parsed.messageId || `${parsed.from?.text}-${parsed.subject}-${parsed.date}`;

          const exists = await emailExists(uniqueId);
          if (!exists) {
            await indexEmail({
              id: uniqueId,
              from: parsed.from?.text,
              subject: parsed.subject,
              body: parsed.text,
              date: parsed.date
            });
          }
        } catch (err) {
          console.error(' Failed to parse or index email:', err.message);
        }
      });
    }

  
    connection.on('mail', async () => {
      const messages = await connection.search(['UNSEEN'], fetchOptions);

      for (const msg of messages) {
        queue.add(async () => {
          try {
            const parsed = await simpleParser(msg.parts[0].body);
            const uniqueId = parsed.messageId || `${parsed.from?.text}-${parsed.subject}-${parsed.date}`;

            const exists = await emailExists(uniqueId);
            if (!exists) {
              await indexEmail({
                id: uniqueId,
                from: parsed.from?.text,
                subject: parsed.subject,
                body: parsed.text,
                date: parsed.date
              });
            }
          } catch (err) {
            console.error(' Failed to parse or index new email:', err.message);
          }
        });
      }
    });
  } catch (err) {
    console.error(`IMAP error for ${account.user}:`, err.message);
  }
}

function startAllImap() {
  const accounts = [
    {
      user: process.env.IMAP_ACCOUNT_1_USER,
      pass: process.env.IMAP_ACCOUNT_1_PASS,
      host: process.env.IMAP_ACCOUNT_1_HOST,
      port: Number(process.env.IMAP_ACCOUNT_1_PORT),
      tls: process.env.IMAP_ACCOUNT_1_TLS === 'true'
    },
    {
      user: process.env.IMAP_ACCOUNT_2_USER,
      pass: process.env.IMAP_ACCOUNT_2_PASS,
      host: process.env.IMAP_ACCOUNT_2_HOST,
      port: Number(process.env.IMAP_ACCOUNT_2_PORT),
      tls: process.env.IMAP_ACCOUNT_2_TLS === 'true'
    }
  ];

  accounts.forEach(acc => startImapFor(acc));
}

module.exports = { startAllImap };
