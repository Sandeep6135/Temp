// Security Configuration
const SecurityConfig = {
    // Input validation limits
    MAX_INPUT_LENGTH: {
        name: 100,
        email: 254,
        message: 1000,
        title: 200,
        description: 2000
    },
    
    // File upload restrictions
    FILE_UPLOAD: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'audio/mpeg',
            'audio/wav',
            'audio/ogg',
            'video/mp4',
            'video/webm',
            'application/pdf',
            'text/plain'
        ],
        maxFiles: 5
    },
    
    // Rate limiting
    RATE_LIMITS: {
        contactForm: {
            maxRequests: 5,
            windowMs: 15 * 60 * 1000 // 15 minutes
        },
        login: {
            maxAttempts: 5,
            lockoutMs: 30 * 60 * 1000 // 30 minutes
        }
    },
    
    // Content Security Policy
    CSP_DIRECTIVES: {
        'default-src': "'self'",
        'style-src': "'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com",
        'font-src': "'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com",
        'script-src': "'self' 'unsafe-inline' https://unpkg.com",
        'connect-src': "'self' https://*.amazonaws.com https://*.amazoncognito.com",
        'img-src': "'self' data:",
        'media-src': "'self'",
        'object-src': "'none'",
        'base-uri': "'self'",
        'form-action': "'self'",
        'frame-ancestors': "'none'"
    }
};

// Input sanitization functions
const SecurityUtils = {
    // Sanitize HTML input
    sanitizeHtml: (input) => {
        if (typeof input !== 'string') return '';
        return input
            .replace(/[<>\"'&]/g, '')
            .trim()
            .substring(0, SecurityConfig.MAX_INPUT_LENGTH.message);
    },
    
    // Validate email format
    validateEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email.length <= SecurityConfig.MAX_INPUT_LENGTH.email;
    },
    
    // Validate file upload
    validateFile: (file) => {
        const errors = [];
        
        if (file.size > SecurityConfig.FILE_UPLOAD.maxSize) {
            errors.push(`File size exceeds ${SecurityConfig.FILE_UPLOAD.maxSize / 1024 / 1024}MB limit`);
        }
        
        if (!SecurityConfig.FILE_UPLOAD.allowedTypes.some(type => file.type.startsWith(type))) {
            errors.push('File type not allowed');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    },
    
    // Rate limiting check
    checkRateLimit: (key, limit) => {
        const now = Date.now();
        const windowStart = now - limit.windowMs;
        
        // Get stored requests from localStorage
        const stored = localStorage.getItem(`rateLimit_${key}`);
        let requests = stored ? JSON.parse(stored) : [];
        
        // Filter out old requests
        requests = requests.filter(timestamp => timestamp > windowStart);
        
        // Check if limit exceeded
        if (requests.length >= limit.maxRequests) {
            return {
                allowed: false,
                resetTime: requests[0] + limit.windowMs
            };
        }
        
        // Add current request
        requests.push(now);
        localStorage.setItem(`rateLimit_${key}`, JSON.stringify(requests));
        
        return {
            allowed: true,
            remaining: limit.maxRequests - requests.length
        };
    },
    
    // Generate secure random ID
    generateSecureId: () => {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substr(2, 9);
        return `${timestamp}-${randomPart}`;
    },
    
    // Escape HTML for safe display
    escapeHtml: (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SecurityConfig, SecurityUtils };
} else {
    window.SecurityConfig = SecurityConfig;
    window.SecurityUtils = SecurityUtils;
}