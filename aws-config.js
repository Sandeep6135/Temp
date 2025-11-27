// AWS Amplify Configuration
const awsConfig = {
    Auth: {
        region: 'eu-north-1',
        userPoolId: 'eu-north-1_kdsgHk0cI',
        userPoolWebClientId: '5lnhh5rqepl5uvq41akuvdhil3',
        mandatorySignIn: false,
        authenticationFlowType: 'USER_SRP_AUTH'
    }
};

// Ensure Auth is available globally
window.awsConfig = awsConfig;

// Configure Amplify
if (typeof Amplify !== 'undefined' && Amplify.configure) {
    Amplify.configure(awsConfig);
    console.log('AWS Amplify configured successfully');
} else {
    console.error('AWS Amplify not loaded properly');
    // Fallback - set global Auth reference
    window.Auth = Amplify?.Auth;
}