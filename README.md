# Onebox JS — Email Aggregator (Node.js + JS + React)

## Overview
This project synchronizes 2 IMAP email accounts (IDLE), indexes last 30 days and new emails into Elasticsearch (with dense vectors), categorizes via OpenAI, sends Slack + webhook notifications for "Interested" emails, and provides a minimal React UI and RAG-powered suggested replies.

## Prereqs
- Node 18+
- Docker & docker-compose
- OpenAI API key
- IMAP credentials (two accounts)

## Start services
1. Start Docker containers:
