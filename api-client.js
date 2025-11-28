// API Client for serverless backend
class ApiClient {
    constructor() {
        // UPDATED WITH YOUR NEW URL:
        this.baseUrl = 'https://z2ait3lbw4.execute-api.us-west-1.amazonaws.com/prod';
        this.timeout = 30000;
    }
    // ... rest of the code ...
}

    validateInput(data, requiredFields = []) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid input data');
        }
        for (const field of requiredFields) {
            if (!data[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
    }

    sanitizeData(data) {
        if (typeof data !== 'object' || data === null) return data;
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            sanitized[key] = typeof value === 'string' ? value.trim() : value;
        }
        return sanitized;
    }

    async makeRequest(endpoint, options = {}) {
        try {
            if (!endpoint || typeof endpoint !== 'string') {
                throw new Error('Invalid endpoint');
            }

            const sanitizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
            const url = `${this.baseUrl}${sanitizedEndpoint}`;

            try {
                new URL(url);
            } catch {
                throw new Error('Invalid URL constructed');
            }

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                signal: AbortSignal.timeout(this.timeout),
                ...options
            };

            try {
                if (window.simpleAuth?.currentUser && window.Amplify?.Auth) {
                    const session = await window.Amplify.Auth.currentSession();
                    const token = session.getIdToken().getJwtToken();
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
            } catch (authError) {
                console.warn('Failed to add auth token:', authError.message);
            }

            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error');
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Requests
    async createRequest(requestData) {
        this.validateInput(requestData, ['type']);
        const sanitizedData = this.sanitizeData(requestData);
        return this.makeRequest('/requests', {
            method: 'POST',
            body: JSON.stringify(sanitizedData)
        });
    }

    async getRequests() {
        return this.makeRequest('/requests');
    }

    async updateRequest(id, data) {
        if (!id) throw new Error('Request ID is required');
        this.validateInput(data);
        const sanitizedData = this.sanitizeData(data);
        return this.makeRequest(`/requests/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: JSON.stringify(sanitizedData)
        });
    }

    async deleteRequest(id) {
        if (!id) throw new Error('Request ID is required');
        return this.makeRequest(`/requests/${encodeURIComponent(id)}`, {
            method: 'DELETE'
        });
    }

    // Tasks
    async createTask(taskData) {
        this.validateInput(taskData, ['title']);
        const sanitizedData = this.sanitizeData(taskData);
        return this.makeRequest('/tasks', {
            method: 'POST',
            body: JSON.stringify(sanitizedData)
        });
    }

    async getTasks() {
        return this.makeRequest('/tasks');
    }

    async updateTask(id, data) {
        if (!id) throw new Error('Task ID is required');
        this.validateInput(data);
        const sanitizedData = this.sanitizeData(data);
        return this.makeRequest(`/tasks/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: JSON.stringify(sanitizedData)
        });
    }

    async deleteTask(id) {
        if (!id) throw new Error('Task ID is required');
        return this.makeRequest(`/tasks/${encodeURIComponent(id)}`, {
            method: 'DELETE'
        });
    }

    // Users
    async createUser(userData) {
        this.validateInput(userData, ['name', 'email']);
        const sanitizedData = this.sanitizeData(userData);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitizedData.email)) {
            throw new Error('Invalid email format');
        }
        return this.makeRequest('/users', {
            method: 'POST',
            body: JSON.stringify(sanitizedData)
        });
    }

    async getUsers() {
        return this.makeRequest('/users');
    }

    async updateUser(id, data) {
        if (!id) throw new Error('User ID is required');
        this.validateInput(data);
        const sanitizedData = this.sanitizeData(data);
        if (sanitizedData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(sanitizedData.email)) {
                throw new Error('Invalid email format');
            }
        }
        return this.makeRequest(`/users/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: JSON.stringify(sanitizedData)
        });
    }

    async deleteUser(id) {
        if (!id) throw new Error('User ID is required');
        return this.makeRequest(`/users/${encodeURIComponent(id)}`, {
            method: 'DELETE'
        });
    }
}

// Global API client instance
const apiClient = new ApiClient();