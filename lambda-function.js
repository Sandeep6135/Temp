const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = 'ChaosChambersData';

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    };

    try {
        const { httpMethod, path, body } = event;

        // Handle CORS preflight
        if (httpMethod === 'OPTIONS') {
            return { statusCode: 200, headers };
        }

        switch (httpMethod) {
            case 'POST':
                return await handlePost(path, body, headers);
            case 'GET':
                return await handleGet(path, headers);
            case 'PUT':
                return await handlePut(path, body, headers);
            case 'DELETE':
                return await handleDelete(path, headers);
            default:
                return {
                    statusCode: 405,
                    headers,
                    body: JSON.stringify({ error: 'Method not allowed' })
                };
        }
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

// Handle POST requests
async function handlePost(path, body, headers) {
    const data = JSON.parse(body);
    const timestamp = new Date().toISOString();
    const id = Date.now().toString();

    let item = {
        id,
        createdAt: timestamp,
        updatedAt: timestamp,
        status: 'pending'
    };

    if (path === '/requests') {
        item = {
            ...item,
            type: data.type || 'contact',
            user: data.user || data.name,
            email: data.email,
            details: data.details || data.message,
            dataType: 'request'
        };
    } else if (path === '/tasks') {
        item = {
            ...item,
            title: data.title,
            description: data.description,
            assignee: data.assignee,
            priority: data.priority || 'medium',
            dueDate: data.dueDate,
            dataType: 'task'
        };
    } else if (path === '/users') {
        item = {
            ...item,
            name: data.name,
            email: data.email,
            role: data.role,
            status: data.status || 'active',
            dataType: 'user'
        };
    }

    await dynamodb.put({
        TableName: TABLE_NAME,
        Item: item
    }).promise();

    return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, id, item })
    };
}

// Handle GET requests
async function handleGet(path, headers) {
    const pathParts = path.split('/');
    const resource = pathParts[1];
    const id = pathParts[2];

    if (id) {
        // Get single item
        const result = await dynamodb.get({
            TableName: TABLE_NAME,
            Key: { id }
        }).promise();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result.Item || {})
        };
    } else {
        // Get all items of type
        const dataType = resource.slice(0, -1); // Remove 's' from plural
        const result = await dynamodb.scan({
            TableName: TABLE_NAME,
            FilterExpression: 'dataType = :type',
            ExpressionAttributeValues: {
                ':type': dataType
            }
        }).promise();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result.Items || [])
        };
    }
}

// Handle PUT requests
async function handlePut(path, body, headers) {
    const data = JSON.parse(body);
    const pathParts = path.split('/');
    const id = pathParts[2];

    if (!id) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID required for update' })
        };
    }

    const updateExpression = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    // Build dynamic update expression
    Object.keys(data).forEach(key => {
        if (key !== 'id') {
            updateExpression.push(`#${key} = :${key}`);
            expressionAttributeNames[`#${key}`] = key;
            expressionAttributeValues[`:${key}`] = data[key];
        }
    });

    expressionAttributeValues[':updatedAt'] = new Date().toISOString();
    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';

    await dynamodb.update({
        TableName: TABLE_NAME,
        Key: { id },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
    }).promise();

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, id })
    };
}

// Handle DELETE requests
async function handleDelete(path, headers) {
    const pathParts = path.split('/');
    const id = pathParts[2];

    if (!id) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID required for delete' })
        };
    }

    await dynamodb.delete({
        TableName: TABLE_NAME,
        Key: { id }
    }).promise();

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, id })
    };
}