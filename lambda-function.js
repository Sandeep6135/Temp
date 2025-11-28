const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME || 'ChaosChambersData';
const ALLOWED_ORIGINS = ['*'];
// Input validation helper
function validateInput(data, requiredFields = []) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid input data');
    }
    
    for (const field of requiredFields) {
        if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
            throw new Error(`Missing or invalid required field: ${field}`);
        }
    }
}

// Sanitize input data
function sanitizeInput(data) {
    if (typeof data !== 'object' || data === null) return data;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            // Remove potentially dangerous characters
            sanitized[key] = value.replace(/[<>"'&]/g, '').trim().substring(0, 1000);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

exports.handler = async (event) => {
    const origin = event.headers?.origin || event.headers?.Origin;
    const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*');
    
    const headers = {
        'Access-Control-Allow-Origin': isAllowedOrigin ? origin : ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
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
    if (!body) {
        throw new Error('Request body is required');
    }
    
    let data;
    try {
        data = JSON.parse(body);
    } catch (error) {
        throw new Error('Invalid JSON in request body');
    }
    
    const sanitizedData = sanitizeInput(data);
    const timestamp = new Date().toISOString();
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    let item = {
        id,
        createdAt: timestamp,
        updatedAt: timestamp,
        status: 'pending'
    };

    if (path === '/requests') {
        validateInput(sanitizedData, ['type']);
        
        // Email validation if provided
        if (sanitizedData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(sanitizedData.email)) {
                throw new Error('Invalid email format');
            }
        }
        
        item = {
            ...item,
            type: sanitizedData.type,
            user: sanitizedData.user || sanitizedData.name || 'Anonymous',
            email: sanitizedData.email || 'noemail@example.com',
            details: sanitizedData.details || sanitizedData.message || '',
            dataType: 'request'
        };
    } else if (path === '/tasks') {
        validateInput(sanitizedData, ['title']);
        
        item = {
            ...item,
            title: sanitizedData.title,
            description: sanitizedData.description || '',
            assignee: sanitizedData.assignee || 'Unassigned',
            priority: ['low', 'medium', 'high'].includes(sanitizedData.priority) ? sanitizedData.priority : 'medium',
            dueDate: sanitizedData.dueDate || '',
            dataType: 'task'
        };
    } else if (path === '/users') {
        validateInput(sanitizedData, ['name', 'email']);
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitizedData.email)) {
            throw new Error('Invalid email format');
        }
        
        item = {
            ...item,
            name: sanitizedData.name,
            email: sanitizedData.email,
            role: ['user', 'producer', 'admin'].includes(sanitizedData.role) ? sanitizedData.role : 'user',
            status: ['active', 'inactive'].includes(sanitizedData.status) ? sanitizedData.status : 'active',
            dataType: 'user'
        };
    } else {
        throw new Error('Invalid endpoint');
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
    if (!body) {
        throw new Error('Request body is required');
    }
    
    let data;
    try {
        data = JSON.parse(body);
    } catch (error) {
        throw new Error('Invalid JSON in request body');
    }
    
    const sanitizedData = sanitizeInput(data);
    const pathParts = path.split('/');
    const id = pathParts[2];

    if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new Error('Valid ID required for update');
    }

    const updateExpression = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    // Build dynamic update expression with validation
    const allowedFields = ['type', 'user', 'email', 'details', 'title', 'description', 'assignee', 'priority', 'dueDate', 'name', 'role', 'status'];
    
    Object.keys(sanitizedData).forEach(key => {
        if (key !== 'id' && allowedFields.includes(key) && sanitizedData[key] !== undefined) {
            updateExpression.push(`#${key} = :${key}`);
            expressionAttributeNames[`#${key}`] = key;
            expressionAttributeValues[`:${key}`] = sanitizedData[key];
        }
    });
    
    if (updateExpression.length === 0) {
        throw new Error('No valid fields to update');
    }

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