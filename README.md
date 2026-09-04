# Profile Lookup

A small app that runs the `harvestapi/linkedin-profile-scraper` Apify actor and shows the results.
Frontend is plain HTML/JS in `public/`; the Apify call happens in a Netlify Function
(`netlify/functions/scrape.js`) so your Apify token never reaches the browser.

## Deploy to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Deploy manually**,
   and drag in this whole folder (or its zip). Netlify will pick up `netlify.toml` automatically.
2. Once deployed, go to **Site configuration → Environment variables** and add:
   - Key: `APIFY_TOKEN`
   - Value: your Apify API token (from Apify Console → Settings → Integrations)
3. Trigger a redeploy (**Deploys → Trigger deploy → Deploy site**) so the function picks up the
   new environment variable.
4. Open the site — paste profile URLs or identifiers, one per line, and run a lookup.

## Regenerate your token

You shared your Apify token in plain text earlier — treat it as compromised. In Apify Console:
**Settings → Integrations → API tokens → regenerate**, then use the new one in step 2 above.

## Notes

- Pricing is set by the actor: **$4 per 1,000 profiles** (details only) or **$10 per 1,000**
  (details + email search) — shown in the app's mode selector.
- `field` sent to the function can be `queries` (mixed URLs/identifiers — the actor sorts it out),
  `urls` (full profile URLs only), or `publicIdentifiers` (the slug at the end of a profile URL).
- This calls Apify's `run-sync-get-dataset-items` endpoint, which blocks until the run finishes.
  Very large batches may hit Netlify's function timeout (26s on the free tier) — for big runs,
  switch the function to the async `/runs` endpoint and poll, or keep batches modest (~20-30
  profiles at a time).
- Scraping LinkedIn via third-party tools sits outside LinkedIn's own Terms of Service, even
  though Apify sells this actor commercially — worth knowing before running it at scale.
