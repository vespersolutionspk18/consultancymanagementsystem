# CMS-Website

This is used for the marketing website (cms.com).
This is not related in any way to the main app, which you can find in cms-front and cms-server.

## Getting Started

We're using Next.js
We're using Postgres for the database. Mandatory for the website to work, even locally.

1. Copy the .env.example file to .env and fill in the values.

2. Run the migrations:

```bash
npx nx run cms-website:database:migrate
```

3. From the root directory:

```bash
npx nx run cms-website:dev
```

Then open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Or to build in prod:

```bash
npx nx run cms-website:build
npx nx run cms-website:start
```
