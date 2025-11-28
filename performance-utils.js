// Performance Optimization Utilities
const PerformanceUtils = {
    // Debounce function for input events
    debounce: (func, wait, immediate = false) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    },
    
    // Throttle function for scroll events
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Lazy loading for images
    lazyLoadImages: () => {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    },
    
    // Preload critical resources
    preloadResources: (resources) => {
        resources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.type) link.type = resource.type;
            document.head.appendChild(link);
        });
    },
    
    // Memory management for large datasets
    createVirtualList: (container, items, itemHeight, visibleCount) => {
        let startIndex = 0;
        const totalHeight = items.length * itemHeight;
        
        container.style.height = `${totalHeight}px`;
        container.style.position = 'relative';
        
        const renderItems = () => {
            const fragment = document.createDocumentFragment();
            const endIndex = Math.min(startIndex + visibleCount, items.length);
            
            // Clear existing items
            container.innerHTML = '';
            
            for (let i = startIndex; i < endIndex; i++) {
                const item = document.createElement('div');
                item.style.position = 'absolute';
                item.style.top = `${i * itemHeight}px`;
                item.style.height = `${itemHeight}px`;
                item.textContent = items[i];
                fragment.appendChild(item);
            }
            
            container.appendChild(fragment);
        };
        
        const handleScroll = PerformanceUtils.throttle(() => {
            const scrollTop = container.scrollTop;
            const newStartIndex = Math.floor(scrollTop / itemHeight);
            
            if (newStartIndex !== startIndex) {
                startIndex = newStartIndex;
                renderItems();
            }
        }, 16);
        
        container.addEventListener('scroll', handleScroll);
        renderItems();
        
        return {
            update: (newItems) => {
                items = newItems;
                renderItems();
            },
            destroy: () => {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    },
    
    // Web Worker for heavy computations
    createWorker: (workerFunction) => {
        const blob = new Blob([`(${workerFunction.toString()})()`], {
            type: 'application/javascript'
        });
        return new Worker(URL.createObjectURL(blob));
    },
    
    // Cache management
    createCache: (maxSize = 100) => {
        const cache = new Map();
        
        return {
            get: (key) => cache.get(key),
            set: (key, value) => {
                if (cache.size >= maxSize) {
                    const firstKey = cache.keys().next().value;
                    cache.delete(firstKey);
                }
                cache.set(key, value);
            },
            has: (key) => cache.has(key),
            delete: (key) => cache.delete(key),
            clear: () => cache.clear(),
            size: () => cache.size
        };
    },
    
    // Performance monitoring
    measurePerformance: (name, fn) => {
        return async (...args) => {
            const start = performance.now();
            try {
                const result = await fn(...args);
                const end = performance.now();
                console.log(`${name} took ${end - start} milliseconds`);
                return result;
            } catch (error) {
                const end = performance.now();
                console.error(`${name} failed after ${end - start} milliseconds:`, error);
                throw error;
            }
        };
    },
    
    // Resource loading optimization
    loadResourcesSequentially: async (resources) => {
        const results = [];
        for (const resource of resources) {
            try {
                const result = await fetch(resource.url);
                results.push({ url: resource.url, data: await result.json() });
            } catch (error) {
                console.error(`Failed to load ${resource.url}:`, error);
                results.push({ url: resource.url, error });
            }
        }
        return results;
    },
    
    // DOM manipulation optimization
    batchDOMUpdates: (updates) => {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                updates.forEach(update => update());
                resolve();
            });
        });
    },
    
    // Memory usage monitoring
    getMemoryUsage: () => {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
            };
        }
        return null;
    }
};

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', () => {
    // Lazy load images
    PerformanceUtils.lazyLoadImages();
    
    // Preload critical resources
    const criticalResources = [
        { href: 'style.css', as: 'style' },
        { href: 'script.js', as: 'script' }
    ];
    PerformanceUtils.preloadResources(criticalResources);
    
    // Monitor memory usage in development
    if (window.location.hostname === 'localhost') {
        setInterval(() => {
            const memory = PerformanceUtils.getMemoryUsage();
            if (memory && memory.used > 50) {
                console.warn(`High memory usage: ${memory.used}MB`);
            }
        }, 30000);
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceUtils;
} else {
    window.PerformanceUtils = PerformanceUtils;
}