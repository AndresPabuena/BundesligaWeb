// Bundesliga Web - Interactive Features
// Modern JavaScript with ES6+ features

class BundesligaApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.setupLazyLoading();
        this.setupSmoothScrolling();
        this.setupKeyboardNavigation();
        this.setupThemeToggle();
    }

    // Event Listeners Setup
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.animateCards();
            this.setupCardInteractions();
        });

        // Handle window resize
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));

        // Handle scroll events
        window.addEventListener('scroll', this.throttle(() => {
            this.handleScroll();
        }, 16));
    }

    // Intersection Observer for animations
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    this.observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all cards
        document.querySelectorAll('.card').forEach(card => {
            this.observer.observe(card);
        });
    }

    // Lazy Loading Implementation
    setupLazyLoading() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Smooth Scrolling for Navigation
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Keyboard Navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // ESC key to close any open modals or overlays
            if (e.key === 'Escape') {
                this.closeAllOverlays();
            }

            // Arrow keys for card navigation
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                this.navigateCards(e.key);
            }
        });
    }

    // Theme Toggle (Dark/Light Mode)
    setupThemeToggle() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Apply initial theme
        this.applyTheme(prefersDark.matches ? 'dark' : 'light');

        // Listen for system theme changes
        prefersDark.addEventListener('change', (e) => {
            this.applyTheme(e.matches ? 'dark' : 'light');
        });
    }

    // Card Interactions
    setupCardInteractions() {
        document.querySelectorAll('.card').forEach(card => {
            // Add hover effects
            card.addEventListener('mouseenter', () => {
                this.highlightCard(card);
            });

            card.addEventListener('mouseleave', () => {
                this.unhighlightCard(card);
            });

            // Add click interactions
            card.addEventListener('click', () => {
                this.showTeamDetails(card);
            });

            // Add keyboard support
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.showTeamDetails(card);
                }
            });
        });
    }

    // Animate cards on load
    animateCards() {
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in');
            }, index * 100);
        });
    }

    // Highlight card on hover
    highlightCard(card) {
        card.style.transform = 'translateY(-8px) scale(1.02)';
        card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
    }

    // Remove highlight
    unhighlightCard(card) {
        card.style.transform = '';
        card.style.boxShadow = '';
    }

    // Show team details (modal or expanded view)
    showTeamDetails(card) {
        const teamName = card.querySelector('h3').textContent;
        const teamStats = card.querySelector('.team-stats');
        
        // Create modal with team information
        this.createModal({
            title: teamName,
            content: this.generateTeamDetailsHTML(card),
            onClose: () => {
                card.focus(); // Return focus to card
            }
        });
    }

    // Generate detailed team information
    generateTeamDetailsHTML(card) {
        const teamName = card.querySelector('h3').textContent;
        const stats = card.querySelectorAll('dd');
        
        return `
            <div class="team-details">
                <div class="team-logo">
                    ${card.querySelector('.card-image').innerHTML}
                </div>
                <div class="team-info">
                    <h2>${teamName}</h2>
                    <div class="stats-grid">
                        <div class="stat">
                            <span class="stat-label">Posición</span>
                            <span class="stat-value">${stats[0]?.textContent || 'N/A'}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Puntos</span>
                            <span class="stat-value">${stats[1]?.textContent || 'N/A'}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Partidos</span>
                            <span class="stat-value">${stats[2]?.textContent || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Create modal
    createModal({ title, content, onClose }) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal" role="dialog" aria-labelledby="modal-title" aria-modal="true">
                <div class="modal-header">
                    <h2 id="modal-title">${title}</h2>
                    <button class="modal-close" aria-label="Cerrar modal">&times;</button>
                </div>
                <div class="modal-content">
                    ${content}
                </div>
            </div>
        `;

        // Add event listeners
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            this.closeModal(modal, onClose);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal, onClose);
            }
        });

        // Add to DOM
        document.body.appendChild(modal);
        
        // Focus management
        setTimeout(() => {
            closeBtn.focus();
        }, 100);

        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
    }

    // Close modal
    closeModal(modal, onClose) {
        modal.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(modal);
            if (onClose) onClose();
        }, 300);
    }

    // Close all overlays
    closeAllOverlays() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            this.closeModal(modal);
        });
    }

    // Navigate cards with keyboard
    navigateCards(direction) {
        const cards = Array.from(document.querySelectorAll('.card'));
        const focusedCard = document.activeElement.closest('.card');
        
        if (!focusedCard) return;

        const currentIndex = cards.indexOf(focusedCard);
        let nextIndex;

        if (direction === 'ArrowLeft') {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
        } else {
            nextIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
        }

        cards[nextIndex].focus();
    }

    // Handle window resize
    handleResize() {
        // Recalculate any layout-dependent features
        this.updateLayout();
    }

    // Handle scroll events
    handleScroll() {
        const scrollY = window.scrollY;
        const header = document.querySelector('header');
        
        // Add/remove scrolled class for header styling
        if (scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    // Update layout on resize
    updateLayout() {
        // Force reflow for any layout calculations
        document.body.offsetHeight;
    }

    // Apply theme
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    // Utility: Debounce function
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

    // Utility: Throttle function
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

// Initialize the application
const app = new BundesligaApp();

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BundesligaApp;
}