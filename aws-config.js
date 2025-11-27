// AWS Amplify Configuration
const awsConfig = {
    Auth: {
        region: 'us-west-1',
        userPoolId: 'us-west-1_LzVexyAYn',
        userPoolWebClientId: '5rsf2v5fh45kjunhfmon4eav6g',
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