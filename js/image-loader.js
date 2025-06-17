// Advanced Image Lazy Loading with Performance Optimization

class ImageLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: options.rootMargin || '50px 0px',
            threshold: options.threshold || 0.01,
            fadeIn: options.fadeIn !== false,
            webpSupport: null,
            ...options
        };
        
        this.queue = new Set();
        this.loading = new Set();
        this.loaded = new Set();
        
        // Check WebP support
        this.checkWebPSupport();
        
        // Initialize Intersection Observer
        this.initObserver();
        
        // Start observing images
        this.observeImages();
    }
    
    // Check if browser supports WebP
    async checkWebPSupport() {
        const webP = new Image();
        webP.onload = webP.onerror = () => {
            this.options.webpSupport = webP.height === 2;
        };
        webP.src = 'data:image/webp;base64,UklGRi4AAABXRUJQVlA4ICIAAABQAQCdASoBAAIABkFoJZQGpO4LIhAAoAAAoAIAAABBbQBdP8D/AFgA';
    }
    
    // Initialize Intersection Observer
    initObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                }
            });
        }, {
            rootMargin: this.options.rootMargin,
            threshold: this.options.threshold
        });
    }
    
    // Find and observe all lazy images
    observeImages() {
        // Images with data-src
        const lazyImages = document.querySelectorAll('img[data-src], picture source[data-srcset]');
        lazyImages.forEach(img => this.observer.observe(img));
        
        // Background images with data-bg
        const lazyBackgrounds = document.querySelectorAll('[data-bg]');
        lazyBackgrounds.forEach(el => this.observer.observe(el));
    }
    
    // Load a single image
    async loadImage(element) {
        if (this.loading.has(element) || this.loaded.has(element)) {
            return;
        }
        
        this.loading.add(element);
        this.observer.unobserve(element);
        
        try {
            if (element.tagName === 'IMG') {
                await this.loadImgElement(element);
            } else if (element.tagName === 'SOURCE') {
                await this.loadSourceElement(element);
            } else if (element.hasAttribute('data-bg')) {
                await this.loadBackgroundImage(element);
            }
            
            this.loaded.add(element);
            this.loading.delete(element);
            
            // Add fade-in effect
            if (this.options.fadeIn) {
                element.classList.add('loaded');
            }
            
            // Dispatch custom event
            element.dispatchEvent(new CustomEvent('lazyloaded'));
            
        } catch (error) {
            console.error('Error loading image:', error);
            this.loading.delete(element);
            element.classList.add('error');
        }
    }
    
    // Load IMG element
    async loadImgElement(img) {
        const src = img.getAttribute('data-src');
        const srcset = img.getAttribute('data-srcset');
        
        if (!src && !srcset) return;
        
        // Preload image
        const tempImg = new Image();
        
        return new Promise((resolve, reject) => {
            tempImg.onload = () => {
                if (src) img.src = src;
                if (srcset) img.srcset = srcset;
                img.removeAttribute('data-src');
                img.removeAttribute('data-srcset');
                resolve();
            };
            
            tempImg.onerror = reject;
            
            if (srcset) {
                tempImg.srcset = srcset;
            } else {
                tempImg.src = src;
            }
        });
    }
    
    // Load SOURCE element
    async loadSourceElement(source) {
        const srcset = source.getAttribute('data-srcset');
        if (srcset) {
            source.srcset = srcset;
            source.removeAttribute('data-srcset');
        }
    }
    
    // Load background image
    async loadBackgroundImage(element) {
        const bg = element.getAttribute('data-bg');
        const bgWebp = element.getAttribute('data-bg-webp');
        
        let imageUrl = bg;
        
        // Use WebP if supported and available
        if (this.options.webpSupport && bgWebp) {
            imageUrl = bgWebp;
        }
        
        // Preload background image
        const tempImg = new Image();
        
        return new Promise((resolve, reject) => {
            tempImg.onload = () => {
                element.style.backgroundImage = `url(${imageUrl})`;
                element.removeAttribute('data-bg');
                element.removeAttribute('data-bg-webp');
                resolve();
            };
            
            tempImg.onerror = reject;
            tempImg.src = imageUrl;
        });
    }
    
    // Force load all images (useful for print or specific scenarios)
    loadAll() {
        const allLazy = document.querySelectorAll('[data-src], [data-srcset], [data-bg]');
        allLazy.forEach(element => this.loadImage(element));
    }
    
    // Add new images to observation
    observe(element) {
        if (element && !this.loaded.has(element)) {
            this.observer.observe(element);
        }
    }
    
    // Destroy the loader
    destroy() {
        this.observer.disconnect();
        this.queue.clear();
        this.loading.clear();
        this.loaded.clear();
    }
}

// Auto-initialize on DOM ready
if (typeof window !== 'undefined') {
    let imageLoader;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            imageLoader = new ImageLoader();
            window.imageLoader = imageLoader;
        });
    } else {
        imageLoader = new ImageLoader();
        window.imageLoader = imageLoader;
    }
    
    // Re-observe on dynamic content
    if (typeof MutationObserver !== 'undefined') {
        const contentObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        // Check if it's a lazy image
                        if (node.matches && node.matches('[data-src], [data-srcset], [data-bg]')) {
                            imageLoader.observe(node);
                        }
                        // Check children
                        const lazyChildren = node.querySelectorAll('[data-src], [data-srcset], [data-bg]');
                        lazyChildren.forEach(child => imageLoader.observe(child));
                    }
                });
            });
        });
        
        contentObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageLoader;
}