// Simplified Authentication for Chaos Chamber
class SimpleAuth {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.initializeAmplify();
    }

    async initializeAmplify() {
        // Wait for Amplify to load
        let attempts = 0;
        while (!window.Amplify && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (window.Amplify) {
            try {
                window.Amplify.configure({
                    Auth: {
                        region: 'eu-north-1',
                        userPoolId: 'eu-north-1_kdsgHk0cI',
                        userPoolWebClientId: '5lnhh5rqepl5uvq41akuvdhil3',
                        mandatorySignIn: false,
                        authenticationFlowType: 'USER_SRP_AUTH'
                    }
                });
                console.log('Amplify configured successfully');
                await this.checkCurrentUser();
            } catch (error) {
                console.error('Amplify configuration error:', error);
            }
        } else {
            console.error('Amplify failed to load');
        }
    }

    async signIn(email, password) {
        try {
            if (!window.Amplify?.Auth) {
                throw new Error('Amplify Auth not available');
            }

            const user = await window.Amplify.Auth.signIn(email, password);
            this.currentUser = user;
            await this.checkAdminStatus();
            return { success: true, user };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
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
            return { success: false, error: error.message };
        }
    }

    async checkCurrentUser() {
        try {
            if (!window.Amplify?.Auth) return null;
            
            const user = await window.Amplify.Auth.currentAuthenticatedUser();
            this.currentUser = user;
            await this.checkAdminStatus();
            return user;
        } catch (error) {
            this.currentUser = null;
            this.isAdmin = false;
            return null;
        }
    }

    async checkAdminStatus() {
        try {
            if (!this.currentUser || !window.Amplify?.Auth) return false;
            
            const session = await window.Amplify.Auth.currentSession();
            const groups = session.getAccessToken().payload['cognito:groups'] || [];
            this.isAdmin = groups.includes('Admin');
            return this.isAdmin;
        } catch (error) {
            console.error('Error checking admin status:', error);
            this.isAdmin = false;
            return false;
        }
    }

    getUsername() {
        return this.currentUser?.username || 'Guest User';
    }

    getUserEmail() {
        return this.currentUser?.attributes?.email || 'guest@example.com';
    }
}

// Global auth instance
const simpleAuth = new SimpleAuth();