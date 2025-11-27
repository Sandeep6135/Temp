// AWS Cognito Authentication Module
class CognitoAuth {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
    }

    // Sign in user
    async signIn(email, password) {
        try {
            console.log('Attempting sign in with:', email);
            
            // Get Auth from Amplify
            const Auth = window.Amplify?.Auth || window.Auth;
            if (!Auth) {
                throw new Error('AWS Auth not available - check Amplify setup');
            }
            
            const user = await Auth.signIn(email, password);
            console.log('Sign in successful:', user);
            this.currentUser = user;
            await this.checkAdminStatus();
            return { success: true, user };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Sign out user
    async signOut() {
        try {
            const Auth = window.Amplify?.Auth || window.Auth;
            if (Auth) {
                await Auth.signOut();
            }
            this.currentUser = null;
            this.isAdmin = false;
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    // Get current authenticated user
    async getCurrentUser() {
        try {
            const Auth = window.Amplify?.Auth || window.Auth;
            if (!Auth) return null;
            
            const user = await Auth.currentAuthenticatedUser();
            this.currentUser = user;
            await this.checkAdminStatus();
            return user;
        } catch (error) {
            this.currentUser = null;
            this.isAdmin = false;
            return null;
        }
    }

    // Check if user is in Admin group
    async checkAdminStatus() {
        try {
            if (!this.currentUser) return false;
            
            const Auth = window.Amplify?.Auth || window.Auth;
            if (!Auth) return false;
            
            const session = await Auth.currentSession();
            const groups = session.getAccessToken().payload['cognito:groups'] || [];
            this.isAdmin = groups.includes('Admin');
            return this.isAdmin;
        } catch (error) {
            console.error('Error checking admin status:', error);
            this.isAdmin = false;
            return false;
        }
    }

    // Validate session and check if user is authenticated
    async validateSession() {
        try {
            const Auth = window.Amplify?.Auth || window.Auth;
            if (!Auth) return false;
            
            const session = await Auth.currentSession();
            return session.isValid();
        } catch (error) {
            return false;
        }
    }

    // Get user email
    getUserEmail() {
        return this.currentUser?.attributes?.email || 'guest@example.com';
    }

    // Get username
    getUsername() {
        return this.currentUser?.username || 'Guest User';
    }
}

// Global auth instance
const cognitoAuth = new CognitoAuth();