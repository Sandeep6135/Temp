// Toast Notification System
class ToastManager {
    constructor() {
        this.container = null;
        this.activeToasts = new Set();
        this.maxToasts = 5;
        this.init();
    }
    
    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            this.container.setAttribute('aria-live', 'polite');
            this.container.setAttribute('aria-atomic', 'false');
            document.body.appendChild(this.container);
        }
    }
    
    show(message, type = 'info', duration = 4000) {
        // Input validation
        if (!message || typeof message !== 'string') {
            console.error('Invalid toast message');
            return null;
        }
        
        // Sanitize message
        const sanitizedMessage = message.replace(/[<>"'&]/g, '').substring(0, 200);
        
        // Limit number of active toasts
        if (this.activeToasts.size >= this.maxToasts) {
            const oldestToast = this.activeToasts.values().next().value;
            this.removeToast(oldestToast);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'alert');
        
        const icon = this.getIcon(type);
        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.textContent = '×';
        closeBtn.setAttribute('aria-label', 'Close notification');
        closeBtn.setAttribute('type', 'button');
        
        const iconSpan = document.createElement('span');
        iconSpan.className = 'toast-icon';
        iconSpan.textContent = icon;
        iconSpan.setAttribute('aria-hidden', 'true');
        
        const messageSpan = document.createElement('span');
        messageSpan.className = 'toast-message';
        messageSpan.textContent = sanitizedMessage;
        
        toast.appendChild(iconSpan);
        toast.appendChild(messageSpan);
        
        toast.appendChild(closeBtn);
        this.container.appendChild(toast);
        this.activeToasts.add(toast);
        
        // Trigger haptic feedback for success (with error handling)
        if (type === 'success' && navigator.vibrate) {
            try {
                navigator.vibrate([50, 30, 50]);
            } catch (error) {
                console.warn('Vibration not supported:', error);
            }
        }
        
        // Show animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // Auto remove function
        const removeToast = () => this.removeToast(toast);
        
        // Close button handler
        closeBtn.addEventListener('click', removeToast, { once: true });
        
        // Auto-dismiss with validation
        if (duration > 0 && duration <= 30000) {
            setTimeout(removeToast, duration);
        }
        
        return toast;
    }
    
    removeToast(toast) {
        if (!toast || !this.activeToasts.has(toast)) return;
        
        this.activeToasts.delete(toast);
        toast.classList.remove('show');
        
        setTimeout(() => {
            if (toast.parentNode === this.container) {
                this.container.removeChild(toast);
            }
        }, 300);
    }
    
    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }
}

// Global toast instance
const toastManager = new ToastManager();

// Utility function for easy access
function showToast(message, type = 'info', duration = 4000) {
    return toastManager.show(message, type, duration);
}

// Smooth scrolling and navigation
function scrollToSection(sectionId) {
    try {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth'
            });
        }
    } catch (error) {
        console.error('Error scrolling to section:', error);
    }
}

// Modal functionality
function showLogin() {
    try {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'block';
            modal.setAttribute('aria-hidden', 'false');
            // Focus first input
            const firstInput = modal.querySelector('input');
            if (firstInput) firstInput.focus();
        }
    } catch (error) {
        console.error('Error showing login modal:', error);
    }
}

function showDashboard() {
    try {
        const modal = document.getElementById('dashboardModal');
        if (modal) {
            modal.style.display = 'block';
            modal.setAttribute('aria-hidden', 'false');
        }
    } catch (error) {
        console.error('Error showing dashboard modal:', error);
    }
}

function showRegister() {
    try {
        closeModal('loginModal');
        // Add register modal functionality here
        showToast('Register functionality would be implemented here', 'info');
    } catch (error) {
        console.error('Error showing register:', error);
    }
}

function closeModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    } catch (error) {
        console.error('Error closing modal:', error);
    }
}

// Close modal when clicking outside
function handleModalClick(event) {
    try {
        const loginModal = document.getElementById('loginModal');
        const dashboardModal = document.getElementById('dashboardModal');
        
        if (event.target === loginModal) {
            closeModal('loginModal');
        }
        if (event.target === dashboardModal) {
            closeModal('dashboardModal');
        }
    } catch (error) {
        console.error('Error handling modal click:', error);
    }
}

window.addEventListener('click', handleModalClick);

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.9)';
        }
    }
});

