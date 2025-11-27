# Serverless Backend Deployment Guide

## Step 1: Create DynamoDB Table

```bash
aws dynamodb create-table \
    --table-name ChaosChambersData \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
    --key-schema \
        AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --tags Key=Project,Value=ChaosChambersApp
```

## Step 2: Create IAM Role for Lambda

```bash
# Create trust policy file
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create IAM role
aws iam create-role \
    --role-name ChaosChambersLambdaRole \
    --assume-role-policy-document file://trust-policy.json

# Attach permissions policy
aws iam put-role-policy \
    --role-name ChaosChambersLambdaRole \
    --policy-name ChaosChambersPolicy \
    --policy-document file://iam-role.json
```

## Step 3: Deploy Lambda Function

```bash
# Create deployment package
zip -r lambda-function.zip lambda-function.js

# Create Lambda function
aws lambda create-function \
    --function-name ChaosChambersAPI \
    --runtime nodejs18.x \
    --role arn:aws:iam::YOUR_ACCOUNT_ID:role/ChaosChambersLambdaRole \
    --handler lambda-function.handler \
    --zip-file fileb://lambda-function.zip \
    --timeout 30 \
    --memory-size 256
```

## Step 4: Create API Gateway

```bash
# Create REST API
aws apigateway create-rest-api \
    --name ChaosChambersAPI \
    --description "API for Chaos Chambers application"

# Note the API ID from the response
export API_ID=your-api-id

# Get root resource ID
aws apigateway get-resources --rest-api-id $API_ID

# Create resources and methods (simplified - use AWS Console for full setup)
```

## Step 5: Configure API Gateway (Use AWS Console)

1. **Create Resources:**
   - `/requests` (GET, POST)
   - `/requests/{id}` (GET, PUT, DELETE)
   - `/tasks` (GET, POST)
   - `/tasks/{id}` (GET, PUT, DELETE)
   - `/users` (GET, POST)
   - `/users/{id}` (GET, PUT, DELETE)

2. **Enable CORS** for all resources

3. **Deploy API** to a stage (e.g., 'prod')

## Step 6: Update Configuration

1. **Update `api-client.js`:**
   ```javascript
   this.baseUrl = 'https://your-api-id.execute-api.region.amazonaws.com/prod';
   ```

2. **Test the API endpoints:**
   ```bash
   curl -X GET https://your-api-id.execute-api.region.amazonaws.com/prod/requests
   ```

## Architecture Overview

```
Frontend (HTML/JS) 
    ↓
API Gateway 
    ↓
Lambda Function 
    ↓
DynamoDB Table
```

## Data Structure in DynamoDB

```json
{
  "id": "1234567890",
  "dataType": "request|task|user",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "status": "pending|completed|active",
  // Additional fields based on dataType
}
```

## Security Features

✅ **Authentication**: Cognito JWT tokens required
✅ **Authorization**: Group-based access control
✅ **CORS**: Properly configured for frontend domain
✅ **Input Validation**: Server-side validation in Lambda
✅ **Error Handling**: Proper error responses
✅ **Logging**: CloudWatch logs for monitoring

## Cost Optimization

- **DynamoDB**: Pay-per-request billing
- **Lambda**: Pay-per-invocation
- **API Gateway**: Pay-per-request
- **Estimated monthly cost**: $5-20 for moderate usage

## Monitoring & Maintenance

1. **CloudWatch Logs**: Monitor Lambda execution
2. **CloudWatch Metrics**: Track API performance
3. **DynamoDB Metrics**: Monitor read/write capacity
4. **Error Alerts**: Set up CloudWatch alarms