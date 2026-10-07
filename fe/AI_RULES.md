# Sensitive files

Never read, search, print, summarize, modify, or expose:

- .env
- .env.*
- *.pem
- *.key
- secrets/**
- credentials/**

Use `.env.example` only.

If configuration is needed, inspect variable names from `.env.example`.
Never access secret values.