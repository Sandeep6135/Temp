class SimpleAuth {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.initialized = false;
        this.initializeAmplify();
    }

    async initializeAmplify() {
        try {
            let attempts = 0;
            const maxAttempts = 50;
            
            while (!window.Amplify && !window.aws_amplify && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!window.Amplify && window.aws_amplify) {
                window.Amplify = window.aws_amplify;
            }
            
            if (window.Amplify && window.awsConfig) {
                window.Amplify.configure(window.awsConfig);
                await this.checkCurrentUser();
                this.initialized = true;
            } else {
                throw new Error('Amplify or AWS config not available');
            }
        } catch (error) {
            console.error('Amplify initialization error:', error);
            this.initialized = false;
        }
    }

    async signIn(email, password) {
        try {
            if (!this.initialized || !window.Amplify) {
                throw new Error('Authentication service not initialized');
            }
            
            // Input validation
            if (!email || !password) {
                throw new Error('Email and password are required');
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Invalid email format');
            }
            
            const user = await window.Amplify.Auth.signIn(email.trim(), password);
            this.currentUser = user;
            await this.checkAdminStatus();
            
            return { success: true, user };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message || 'Sign in failed' };
        }
    }

    async signOut() {
        try {
            if (window.Amplify?.Auth) {
                await window.Amplify.Auth.signOut();
            }
            this.currentUser = null;
            this.isAdmin = false;
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message || 'Sign out failed' };
        }
    }

    async checkCurrentUser() {
        try {
            if (!window.Amplify?.Auth) {
                return null;
            }
            
            this.currentUser = await window.Amplify.Auth.currentAuthenticatedUser();
            await this.checkAdminStatus();
            return this.currentUser;
        } catch (error) {
            this.currentUser = null;
            this.isAdmin = false;
            return null;
        }
    }

    async checkAdminStatus() {
        try {
            if (!this.currentUser || !window.Amplify?.Auth) {
                this.isAdmin = false;
                return false;
            }
            
            const session = await window.Amplify.Auth.currentSession();
            const groups = session.getAccessToken().payload['cognito:groups'] || [];
            this.isAdmin = Array.isArray(groups) && groups.includes('Admin');
            return this.isAdmin;
        } catch (error) {
            console.error('Admin status check error:', error);
            this.isAdmin = false;
            return false;
        }
    }

    getUsername() {
        return this.currentUser?.username || 'Guest';
    }

    getUserEmail() {
        return this.currentUser?.attributes?.email || 'guest@example.com';
    }

    isInitialized() {
        return this.initialized;
    }
}
const simpleAuth = new SimpleAuth();
