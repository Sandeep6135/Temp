// API configuration for different login providers
const API_CONFIG = {
    google: {
        clientId: 'your-google-client-id',
        endpoint: 'https://accounts.google.com/oauth/authorize'
    },
    facebook: {
        appId: 'your-facebook-app-id',
        endpoint: 'https://www.facebook.com/v18.0/dialog/oauth'
    },
    apple: {
        clientId: 'your-apple-client-id',
        endpoint: 'https://appleid.apple.com/auth/authorize'
    }
};

// Google OAuth login
function signUpWithGoogle() {
    const params = new URLSearchParams({
        client_id: API_CONFIG.google.clientId,
        redirect_uri: window.location.origin + '/auth/google/callback',
        response_type: 'code',
        scope: 'openid email profile'
    });
    
    window.location.href = `${API_CONFIG.google.endpoint}?${params}`;
}

// Facebook OAuth login
function signUpWithFacebook() {
    const params = new URLSearchParams({
        client_id: API_CONFIG.facebook.appId,
        redirect_uri: window.location.origin + '/auth/facebook/callback',
        response_type: 'code',
        scope: 'email'
    });
    
    window.location.href = `${API_CONFIG.facebook.endpoint}?${params}`;
}

// Apple OAuth login
function signUpWithApple() {
    const params = new URLSearchParams({
        client_id: API_CONFIG.apple.clientId,
        redirect_uri: window.location.origin + '/auth/apple/callback',
        response_type: 'code',
        scope: 'name email'
    });
    
    window.location.href = `${API_CONFIG.apple.endpoint}?${params}`;
}

// Phone number signup (mock implementation)
function signUpWithPhone() {
    const phone = prompt('Enter your phone number:');
    if (phone) {
        // Mock API call for phone verification
        console.log('Sending SMS verification to:', phone);
        alert('Verification code sent to ' + phone);
        
        const code = prompt('Enter verification code:');
        if (code) {
            console.log('Phone verification successful');
            alert('Phone signup successful!');
        }
    }
}