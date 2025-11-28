// Secure admin authentication check using AWS Cognito
document.addEventListener('DOMContentLoaded', async function() {
    const MAX_RETRIES = 3;
    let retryCount = 0;
    
    async function checkAuth() {
        try {
            // Ensure cognitoAuth is available
            if (!window.cognitoAuth) {
                throw new Error('Authentication service not available');
            }
            
            // Check if user is authenticated with timeout
            const authPromise = cognitoAuth.validateSession();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Authentication timeout')), 10000)
            );
            
            const isValidSession = await Promise.race([authPromise, timeoutPromise]);
            
            if (!isValidSession) {
                throw new Error('Invalid session');
            }
            
            // Get current user and check admin status
            const user = await cognitoAuth.getCurrentUser();
            if (!user) {
                throw new Error('No authenticated user found');
            }
            
            const isAdmin = await cognitoAuth.checkAdminStatus();
            
            if (!isAdmin) {
                throw new Error('Admin privileges required');
            }
            
            console.log('Admin access granted for user:', user.username);
            return true;
        } catch (error) {
            console.error('Authentication check failed:', error);
            
            if (retryCount < MAX_RETRIES && error.message.includes('timeout')) {
                retryCount++;
                console.log(`Retrying authentication check (${retryCount}/${MAX_RETRIES})...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return checkAuth();
            }
            
            // Redirect to login with error message
            const errorMsg = error.message.includes('Admin privileges') 
                ? 'Access denied. Admin privileges required.'
                : 'Authentication failed. Please login first.';
            
            alert(errorMsg);
            
            // Secure redirect
            if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
                window.location.replace('index.html');
            } else {
                window.location.href = 'index.html';
            }
            
            return false;
        }
    }
    
    await checkAuth();
});