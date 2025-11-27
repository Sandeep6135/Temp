// Secure admin authentication check using AWS Cognito
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Check if user is authenticated
        const isValidSession = await cognitoAuth.validateSession();
        
        if (!isValidSession) {
            alert('Access denied. Please login first.');
            window.location.href = 'index.html';
            return;
        }
        
        // Get current user and check admin status
        await cognitoAuth.getCurrentUser();
        const isAdmin = await cognitoAuth.checkAdminStatus();
        
        if (!isAdmin) {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'index.html';
            return;
        }
        
        console.log('Admin access granted');
    } catch (error) {
        console.error('Error checking admin authentication:', error);
        alert('Authentication error. Please try again.');
        window.location.href = 'index.html';
    }
});