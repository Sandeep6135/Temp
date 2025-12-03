// Generate CSRF token
function generateCSRFToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Set CSRF token in form
const csrfToken = generateCSRFToken();
sessionStorage.setItem('csrfToken', csrfToken);

document.getElementById('signInForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const formToken = document.querySelector('input[name="csrf_token"]')?.value;
    
    // Validate CSRF token
    if (!formToken || formToken !== sessionStorage.getItem('csrfToken')) {
        alert('Security error: Invalid request');
        return;
    }

    console.log('Email:', email);
    console.log('Authentication request validated');

    // API call for authentication
    authenticateUser(email, password);
});

// Authentication API function
async function authenticateUser(email, password) {
    // Check for admin account
    if (email === 'admin@website.com' && password === '123456') {
        console.log('Admin login successful');
        sessionStorage.setItem('userRole', 'admin');
        sessionStorage.setItem('userEmail', email);
        sessionStorage.setItem('userName', 'Admin');
        sessionStorage.setItem('authToken', 'admin_' + Date.now());
        // Set default admin profile data if not exists
        if (!sessionStorage.getItem('userPhone')) {
            sessionStorage.setItem('userPhone', '+1-234-567-8900');
            sessionStorage.setItem('userBio', 'Website Administrator');
            sessionStorage.setItem('userLocation', 'Digital World');
            sessionStorage.setItem('userWebsite', 'https://admin.website.com');
        }
        alert('Welcome Admin!');
        window.location.href = '../../index.html';
        return;
    }
    
    try {
        // Mock API call - replace with your actual authentication endpoint
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': sessionStorage.getItem('csrfToken')
            },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Login successful:', data);
            sessionStorage.setItem('userRole', 'user');
            sessionStorage.setItem('userEmail', email);
            sessionStorage.setItem('authToken', data.token || 'user_' + Date.now());
            // Extract username from response or use email prefix
            const username = data.name || email.split('@')[0];
            sessionStorage.setItem('userName', username);
            // Redirect to dashboard or home page
            window.location.href = '../../index.html';
        } else {
            alert('Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Authentication error:', error);
        alert('Network error. Please try again.');
    }
}