// High-performance canvas-based floating particles
function createFloatingParticles() {
    const container = document.querySelector('.floating-particles');
    if (!container) return;
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }
    
    // Create canvas with error handling
    const canvas = document.createElement('canvas');
    let ctx;
    try {
        ctx = canvas.getContext('2d');
        if (!ctx) {
            console.warn('Canvas context not available');
            return;
        }
    } catch (error) {
        console.warn('Canvas not supported:', error);
        return;
    }
    
    container.appendChild(canvas);
    
    // Particle system with performance optimization
    const particles = [];
    const particleCount = Math.min(15, Math.floor(window.innerWidth / 100));
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            opacity: 0.3 + Math.random() * 0.3
        });
    }
    
    // Resize canvas
    function resizeCanvas() {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
    }
    
    let animationId;
    let isVisible = true;
    
    // Visibility API for performance
    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
        if (isVisible && !animationId) {
            animate();
        } else if (!isVisible && animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    });
    
    // Optimized animation loop
    function animate() {
        if (!isVisible) return;
        
        try {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around edges
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;
                
                // Draw particle
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
                ctx.fill();
            });
            
            animationId = requestAnimationFrame(animate);
        } catch (error) {
            console.error('Animation error:', error);
        }
    }
    
    // Initialize
    resizeCanvas();
    animate();
    
    // Handle resize
    window.addEventListener('resize', resizeCanvas);
}

// Initialize event listeners
function initializeEventListeners() {
    try {
        // Navigation buttons
        const loginBtn = document.getElementById('loginBtn');
        const dashboardBtn = document.getElementById('dashboardBtn');
        const adminBtn = document.getElementById('adminBtn');
        const listenBtn = document.getElementById('listenBtn');
        const bookBtn = document.getElementById('bookBtn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', async () => {
                console.log('Login button clicked');
                try {
                    const user = await simpleAuth.checkCurrentUser();
                    if (user) {
                        // User is logged in, show logout option
                        if (confirm('You are already logged in. Do you want to logout?')) {
                            await simpleAuth.signOut();
                            updateAdminControls();
                            showToast('Logged out successfully.', 'success');
                        }
                    } else {
                        console.log('No current user, showing login modal');
                        showLogin();
                    }
                } catch (error) {
                    console.error('Error in login button handler:', error);
                    showLogin();
                }
            });
        } else {
            console.error('Login button not found');
        }
        if (dashboardBtn) dashboardBtn.addEventListener('click', showDashboard);
        if (adminBtn) adminBtn.addEventListener('click', () => window.location.href = 'admin.html');
        if (listenBtn) listenBtn.addEventListener('click', () => scrollToSection('music'));
        if (bookBtn) bookBtn.addEventListener('click', () => scrollToSection('services'));
        
        // Modal close buttons
        const closeLogin = document.getElementById('closeLogin');
        const closeDashboard = document.getElementById('closeDashboard');
        const showRegisterBtn = document.getElementById('showRegisterBtn');
        
        if (closeLogin) closeLogin.addEventListener('click', () => closeModal('loginModal'));
        if (closeDashboard) closeDashboard.addEventListener('click', () => closeModal('dashboardModal'));
        if (showRegisterBtn) showRegisterBtn.addEventListener('click', showRegister);
        
        // Play button click handlers
        const playButtons = document.querySelectorAll('.play-btn');
        playButtons.forEach(button => {
            button.addEventListener('click', function() {
                try {
                    // Toggle play/pause icon
                    const icon = this.querySelector('i');
                    if (icon && icon.classList.contains('fa-play')) {
                        icon.classList.remove('fa-play');
                        icon.classList.add('fa-pause');
                        this.setAttribute('aria-label', this.getAttribute('aria-label').replace('Play', 'Pause'));
                        console.log('Playing track...');
                    } else if (icon) {
                        icon.classList.remove('fa-pause');
                        icon.classList.add('fa-play');
                        this.setAttribute('aria-label', this.getAttribute('aria-label').replace('Pause', 'Play'));
                        console.log('Pausing track...');
                    }
                } catch (error) {
                    console.error('Error toggling play button:', error);
                }
            });
        });
    } catch (error) {
        console.error('Error initializing event listeners:', error);
    }
}

