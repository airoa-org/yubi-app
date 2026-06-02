import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "local",

  // Integrations
  integrations: [Sentry.replayIntegration()],

  // Performance Monitoring
  tracesSampleRate: parseFloat(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? "0"
  ),

  // Session Replay (optional, disabled by default)
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  // Only initialize if DSN is provided
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Debug mode for development
  debug: false,
});
