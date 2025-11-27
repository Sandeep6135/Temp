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
        alert('Register functionality would be implemented here');
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

// Floating particles animation
function createFloatingParticles() {
    const particlesContainer = document.querySelector('.floating-particles');
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '2px';
        particle.style.height = '2px';
        particle.style.background = '#FFFFFF';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${3 + Math.random() * 4}s ease-in-out infinite`;
        particle.style.animationDelay = Math.random() * 2 + 's';
        particle.style.opacity = '0.6';
        
        particlesContainer.appendChild(particle);
    }
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
        
        if (loginBtn) loginBtn.addEventListener('click', showLogin);
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
    
    // Service card animations
    const serviceCards = document.querySelectorAll('.service-card');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
            }
        });
    }, observerOptions);
    
    serviceCards.forEach(card => {
        observer.observe(card);
    });
    
    // Track card hover effects
    const trackCards = document.querySelectorAll('.track-card');
    trackCards.forEach(card => {
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
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                try {
                    // Get form data with proper validation
                    const name = document.getElementById('contactName')?.value?.trim();
                    const email = document.getElementById('contactEmail')?.value?.trim();
                    const message = document.getElementById('contactMessage')?.value?.trim();
                    
                    if (!name || !email || !message) {
                        alert('Please fill in all required fields.');
                        return;
                    }
                    
                    // Basic email validation
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                        alert('Please enter a valid email address.');
                        return;
                    }
                    
                    // Store contact form data
                    const request = {
                        id: Date.now(),
                        type: 'contact',
                        user: name,
                        email: email,
                        details: message,
                        date: new Date().toISOString(),
                        status: 'pending'
                    };
                    
                    storeRequest(request);
                    alert(`Thank you ${name}! Your message has been sent. We'll get back to you at ${email} soon.`);
                    
                    // Reset form
                    this.reset();
                } catch (error) {
                    console.error('Error submitting contact form:', error);
                    alert('There was an error sending your message. Please try again.');
                }
            });
        }
    
        const loginForm = document.querySelector('.login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                try {
                    const email = document.getElementById('loginEmail')?.value?.trim();
                    const password = document.getElementById('loginPassword')?.value;
                    
                    if (!email || !password) {
                        alert('Please fill in all fields.');
                        return;
                    }
                    
                    // Basic email validation
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                        alert('Please enter a valid email address.');
                        return;
                    }
                    
                    // Simulate login
                    // Check for admin credentials
                    if (email === 'admin@chaoschamber.com' && password === 'admin123') {
                        localStorage.setItem('adminLoggedIn', 'true');
                        localStorage.setItem('currentUser', email);
                        updateAdminControls();
                        alert('Admin login successful!');
                        closeModal('loginModal');
                        return;
                    }
                    
                    // Store user login
                    localStorage.setItem('currentUser', email);
                    localStorage.removeItem('adminLoggedIn');
                    updateAdminControls();
                    alert('Login successful! Welcome to Chaos Chamber.');
                    closeModal('loginModal');
                    showDashboard();
                } catch (error) {
                    console.error('Error during login:', error);
                    alert('Login failed. Please try again.');
                }
            });
        }
    
        // Dashboard button functionality
        const dashboardButtons = document.querySelectorAll('.dashboard-btn');
        dashboardButtons.forEach(button => {
            button.addEventListener('click', function() {
                try {
                    const cardTitle = this.parentElement.querySelector('h3')?.textContent;
                    
                    if (!cardTitle) {
                        console.error('Could not find card title');
                        return;
                    }
                    
                    // Store request in localStorage for admin tracking
                    const request = {
                        id: Date.now(),
                        type: cardTitle.toLowerCase(),
                        user: getCurrentUser(),
                        email: getCurrentUserEmail(),
                        details: `User requested ${cardTitle} service`,
                        date: new Date().toISOString(),
                        status: 'pending'
                    };
                    
                    storeRequest(request);
                    
                    switch(cardTitle) {
                        case 'Collaborations':
                            alert('Collaboration request submitted! Admin will review and assign tasks.');
                            break;
                        case 'Bookings':
                            alert('Booking request submitted! Admin will schedule your session.');
                            break;
                        case 'Uploads':
                            alert('Upload request submitted! Admin will provide upload access.');
                            break;
                        case 'Feedback':
                            alert('Feedback request submitted! Admin will assign a reviewer.');
                            break;
                        default:
                            alert('Request submitted!');
                    }
                } catch (error) {
                    console.error('Error handling dashboard button click:', error);
                    alert('There was an error processing your request. Please try again.');
                }
            });
        });
    
        // Service button functionality
        const serviceButtons = document.querySelectorAll('.service-btn');
        serviceButtons.forEach(button => {
            button.addEventListener('click', function() {
                try {
                    const serviceTitle = this.parentElement.querySelector('h3')?.textContent;
                    const servicePrice = this.parentElement.querySelector('.service-price')?.textContent;
                    
                    if (!serviceTitle || !servicePrice) {
                        console.error('Could not find service details');
                        return;
                    }
                    
                    // Store service request
                    const request = {
                        id: Date.now(),
                        type: 'service',
                        user: getCurrentUser() || 'Guest User',
                        email: getCurrentUserEmail() || 'guest@example.com',
                        details: `Service request: ${serviceTitle} - ${servicePrice}`,
                        date: new Date().toISOString(),
                        status: 'pending'
                    };
                    
                    storeRequest(request);
                    alert(`${serviceTitle} service request submitted! Admin will contact you soon.`);
                } catch (error) {
                    console.error('Error handling service button click:', error);
                    alert('There was an error processing your service request. Please try again.');
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

// Smooth reveal animations for sections
function revealOnScroll() {
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (sectionTop < windowHeight * 0.8) {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }
    });
}

// Initialize reveal animations
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section:not(.hero)');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'all 0.8s ease-out';
    });
});

window.addEventListener('scroll', revealOnScroll);

// Add dynamic glow effect to buttons
function addGlowEffect() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .service-btn, .dashboard-btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 5px 15px rgba(255, 255, 255, 0.2)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
        });
    });
}

// Initialize glow effects
document.addEventListener('DOMContentLoaded', addGlowEffect);

// Performance optimization - throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Apply throttling to scroll events
window.addEventListener('scroll', throttle(revealOnScroll, 100));

// Utility functions for data storage
function storeRequest(request) {
    try {
        const requests = JSON.parse(localStorage.getItem('chaosRequests') || '[]');
        requests.push(request);
        localStorage.setItem('chaosRequests', JSON.stringify(requests));
    } catch (error) {
        console.error('Error storing request:', error);
    }
}

function getCurrentUser() {
    try {
        return localStorage.getItem('currentUser') || 'Guest User';
    } catch (error) {
        console.error('Error getting current user:', error);
        return 'Guest User';
    }
}

function getCurrentUserEmail() {
    try {
        return localStorage.getItem('currentUser') || 'guest@example.com';
    } catch (error) {
        console.error('Error getting current user email:', error);
        return 'guest@example.com';
    }
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
    checkAdminStatus();
});

// Check admin status and show/hide admin controls
function checkAdminStatus() {
    try {
        const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
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