// Play button functionality
document.addEventListener('DOMContentLoaded', function() {
    try {
        createFloatingParticles();
        initializeEventListeners();
    
    // Service card animations with optimized observer
    const serviceCards = document.querySelectorAll('.service-card');
    
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transform = 'translateY(0) scale(1)';
                entry.target.style.opacity = '1';
                entry.target.style.willChange = 'auto';
            }
        });
    }, { threshold: 0.15 });
    
    serviceCards.forEach(card => {
        card.style.transform = 'translateY(30px) scale(0.95)';
        card.style.opacity = '0';
        card.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.6s ease-out';
        card.style.willChange = 'transform, opacity';
        cardObserver.observe(card);
    });
    
    // Optimized track card hover effects
    const trackCards = document.querySelectorAll('.track-card');
    trackCards.forEach(card => {
        card.style.willChange = 'transform';
        card.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
        // Form submissions
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                try {
                    // Get form data with proper validation
                    const nameEl = document.getElementById('contactName');
                    const emailEl = document.getElementById('contactEmail');
                    const messageEl = document.getElementById('contactMessage');
                    
                    if (!nameEl || !emailEl || !messageEl) {
                        showToast('Form elements not found.', 'error');
                        return;
                    }
                    
                    const name = nameEl.value?.trim();
                    const email = emailEl.value?.trim();
                    const message = messageEl.value?.trim();
                    
                    if (!name || !email || !message) {
                        showToast('Please fill in all required fields.', 'warning');
                        return;
                    }
                    
                    // Input length validation
                    if (name.length > 100) {
                        showToast('Name must be less than 100 characters.', 'warning');
                        return;
                    }
                    
                    if (message.length > 1000) {
                        showToast('Message must be less than 1000 characters.', 'warning');
                        return;
                    }
                    
                    // Email validation
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                        showToast('Please enter a valid email address.', 'warning');
                        return;
                    }
                    
                    // Sanitize inputs
                    const sanitizedName = name.replace(/[<>"'&]/g, '');
                    const sanitizedMessage = message.replace(/[<>"'&]/g, '');
                    
                    // Submit contact form to API
                    const request = {
                        type: 'contact',
                        name: sanitizedName,
                        email: email,
                        message: sanitizedMessage
                    };
                    
                    await apiClient.createRequest(request);
                    showToast(`Thank you ${sanitizedName}! Your message has been sent successfully.`, 'success');
                    
                    // Reset form
                    this.reset();
                } catch (error) {
                    console.error('Error submitting contact form:', error);
                    showToast('There was an error sending your message. Please try again.', 'error');
                }
            });
        }
    
        const loginForm = document.querySelector('.login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                try {
                    const email = document.getElementById('loginEmail')?.value?.trim();
                    const password = document.getElementById('loginPassword')?.value;
                    
                    if (!email || !password) {
                        showToast('Please fill in all fields.', 'warning');
                        return;
                    }
                    
                    // Basic email validation
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                        showToast('Please enter a valid email address.', 'warning');
                        return;
                    }
                    
                    // Sign in with Cognito
                    const result = await simpleAuth.signIn(email, password);
                    
                    if (result.success) {
                        updateAdminControls();
                        showToast('Login successful! Welcome to Chaos Chamber.', 'success');
                        closeModal('loginModal');
                        showDashboard();
                    } else {
                        showToast('Login failed: ' + result.error, 'error');
                    }
                } catch (error) {
                    console.error('Error during login:', error);
                    showToast('Login failed. Please try again.', 'error');
                }
            });
        }
    
        // Dashboard button functionality
        const dashboardButtons = document.querySelectorAll('.dashboard-btn');
        dashboardButtons.forEach(button => {
            button.addEventListener('click', async function() {
                try {
                    const cardTitle = this.parentElement.querySelector('h3')?.textContent;
                    
                    if (!cardTitle) {
                        console.error('Could not find card title');
                        return;
                    }
                    
                    // Submit dashboard request to API
                    const request = {
                        type: cardTitle.toLowerCase(),
                        user: getCurrentUser(),
                        email: getCurrentUserEmail(),
                        details: `User requested ${cardTitle} service`
                    };
                    
                    await apiClient.createRequest(request);
                    
                    switch(cardTitle) {
                        case 'Collaborations':
                            showToast('Collaboration request submitted! Admin will review and assign tasks.', 'success');
                            break;
                        case 'Bookings':
                            showToast('Booking request submitted! Admin will schedule your session.', 'success');
                            break;
                        case 'Uploads':
                            showToast('Upload request submitted! Admin will provide upload access.', 'success');
                            break;
                        case 'Feedback':
                            showToast('Feedback request submitted! Admin will assign a reviewer.', 'success');
                            break;
                        default:
                            showToast('Request submitted successfully!', 'success');
                    }
                } catch (error) {
                    console.error('Error handling dashboard button click:', error);
                    showToast('There was an error processing your request. Please try again.', 'error');
                }
            });
        });
    
        // Service button functionality
        const serviceButtons = document.querySelectorAll('.service-btn');
        serviceButtons.forEach(button => {
            button.addEventListener('click', async function() {
                try {
                    const serviceTitle = this.parentElement.querySelector('h3')?.textContent?.trim();
                    const servicePrice = this.parentElement.querySelector('.service-price')?.textContent?.trim();
                    
                    if (!serviceTitle || !servicePrice) {
                        console.error('Could not find service details');
                        showToast('Service information not available.', 'error');
                        return;
                    }
                    
                    // Sanitize service data
                    const sanitizedTitle = serviceTitle.replace(/[<>"'&]/g, '');
                    const sanitizedPrice = servicePrice.replace(/[<>"'&]/g, '');
                    
                    // Submit service request to API
                    const request = {
                        type: 'service',
                        user: getCurrentUser() || 'Guest User',
                        email: getCurrentUserEmail() || 'guest@example.com',
                        details: `Service request: ${sanitizedTitle} - ${sanitizedPrice}`
                    };
                    
                    await apiClient.createRequest(request);
                    showToast(`${sanitizedTitle} service request submitted! Admin will contact you soon.`, 'success');
                } catch (error) {
                    console.error('Error handling service button click:', error);
                    showToast('There was an error processing your service request. Please try again.', 'error');
                }
            });
        });
    } catch (error) {
        console.error('Error in DOMContentLoaded handler:', error);
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    // Close modals with Escape key
    if (e.key === 'Escape') {
        closeModal('loginModal');
        closeModal('dashboardModal');
    }
});

// High-performance reveal animations using Intersection Observer
function initializeRevealAnimations() {
    const sections = document.querySelectorAll('section:not(.hero)');
    
    // Set initial state
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.8s ease-out';
        section.style.willChange = 'transform, opacity';
    });
    
    // Create Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.willChange = 'auto'; // Reset after animation
            }
        });
    }, {
        threshold: 0.15, // Trigger when 15% visible
        rootMargin: '0px'
    });
    
    // Observe all sections
    sections.forEach(section => observer.observe(section));
}

