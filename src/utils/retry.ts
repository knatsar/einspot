export interface RetryConfig {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryableErrors?: (error: any) => boolean;
}

const defaultConfig: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableErrors: () => true,
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const finalConfig = { ...defaultConfig, ...config };
  let lastError: Error | null = null;
  let attempt = 0;
  let delay = finalConfig.initialDelay;

  while (attempt < finalConfig.maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (!finalConfig.retryableErrors(error)) {
        throw error;
      }

      attempt++;
      if (attempt === finalConfig.maxAttempts) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * finalConfig.backoffFactor, finalConfig.maxDelay);
    }
  }

  throw lastError || new Error('Operation failed after retries');
}
