// Runs before `next build` (npm "prebuild"). On a Vercel production build, stops the build when the
// variables that decide the public origin and the mail sender are missing. The code has defaults
// (https://studywithbro.com) so local runs, CI and previews need nothing, but a production deploy that
// silently falls back to them ships canonical URLs, hreflang, sitemap, robots and OG urls for a domain
// that may not be serving this project yet, and sign-in codes from a sender Resend has not verified.
// Anything other than VERCEL_ENV=production is left alone.

const problems = [];

function check(env) {
  const site = (env.NEXT_PUBLIC_SITE_URL ?? '').trim();
  if (!site) {
    problems.push(
      'NEXT_PUBLIC_SITE_URL is not set. Canonical URLs, hreflang, the sitemap, robots and share-image URLs would use the built-in default (https://studywithbro.com), which may not be where this deploy is served. Set it to the public https origin, e.g. https://www.pomodoro-focus.site.',
    );
  } else {
    let url = null;
    try {
      url = new URL(site);
    } catch {
      // reported below
    }
    const originOnly = url && url.protocol === 'https:' && url.pathname.replace(/\/+$/, '') === '' && !url.search && !url.hash;
    if (!originOnly) {
      problems.push(`NEXT_PUBLIC_SITE_URL must be an https origin without a path (https://example.com), got "${site}".`);
    }
  }

  if (!(env.EMAIL_FROM ?? '').trim()) {
    problems.push(
      'EMAIL_FROM is not set. Sign-in codes would be sent from no-reply@<site host>, a sender Resend may not have verified, and email sign-in would fail. Set it to an address on a domain verified in Resend, e.g. "Study Bro <no-reply@example.com>".',
    );
  }
}

if (process.env.VERCEL_ENV === 'production') check(process.env);

if (problems.length > 0) {
  const line = '='.repeat(78);
  console.error(`\n${line}\nPRODUCTION BUILD STOPPED: missing or invalid environment variables (Vercel > Settings > Environment Variables > Production)\n${line}`);
  for (const problem of problems) console.error(`\n  - ${problem}`);
  console.error(`\n${line}\n`);
  process.exit(1);
}
