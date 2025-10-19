// backend/src/routes/emails.js
const express = require("express");
const router = express.Router();
const { searchEmails, esClient } = require("../elasticService");
const { suggestReplyForEmail } = require("../aiService");

router.get("/search", async (req, res) => {
  const q = req.query.q || "";
  const folder = req.query.folder;
  const account = req.query.account;
  try {
    const results = await searchEmails(q, folder, account);
    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message || e });
  }
});

router.get("/byId/:id", async (req, res) => {
  try {
    const r = await esClient.get({ index: "emails", id: req.params.id });
    res.json(r._source);
  } catch (err) {
    res.status(404).json({ error: "not found" });
  }
});

router.post("/suggest-reply", async (req, res) => {
  const { emailBody, context } = req.body;
  try {
    const suggestion = await suggestReplyForEmail(emailBody, context || "");
    res.json({ suggestion });
  } catch (e) {
    res.status(500).json({ error: e.message || e });
  }
});

module.exports = router;
