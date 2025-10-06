// Derived from https://github.com/sindresorhus/p-limit under MIT License
// p-limit is copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)

type ResolveCallback<T extends unknown> = (val: T | PromiseLike<T>) => void;

/**
 * This is a queuing/limiting system based on the `p-limit` npm package, but heavily simplified
 * to a minimal API surface. All it does is ensure tasks run one at a time, sequentially.
 *
 * @example
 * const queue = pQueue();
 * const input = [
 * 	limit(() => fetchSomething('foo')),
 * 	limit(() => fetchSomething('bar')),
 * 	limit(() => doSomething())
 * ];
 * // Each promise is run sequentially rather than in parallel.
 * await Promise.all(input);
 */
export function pQueue() {
  const queue: Array<(val?: unknown) => void> = [];
  let activeCount = 0;

  /** Process the next queued function if we're under the concurrency limit. */
  const resumeNext = () => {
    if (activeCount < 1 && queue.length > 0) {
      activeCount++;
      queue.shift()!();
    }
  };

  const run = async <T extends unknown>(task: () => T, resolve: ResolveCallback<T>) => {
    // Execute the function and capture the result promise
    const result = (async () => task())();

    // Resolve immediately with the promise (don't wait for completion)
    resolve(result);

    // Wait for the function to complete (success or failure)
    // We catch errors here to prevent unhandled rejections,
    // but the original promise rejection is preserved for the caller
    try {
      await result;
    } catch {}

    // Decrement active count and process next queued function
    activeCount--;
    resumeNext();
  };

  const enqueue = <T extends unknown>(task: () => T, resolve: ResolveCallback<T>) => {
    // Queue the internal resolve function instead of the run function
    // to preserve the asynchronous execution context.
    new Promise((internalResolve) => {
      queue.push(internalResolve);
    }).then(() => run(task, resolve));

    // Start processing immediately if we haven't reached the concurrency limit
    if (activeCount < 1) resumeNext();
  };

  /** Run `task` when any previously enqueued tasks have completed. */
  const generator = <T extends unknown>(task: () => T) =>
    new Promise<T>((resolve) => {
      enqueue(task, resolve);
    });

  return generator;
}
