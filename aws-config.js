const awsConfig = {
    Auth: {
        region: 'us-west-1', 
        userPoolId: 'us-west-1_LzVexyAYn',
        userPoolWebClientId: '5rsf2v5fh45kjunhfmon4eav6g',
        mandatorySignIn: false,
        authenticationFlowType: 'USER_SRP_AUTH'
    }
};

window.awsConfig = awsConfig;

if (typeof Amplify !== 'undefined' && Amplify.configure) {
    Amplify.configure(awsConfig);
} else {
    window.Auth = Amplify?.Auth;
}