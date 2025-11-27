// API Client for serverless backend
class ApiClient {
    constructor() {
        // TODO: Replace with your actual API Gateway URL
        this.baseUrl = 'https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/prod';
    }

    async makeRequest(endpoint, options = {}) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };

            // Add Cognito token if available
            if (cognitoAuth && cognitoAuth.currentUser) {
                const session = await Auth.currentSession();
                const token = session.getIdToken().getJwtToken();
                config.headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Requests
    async createRequest(requestData) {
        return this.makeRequest('/requests', {
            method: 'POST',
            body: JSON.stringify(requestData)
        });
    }

    async getRequests() {
        return this.makeRequest('/requests');
    }

    async updateRequest(id, data) {
        return this.makeRequest(`/requests/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteRequest(id) {
        return this.makeRequest(`/requests/${id}`, {
            method: 'DELETE'
        });
    }

    // Tasks
    async createTask(taskData) {
        return this.makeRequest('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
    }

    async getTasks() {
        return this.makeRequest('/tasks');
    }

    async updateTask(id, data) {
        return this.makeRequest(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteTask(id) {
        return this.makeRequest(`/tasks/${id}`, {
            method: 'DELETE'
        });
    }

    // Users
    async createUser(userData) {
        return this.makeRequest('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async getUsers() {
        return this.makeRequest('/users');
    }

    async updateUser(id, data) {
        return this.makeRequest(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteUser(id) {
        return this.makeRequest(`/users/${id}`, {
            method: 'DELETE'
        });
    }
}

// Global API client instance
const apiClient = new ApiClient();