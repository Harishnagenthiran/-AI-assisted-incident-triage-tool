// Hand-labeled logs with a ground-truth severity, used by eval/run-eval.ts to measure
// how often Rootline's classification agrees with a human judgment call.
//
// Severity guide (matches the one in src/lib/analyze.ts's system prompt):
//   CRITICAL - active customer-facing outage, data loss risk, or security breach
//   HIGH     - significant degradation, a core path failing, or a contained-but-urgent outage
//   MEDIUM   - partial degradation, elevated error rates, or a failure with a working fallback
//   LOW      - cosmetic, isolated, or already self-recovered issues

export interface EvalItem {
  id: string;
  sourceSystem?: string;
  log: string;
  expectedSeverity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  note?: string;
}

export const dataset: EvalItem[] = [
  {
    id: "c1-pool-exhaustion",
    sourceSystem: "payments-api",
    expectedSeverity: "CRITICAL",
    log: `2026-09-05T02:14:11Z ERROR [payments-api] PoolExhaustedException: no available connections in pool "pg-primary" (max=20, active=20, waiting=47)
2026-09-05T02:14:11Z WARN  [payments-api] request timeout after 30000ms for POST /v1/charges
2026-09-05T02:14:14Z INFO  [payments-api] circuit breaker "pg-primary" tripped to OPEN
2026-09-05T02:14:20Z ERROR [payments-api] 503 returned for 214 requests in the last 60s`,
  },
  {
    id: "c2-db-failover",
    sourceSystem: "core-db",
    expectedSeverity: "CRITICAL",
    log: `2026-09-05T09:02:01Z ERROR [core-db-proxy] primary node unreachable, initiating failover
2026-09-05T09:02:03Z ERROR [api-gateway] 500 Internal Server Error on 98% of write requests
2026-09-05T09:02:04Z ERROR [api-gateway] 500 Internal Server Error on 97% of write requests
2026-09-05T09:02:09Z ERROR [core-db-proxy] failover target also unreachable: connection refused
2026-09-05T09:02:10Z CRITICAL [api-gateway] all write endpoints returning 5xx for 6 consecutive minutes`,
  },
  {
    id: "c3-auth-bad-jwt",
    sourceSystem: "auth-service",
    expectedSeverity: "CRITICAL",
    log: `2026-09-05T14:40:02Z ERROR [auth-service] token signing key rotated but verifier cache not refreshed
2026-09-05T14:40:03Z ERROR [auth-service] JWT verification failed for 100% of incoming requests since deploy v482
2026-09-05T14:40:05Z ERROR [web-app] all users logged out unexpectedly, login attempts failing with 401
2026-09-05T14:41:00Z ERROR [auth-service] 12,400 failed logins in the last minute`,
  },
  {
    id: "c4-storage-403",
    sourceSystem: "uploads-service",
    expectedSeverity: "CRITICAL",
    log: `2026-09-05T18:11:40Z ERROR [uploads-service] S3 PutObject failed: AccessDenied for bucket "user-uploads-prod"
2026-09-05T18:11:41Z ERROR [uploads-service] bucket policy changed by deploy #3391, write permissions revoked for app role
2026-09-05T18:11:45Z ERROR [uploads-service] 100% of file upload requests failing since 18:09 UTC
2026-09-05T18:12:00Z WARN  [uploads-service] no successful uploads recorded in the last 3 minutes`,
  },
  {
    id: "h1-az-degradation",
    sourceSystem: "k8s-cluster",
    expectedSeverity: "HIGH",
    log: `2026-09-06T03:22:10Z WARN  [k8s] node pool "us-east-1c" reporting NotReady (4/12 nodes)
2026-09-06T03:22:15Z WARN  [ingress] elevated latency in us-east-1c, p95 up from 120ms to 2.1s
2026-09-06T03:22:40Z ERROR [ingress] 15% of requests routed to us-east-1c timing out
2026-09-06T03:23:00Z INFO  [k8s] rescheduling pods to us-east-1a and us-east-1b, other zones healthy`,
  },
  {
    id: "h2-single-payment-provider-down",
    sourceSystem: "checkout-service",
    expectedSeverity: "HIGH",
    log: `2026-09-06T11:05:00Z ERROR [checkout-service] provider "stripe-primary" returning 502 for all requests
2026-09-06T11:05:02Z WARN  [checkout-service] falling back to "adyen-secondary" for new charges
2026-09-06T11:05:10Z INFO  [checkout-service] fallback provider processing successfully, added ~800ms latency per charge
2026-09-06T11:06:00Z ERROR [checkout-service] stripe-primary still down, 340 charges routed through fallback in the last minute`,
  },
  {
    id: "h3-email-queue-backup",
    sourceSystem: "notification-worker",
    expectedSeverity: "HIGH",
    log: `2026-09-06T20:00:00Z WARN  [notification-worker] outbound queue depth at 18,400 messages, growing
2026-09-06T20:00:05Z WARN  [notification-worker] password-reset emails delayed ~40 minutes
2026-09-06T20:00:10Z ERROR [notification-worker] SMTP relay "smtp-01" connection pool saturated
2026-09-06T20:01:00Z INFO  [notification-worker] no emails dropped, all messages still queued for delivery`,
  },
  {
    id: "h4-cdn-partial-outage",
    sourceSystem: "cdn-edge",
    expectedSeverity: "HIGH",
    log: `2026-09-07T05:30:00Z ERROR [cdn-edge] PoP "fra1" returning 5xx for static assets
2026-09-07T05:30:02Z WARN  [cdn-edge] traffic rerouted to "ams1" and "lhr1", added ~80ms latency for EU users
2026-09-07T05:31:00Z ERROR [cdn-edge] fra1 still unhealthy after 60s, 22% of EU traffic affected during reroute window`,
  },
  {
    id: "m1-cache-eviction",
    sourceSystem: "product-api",
    expectedSeverity: "MEDIUM",
    log: `2026-09-07T08:00:00Z WARN  [product-api] Redis cache hit rate dropped from 94% to 61% after redeploy
2026-09-07T08:00:05Z INFO  [product-api] falling back to primary DB for cache misses, latency up ~40ms p50
2026-09-07T08:05:00Z INFO  [product-api] cache hit rate recovering as new entries warm, currently at 78%`,
  },
  {
    id: "m2-admin-endpoint-4xx",
    sourceSystem: "admin-api",
    expectedSeverity: "MEDIUM",
    log: `2026-09-07T10:15:00Z WARN  [admin-api] 422 Unprocessable Entity rate up to 18% on POST /internal/reports
2026-09-07T10:15:05Z INFO  [admin-api] root cause traced to stricter regex validation shipped in v210
2026-09-07T10:15:10Z INFO  [admin-api] customer-facing endpoints unaffected, only internal reporting tool impacted`,
  },
  {
    id: "m3-batch-retry-success",
    sourceSystem: "analytics-worker",
    expectedSeverity: "MEDIUM",
    log: `2026-09-07T01:00:00Z ERROR [analytics-worker] job "daily_rollup" failed: timeout connecting to warehouse
2026-09-07T01:05:00Z ERROR [analytics-worker] job "daily_rollup" retry 1/3 failed: timeout connecting to warehouse
2026-09-07T01:10:00Z INFO  [analytics-worker] job "daily_rollup" retry 2/3 succeeded, rollup completed 45min late`,
  },
  {
    id: "m4-geocoding-fallback",
    sourceSystem: "address-service",
    expectedSeverity: "MEDIUM",
    log: `2026-09-07T13:40:00Z WARN  [address-service] third-party geocoding API timing out intermittently (~30% of calls)
2026-09-07T13:40:02Z INFO  [address-service] automatic fallback to lower-precision internal geocoder engaged
2026-09-07T13:45:00Z INFO  [address-service] address validation still succeeding, precision reduced for affected requests`,
  },
  {
    id: "l1-favicon-404",
    sourceSystem: "web-frontend",
    expectedSeverity: "LOW",
    log: `2026-09-07T16:00:00Z INFO  [web-frontend] GET /favicon.ico 404
2026-09-07T16:00:01Z INFO  [web-frontend] GET /favicon.ico 404
2026-09-07T16:02:00Z INFO  [web-frontend] no other errors reported in this window`,
  },
  {
    id: "l2-deprecated-env-warning",
    sourceSystem: "cron-worker",
    expectedSeverity: "LOW",
    log: `2026-09-07T02:00:00Z WARN  [cron-worker] environment variable LEGACY_FEATURE_FLAG is deprecated and will be removed in v3
2026-09-07T02:00:01Z INFO  [cron-worker] job "cleanup_temp_files" started
2026-09-07T02:00:45Z INFO  [cron-worker] job "cleanup_temp_files" completed successfully, 1,204 files removed`,
  },
  {
    id: "l3-transient-blip",
    sourceSystem: "search-api",
    expectedSeverity: "LOW",
    log: `2026-09-07T19:12:00Z WARN  [search-api] connection reset by peer on request to "index-node-3"
2026-09-07T19:12:01Z INFO  [search-api] retry succeeded on first attempt
2026-09-07T19:12:01Z INFO  [search-api] no further errors observed, request completed in 340ms total`,
  },
  {
    id: "l4-staging-healthcheck",
    sourceSystem: "staging-env",
    expectedSeverity: "LOW",
    log: `2026-09-07T00:30:00Z ERROR [staging-env] health check failed for service "reports-worker" during scheduled maintenance window
2026-09-07T00:35:00Z INFO  [staging-env] maintenance window ended, health check passing
2026-09-07T00:35:01Z INFO  [staging-env] no production traffic affected, staging environment only`,
  },
];
