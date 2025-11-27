# AWS Cognito Setup Instructions

## Prerequisites
1. AWS Account with appropriate permissions
2. AWS CLI installed and configured

## Step 1: Create Cognito User Pool

```bash
# Create User Pool
aws cognito-idp create-user-pool \
    --pool-name "ChaosChambersUserPool" \
    --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}" \
    --auto-verified-attributes email \
    --username-attributes email

# Note the UserPoolId from the response
```

## Step 2: Create User Pool Client

```bash
# Create App Client
aws cognito-idp create-user-pool-client \
    --user-pool-id YOUR_USER_POOL_ID \
    --client-name "ChaosChambersWebClient" \
    --no-generate-secret \
    --explicit-auth-flows ALLOW_USER_SRP_AUTH ALLOW_REFRESH_TOKEN_AUTH

# Note the ClientId from the response
```

## Step 3: Create Admin Group

```bash
# Create Admin Group
aws cognito-idp create-group \
    --group-name "Admin" \
    --user-pool-id YOUR_USER_POOL_ID \
    --description "Administrator group with full access"
```

## Step 4: Create Admin User

```bash
# Create admin user
aws cognito-idp admin-create-user \
    --user-pool-id YOUR_USER_POOL_ID \
    --username admin@chaoschamber.com \
    --user-attributes Name=email,Value=admin@chaoschamber.com Name=email_verified,Value=true \
    --temporary-password TempPass123! \
    --message-action SUPPRESS

# Add user to Admin group
aws cognito-idp admin-add-user-to-group \
    --user-pool-id YOUR_USER_POOL_ID \
    --username admin@chaoschamber.com \
    --group-name Admin
```

## Step 5: Update Configuration

1. Open `aws-config.js`
2. Replace the placeholder values:
   - `region`: Your AWS region (e.g., 'us-east-1')
   - `userPoolId`: The User Pool ID from Step 1
   - `userPoolWebClientId`: The Client ID from Step 2

## Step 6: Test the Setup

1. Open `index.html` in your browser
2. Click "Login" and use the admin credentials
3. For first login, you'll be prompted to set a permanent password
4. After login, the admin button should appear if the user is in the Admin group
5. Try accessing `admin.html` - it should only work for authenticated admin users

## Security Features Implemented

✅ **Secure Authentication**: Uses AWS Cognito instead of hardcoded credentials
✅ **Session Validation**: Validates JWT tokens server-side
✅ **Group-based Authorization**: Admin pages protected by Cognito groups
✅ **Token Management**: Automatic token refresh and secure storage
✅ **HTTPS Required**: All Cognito communication over HTTPS
✅ **No Client-side Secrets**: No sensitive data stored in localStorage

## Additional Security Recommendations

1. **Enable MFA**: Add multi-factor authentication for admin users
2. **Custom Domain**: Use a custom domain for Cognito hosted UI
3. **Rate Limiting**: Implement rate limiting on login attempts
4. **Audit Logging**: Enable CloudTrail for authentication events
5. **Regular Rotation**: Rotate any API keys or secrets regularly