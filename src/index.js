/**
 * Higher order function that makes any promise-returning-function
 * retryable with a jittr'd exponential backoff.
 *
 * @param  {Function} fn                    Function to be made retryable.
 * @param  {Object}   options               Configuration.
 * @param  {Number}   options.maxRetries    Total number of retries.
 * @param  {Number}   options.retryCount    Current retry count.
 * @param  {Number}   options.backoffBase   Base interval for backoff wait time (in ms).
 * @return {Function}
 */
export default function retryFunctionOnReject(fn, options) {
    options = Object.assign({ maxRetries: 2, retryCount: 0, backoffBase: 1000 }, options);
    return (...args) => {
        return new Promise((resolve, reject) => {
            fn(...args)
            .then(resolve)
            .catch((error) => {
                options.retryCount++;
                if (options.retryCount > options.maxRetries) {
                    return reject(error);
                }
                const delay = (Math.pow(2, options.retryCount) * options.backoffBase) + (Math.round(Math.random() * options.backoffBase));
                const nextFn = retryFunctionOnReject(fn, options);
                return setTimeout(() => {
                    nextFn(...args).then(resolve).catch(reject);
                }, delay);
            });
        });
    };
}