// Initialize reveal animations with performance check
document.addEventListener('DOMContentLoaded', () => {
    // Check for reduced motion preference
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        initializeRevealAnimations();
    }
});

// Add dynamic glow effect to buttons with performance optimization
function addGlowEffect() {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }
    
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .service-btn, .dashboard-btn');
    
    // Use event delegation for better performance
    document.addEventListener('mouseover', function(e) {
        if (e.target.matches('.btn-primary, .btn-secondary, .service-btn, .dashboard-btn')) {
            e.target.style.boxShadow = '0 5px 15px rgba(255, 255, 255, 0.2)';
        }
    });
    
    document.addEventListener('mouseout', function(e) {
        if (e.target.matches('.btn-primary, .btn-secondary, .service-btn, .dashboard-btn')) {
            e.target.style.boxShadow = '';
        }
    });
}

// Initialize glow effects with performance check
document.addEventListener('DOMContentLoaded', () => {
    // Defer non-critical animations
    requestIdleCallback(() => {
        addGlowEffect();
    }, { timeout: 2000 });
});

// Performance optimization - use existing throttle from PerformanceUtils
// Removed duplicate throttle function - using PerformanceUtils.throttle instead

// Removed scroll event listener - now using Intersection Observer

// Utility functions for data storage (deprecated - now using API)
// Keeping for backward compatibility
function storeRequest(request) {
    console.warn('storeRequest is deprecated. Use apiClient.createRequest() instead.');
}

function getCurrentUser() {
    return simpleAuth.getUsername();
}

function getCurrentUserEmail() {
    return simpleAuth.getUserEmail();
}

// Add back to home button
function addBackButton() {
    const backBtn = document.createElement('button');
    backBtn.className = 'back-btn';
    backBtn.innerHTML = '<i class="fas fa-home"></i>';
    backBtn.onclick = () => window.location.href = 'index.html';
    backBtn.title = 'Back to Home';
    
    // Only add if not on home page
    if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
        document.body.appendChild(backBtn);
    }
}

// Initialize back button and admin controls
document.addEventListener('DOMContentLoaded', function() {
    addBackButton();
    // Wait for auth to initialize, then check admin status
    setTimeout(() => {
        checkAdminStatus();
    }, 1000);
});

// Check admin status and show/hide admin controls
function checkAdminStatus() {
    try {
        const isAdmin = simpleAuth.isAdmin;
        const adminElements = document.querySelectorAll('.admin-only');
        
        adminElements.forEach(element => {
            element.style.display = isAdmin ? 'block' : 'none';
        });
    } catch (error) {
        console.error('Error checking admin status:', error);
    }
}

// Update login function to check admin status after login
function updateAdminControls() {
    checkAdminStatus();
}