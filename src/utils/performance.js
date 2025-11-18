/**
 * Performance monitoring utilities
 * Helps track and optimize component render performance
 */

/**
 * Measure component render time
 * @param {string} componentName - Name of the component
 * @param {Function} callback - Function to measure
 * @returns {Promise<any>} Result of the callback
 */
export async function measurePerformance(componentName, callback) {
    const startTime = performance.now();
    
    try {
        const result = await callback();
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (import.meta.env.DEV && duration > 16) { // Warn if slower than 60fps
            console.warn(`⚠️ Performance: ${componentName} took ${duration.toFixed(2)}ms`);
        }
        
        return result;
    } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        console.error(`❌ Performance: ${componentName} failed after ${duration.toFixed(2)}ms`, error);
        throw error;
    }
}

/**
 * Create a performance marker for React DevTools
 * @param {string} name - Marker name
 */
export function markPerformance(name) {
    if (import.meta.env.DEV && performance.mark) {
        performance.mark(name);
    }
}

/**
 * Measure time between two performance markers
 * @param {string} name - Measure name
 * @param {string} startMark - Start marker name
 * @param {string} endMark - End marker name
 */
export function measureBetweenMarks(name, startMark, endMark) {
    if (import.meta.env.DEV && performance.measure) {
        try {
            performance.measure(name, startMark, endMark);
            const measure = performance.getEntriesByName(name)[0];
            if (measure && measure.duration > 100) {
                console.warn(`⚠️ Performance: ${name} took ${measure.duration.toFixed(2)}ms`);
            }
        } catch (error) {
            // Markers might not exist, silently fail
        }
    }
}

/**
 * Log component mount/unmount for debugging
 * @param {string} componentName - Component name
 * @returns {Function} Cleanup function
 */
export function logComponentLifecycle(componentName) {
    if (import.meta.env.DEV) {
        console.log(`✅ ${componentName} mounted`);
        
        return () => {
            console.log(`❌ ${componentName} unmounted`);
        };
    }
    
    return () => {}; // No-op in production
}

/**
 * Detect slow renders using React's Profiler API
 * @param {string} id - Profiler ID
 * @param {string} phase - "mount" or "update"
 * @param {number} actualDuration - Time spent rendering
 * @param {number} baseDuration - Estimated time without memoization
 */
export function onRenderCallback(id, phase, actualDuration, baseDuration) {
    if (import.meta.env.DEV) {
        if (actualDuration > 16) { // Slower than 60fps
            console.warn(
                `⚠️ Slow render detected in ${id} (${phase}):`,
                `${actualDuration.toFixed(2)}ms`,
                `(baseline: ${baseDuration.toFixed(2)}ms)`
            );
        }
    }
}

/**
 * Measure bundle size impact of a dynamic import
 * @param {Function} importFn - Dynamic import function
 * @param {string} moduleName - Module name for logging
 * @returns {Promise<any>} Imported module
 */
export async function measureImport(importFn, moduleName) {
    if (import.meta.env.DEV) {
        const startTime = performance.now();
        const module = await importFn();
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`📦 Loaded ${moduleName} in ${duration.toFixed(2)}ms`);
        
        return module;
    }
    
    return importFn();
}
