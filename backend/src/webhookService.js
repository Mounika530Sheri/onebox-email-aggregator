const axios = require("axios");
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;
const EXTERNAL = process.env.WEBHOOK_SITE_URL;

async function notifyInterested(email) {
  try {
    if (SLACK_WEBHOOK) {
      await axios.post(SLACK_WEBHOOK, {
        text: `*Interested Email*\nFrom: ${email.from}\nSubject: ${email.subject}\nAccount: ${email.account}`
      });
    }
    if (EXTERNAL) {
      await axios.post(EXTERNAL, { type: "interested_email", payload: email });
    }
  } catch (err) {
    console.error("notify error", err.message || err);
  }
}

module.exports = { notifyInterested };
