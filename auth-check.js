// Admin authentication check for admin.html
document.addEventListener('DOMContentLoaded', function() {
    try {
        const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
        
        if (!isAdmin) {
            alert('Access denied. Admin login required.');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error checking admin authentication:', error);
        // Redirect to home on error for security
        window.location.href = 'index.html';
    }
});