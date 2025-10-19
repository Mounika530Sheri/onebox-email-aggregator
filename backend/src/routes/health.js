// backend/src/routes/health.js
const express = require("express");
const router = express.Router();
router.get("/ping", (req, res) => res.json({ ok: true }));
module.exports = router;
