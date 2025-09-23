// Performance Optimization Module
// Advanced lazy loading and performance enhancements

class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.setupResourceHints();
        this.setupCriticalResourceLoading();
        this.setupImageOptimization();
        this.setupServiceWorker();
        this.monitorPerformance();
    }

    // Advanced Lazy Loading with Intersection Observer
    setupLazyLoading() {
        // Lazy loading for images
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    imageObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        // Observe all images with data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });

        // Lazy loading for content sections
        const contentObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    contentObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.1
        });

        // Observe cards for progressive loading
        document.querySelectorAll('.card').forEach(card => {
            contentObserver.observe(card);
        });
    }

    // Load image with error handling and progressive enhancement
    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // Create a new image to preload
        const imageLoader = new Image();
        
        imageLoader.onload = () => {
            // Fade in effect
            img.style.opacity = '0';
            img.src = src;
            img.removeAttribute('data-src');
            
            // Animate in
            requestAnimationFrame(() => {
                img.style.transition = 'opacity 0.3s ease';
                img.style.opacity = '1';
                img.classList.add('loaded');
            });
        };

        imageLoader.onerror = () => {
            // Fallback for failed images
            img.src = this.generateFallbackSVG(img.alt);
            img.classList.add('error');
        };

        imageLoader.src = src;
    }

    // Generate fallback SVG for failed images
    generateFallbackSVG(altText) {
        const svg = `
            <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill="#f0f0f0"/>
                <text x="50" y="45" font-family="Arial, sans-serif" font-size="10" fill="#999" text-anchor="middle">Imagen</text>
                <text x="50" y="60" font-family="Arial, sans-serif" font-size="10" fill="#999" text-anchor="middle">no disponible</text>
            </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    // Setup resource hints for better loading
    setupResourceHints() {
        // Preload critical resources
        this.addResourceHint('preload', 'styles.css', 'style');
        this.addResourceHint('preload', 'script.js', 'script');
        
        // DNS prefetch for external resources
        this.addResourceHint('dns-prefetch', 'https://fonts.googleapis.com');
        this.addResourceHint('dns-prefetch', 'https://fonts.gstatic.com');
        
        // Preconnect to critical origins
        this.addResourceHint('preconnect', 'https://fonts.googleapis.com');
        this.addResourceHint('preconnect', 'https://fonts.gstatic.com', true);
    }

    // Add resource hint to document head
    addResourceHint(rel, href, as = null, crossorigin = false) {
        const link = document.createElement('link');
        link.rel = rel;
        link.href = href;
        if (as) link.as = as;
        if (crossorigin) link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    }

    // Setup critical resource loading
    setupCriticalResourceLoading() {
        // Load critical CSS inline for above-the-fold content
        this.inlineCriticalCSS();
        
        // Defer non-critical CSS
        this.deferNonCriticalCSS();
        
        // Optimize font loading
        this.optimizeFontLoading();
    }

    // Inline critical CSS for faster rendering
    inlineCriticalCSS() {
        const criticalCSS = `
            /* Critical CSS for above-the-fold content */
            :root {
                --primary-color: #d20515;
                --secondary-color: #ffcc00;
                --text-primary: #333333;
                --background-light: #ffffff;
            }
            
            body {
                font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                margin: 0;
                padding: 0;
                background: var(--background-light);
                color: var(--text-primary);
            }
            
            header {
                background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
                position: sticky;
                top: 0;
                z-index: 100;
            }
            
            .page-header h1 {
                font-size: 2.5rem;
                margin: 0;
                color: var(--text-primary);
            }
        `;

        const style = document.createElement('style');
        style.textContent = criticalCSS;
        document.head.appendChild(style);
    }

    // Defer non-critical CSS loading
    deferNonCriticalCSS() {
        const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
        
        nonCriticalCSS.forEach(link => {
            // Load CSS asynchronously
            const newLink = document.createElement('link');
            newLink.rel = 'preload';
            newLink.as = 'style';
            newLink.href = link.href;
            newLink.onload = () => {
                newLink.rel = 'stylesheet';
            };
            document.head.appendChild(newLink);
            
            // Remove original link
            link.remove();
        });
    }

    // Optimize font loading with font-display
    optimizeFontLoading() {
        // Add font-display: swap to Google Fonts
        const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
        fontLinks.forEach(link => {
            if (!link.href.includes('display=swap')) {
                link.href += link.href.includes('?') ? '&display=swap' : '?display=swap';
            }
        });
    }

    // Setup image optimization
    setupImageOptimization() {
        // Convert images to WebP if supported
        this.setupWebPSupport();
        
        // Implement responsive images
        this.setupResponsiveImages();
        
        // Optimize SVG loading
        this.optimizeSVGLoading();
    }

    // Check WebP support and use if available
    setupWebPSupport() {
        const webpSupported = this.supportsWebP();
        
        if (webpSupported) {
            document.documentElement.classList.add('webp-supported');
            
            // Replace image sources with WebP versions if available
            document.querySelectorAll('img[data-src]').forEach(img => {
                const src = img.dataset.src;
                if (src && src.endsWith('.svg')) {
                    // Keep SVG as is
                    return;
                }
                
                // Try WebP version
                const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                this.checkImageExists(webpSrc).then(exists => {
                    if (exists) {
                        img.dataset.src = webpSrc;
                    }
                });
            });
        }
    }

    // Check if WebP is supported
    supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    // Check if image exists
    checkImageExists(src) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
        });
    }

    // Setup responsive images
    setupResponsiveImages() {
        document.querySelectorAll('img[data-src]').forEach(img => {
            // Add responsive attributes
            if (!img.hasAttribute('sizes')) {
                img.setAttribute('sizes', '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw');
            }
        });
    }

    // Optimize SVG loading
    optimizeSVGLoading() {
        // Inline small SVGs for better performance
        document.querySelectorAll('img[data-src$=".svg"]').forEach(img => {
            if (img.dataset.inline === 'true') {
                this.inlineSVG(img);
            }
        });
    }

    // Inline SVG content
    async inlineSVG(img) {
        try {
            const response = await fetch(img.dataset.src);
            const svgText = await response.text();
            
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const svgElement = svgDoc.querySelector('svg');
            
            if (svgElement) {
                // Copy attributes
                svgElement.setAttribute('class', img.className);
                svgElement.setAttribute('alt', img.alt);
                
                // Replace img with SVG
                img.parentNode.replaceChild(svgElement, img);
            }
        } catch (error) {
            console.warn('Failed to inline SVG:', error);
        }
    }

    // Setup Service Worker for caching
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    // Monitor performance metrics
    monitorPerformance() {
        // Monitor Core Web Vitals
        this.measureCoreWebVitals();
        
        // Monitor resource loading
        this.monitorResourceLoading();
        
        // Monitor user interactions
        this.monitorUserInteractions();
    }

    // Measure Core Web Vitals
    measureCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                console.log('FID:', entry.processingStart - entry.startTime);
            });
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });
            console.log('CLS:', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
    }

    // Monitor resource loading performance
    monitorResourceLoading() {
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            console.log('Page Load Time:', navigation.loadEventEnd - navigation.fetchStart);
            
            const resources = performance.getEntriesByType('resource');
            resources.forEach(resource => {
                if (resource.duration > 1000) {
                    console.warn('Slow resource:', resource.name, resource.duration);
                }
            });
        });
    }

    // Monitor user interactions
    monitorUserInteractions() {
        // Track interaction delays
        ['click', 'keydown', 'touchstart'].forEach(eventType => {
            document.addEventListener(eventType, (event) => {
                const startTime = performance.now();
                
                requestAnimationFrame(() => {
                    const endTime = performance.now();
                    const delay = endTime - startTime;
                    
                    if (delay > 100) {
                        console.warn('Slow interaction:', eventType, delay);
                    }
                });
            });
        });
    }

    // Utility: Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Utility: Throttle function for performance
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize performance optimizer
const performanceOptimizer = new PerformanceOptimizer();

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}