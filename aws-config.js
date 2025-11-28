const awsConfig = {
    Auth: {
        region: 'us-east-1',
        userPoolId: '',
        userPoolWebClientId: '',
        mandatorySignIn: false,
        authenticationFlowType: 'USER_SRP_AUTH'
    }
};
window.awsConfig = awsConfig;
if (typeof Amplify !== 'undefined' && Amplify.configure) { Amplify.configure(awsConfig); } 
else { window.Auth = Amplify?.Auth; }
