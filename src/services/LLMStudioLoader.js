/**
 * Lazy loader for LM Studio SDK
 * This reduces initial bundle size by loading the SDK only when needed
 */

let LMStudioClientClass = null;
let loadingPromise = null;

/**
 * Load the LM Studio SDK dynamically
 * @returns {Promise<typeof import('@lmstudio/sdk').LMStudioClient>}
 */
export async function loadLMStudioClient() {
    // Return cached class if already loaded
    if (LMStudioClientClass) {
        return LMStudioClientClass;
    }

    // Return existing loading promise if already loading
    if (loadingPromise) {
        return loadingPromise;
    }

    // Start loading
    loadingPromise = import('@lmstudio/sdk')
        .then(module => {
            LMStudioClientClass = module.LMStudioClient;
            loadingPromise = null;
            return LMStudioClientClass;
        })
        .catch(error => {
            loadingPromise = null;
            throw error;
        });

    return loadingPromise;
}

/**
 * Check if LM Studio SDK is already loaded
 * @returns {boolean}
 */
export function isLMStudioLoaded() {
    return LMStudioClientClass !== null;
}

/**
 * Preload the LM Studio SDK in the background
 * Call this early in the app lifecycle to reduce perceived loading time
 */
export function preloadLMStudioClient() {
    if (!LMStudioClientClass && !loadingPromise) {
        loadLMStudioClient().catch(() => {
            // Silently fail - will retry when actually needed
        });
    }
}
