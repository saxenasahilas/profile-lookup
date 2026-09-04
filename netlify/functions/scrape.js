// Netlify Function: scrape.js
// Proxies requests to the Apify "harvestapi/linkedin-profile-scraper" actor.
// The Apify token lives ONLY in Netlify's environment variables (APIFY_TOKEN),
// never in frontend code, so it can't be read from the browser or page source.

const ACTOR = "harvestapi~linkedin-profile-scraper";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Use POST" });
  }

  const token = process.env.APIFY_TOKEN;
  if (!token) {
    return respond(500, {
      error:
        "APIFY_TOKEN is not set. Add it in Netlify: Site settings -> Environment variables.",
    });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return respond(400, { error: "Invalid JSON body" });
  }

  const { targets, field = "queries", emailMode = false } = body;

  if (!Array.isArray(targets) || targets.length === 0) {
    return respond(400, { error: "Provide a non-empty 'targets' array" });
  }
  if (!["queries", "urls", "publicIdentifiers", "profileIds"].includes(field)) {
    return respond(400, { error: "Invalid 'field' value" });
  }

  const input = {
    profileScraperMode: emailMode
      ? "Profile details + email search ($10 per 1k)"
      : "Profile details no email ($4 per 1k)",
    [field]: targets,
  };

  const url = `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${encodeURIComponent(
    token
  )}`;

  try {
    const apifyRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const text = await apifyRes.text();

    if (!apifyRes.ok) {
      return respond(apifyRes.status, {
        error: "Apify request failed",
        detail: safeJson(text),
      });
    }

    return respond(200, { items: safeJson(text) });
  } catch (err) {
    return respond(502, { error: "Failed to reach Apify", detail: String(err) });
  }
};

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function respond(statusCode, bodyObj) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyObj),
  };
}
