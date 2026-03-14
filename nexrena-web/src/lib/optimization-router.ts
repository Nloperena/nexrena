/**
 * Autonomous Optimization Architect — Router Template
 *
 * Use when adding LLM/AI API calls. Enforces:
 * - Strict timeout (5s)
 * - Retry cap (3)
 * - Cost guardrail ($0.05/run default)
 * - Circuit breaker on failure velocity
 * - Fallback to cheaper provider
 *
 * @see docs/optimization-architect-baseline.md
 */

export interface ProviderConfig {
  id: string;
  execute: (input: string) => Promise<{ output: string; tokensUsed?: number }>;
  costPer1MTokens: number;
  circuitBreakerTripped?: boolean;
  failures?: number;
}

export interface SecurityLimits {
  maxRetries: number;
  maxCostPerRun: number;
  timeoutMs: number;
}

const DEFAULT_LIMITS: SecurityLimits = {
  maxRetries: 3,
  maxCostPerRun: 0.05,
  timeoutMs: 5000,
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    ),
  ]);
}

function calculateCost(provider: ProviderConfig, tokensUsed: number): number {
  return (tokensUsed / 1_000_000) * provider.costPer1MTokens;
}

/**
 * Execute with guardrails. Routes to next provider on failure or cost breach.
 * Throws if all providers fail or breach limits.
 */
export async function optimizeAndRoute(
  serviceTask: string,
  providers: ProviderConfig[],
  securityLimits: Partial<SecurityLimits> = {}
): Promise<{ output: string; providerId: string }> {
  const limits = { ...DEFAULT_LIMITS, ...securityLimits };
  const ranked = [...providers].filter((p) => !p.circuitBreakerTripped);

  for (const provider of ranked) {
    if (provider.circuitBreakerTripped) continue;
    if ((provider.failures ?? 0) >= limits.maxRetries) {
      provider.circuitBreakerTripped = true;
      continue;
    }

    try {
      const result = await withTimeout(
        provider.execute(serviceTask),
        limits.timeoutMs
      );

      const tokens = result.tokensUsed ?? 0;
      const cost = calculateCost(provider, tokens);

      if (cost > limits.maxCostPerRun) {
        console.warn(
          `[OptimizationRouter] Provider ${provider.id} over cost limit. Rerouting.`
        );
        continue;
      }

      return { output: result.output, providerId: provider.id };
    } catch (error) {
      provider.failures = (provider.failures ?? 0) + 1;
      if (provider.failures >= limits.maxRetries) {
        provider.circuitBreakerTripped = true;
      }
    }
  }

  throw new Error(
    'All fail-safes tripped. Aborting task to prevent runaway costs.'
  );
}
