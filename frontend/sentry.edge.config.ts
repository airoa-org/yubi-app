import * as Sentry from "@sentry/nextjs";

// Edge runtime: fallback to non-prefixed env vars injected by ECS at runtime
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
const environment =
  process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
  process.env.SENTRY_ENVIRONMENT ||
  "local";
const tracesSampleRate =
  Number(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ||
      process.env.SENTRY_TRACES_SAMPLE_RATE
  ) || 0;

Sentry.init({
  dsn,
  environment,

  // Performance Monitoring
  tracesSampleRate,

  // Only initialize if DSN is provided
  enabled: !!dsn,

  debug: false,
});
