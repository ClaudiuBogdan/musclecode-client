// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

interface DebouncedFunction<T extends AnyFunction> {
  (...args: Parameters<T>): Promise<ReturnType<T>>;
  cancel: () => void;
}

export function debounce<T extends AnyFunction>(
  fn: T,
  wait: number
): DebouncedFunction<T> {
  let timeout: NodeJS.Timeout;
  let promise: Promise<ReturnType<T>> | null = null;

  const debouncedFn = (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Cancel any pending execution
    if (timeout) {
      clearTimeout(timeout);
    }

    // Create a new promise for this execution
    return new Promise((resolve, reject) => {
      timeout = setTimeout(() => {
        try {
          const result = fn(...args) as Promise<ReturnType<T>> | ReturnType<T>;
          // If the function returns a promise, wait for it
          if (result instanceof Promise) {
            promise = result;
            result
              .then((value) => {
                if (promise === result) {
                  return resolve(value);
                }
                return;
              })
              .catch((error) => {
                if (promise === result) {
                  reject(error as Error);
                }
              });
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error as Error);
        }
      }, wait);
    });
  };

  // Add cancel method
  debouncedFn.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
    promise = null;
  };

  return debouncedFn;
}
