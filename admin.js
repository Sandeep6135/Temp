// Admin Data Storage - now fetched from API
let adminData = {
    users: [],
    requests: [],
    tasks: [],
    uploads: [], // Still using localStorage for file uploads
    music: [] // Still using localStorage for music
};

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', async function() {
    try {
        initializeEventListeners();
        await loadAllData();
        loadDashboardStats();
        loadUsers();
        loadRequests();
        loadTasks();
        loadMusic();
        loadUploads();
        populateTaskAssignees();
    } catch (error) {
        console.error('Error initializing admin dashboard:', error);
    }
});

// Load all data from API
async function loadAllData() {
    try {
        const [users, requests, tasks] = await Promise.all([
            apiClient.getUsers(),
            apiClient.getRequests(),
            apiClient.getTasks()
        ]);
        
        adminData.users = users;
        adminData.requests = requests;
        adminData.tasks = tasks;
        
        // Still load from localStorage for uploads and music
        adminData.uploads = JSON.parse(localStorage.getItem('chaosUploads') || '[]');
        adminData.music = JSON.parse(localStorage.getItem('chaosMusic') || '[]');
    } catch (error) {
        console.error('Error loading data from API:', error);
        // Fallback to localStorage if API fails
        adminData.users = JSON.parse(localStorage.getItem('chaosUsers') || '[]');
        adminData.requests = JSON.parse(localStorage.getItem('chaosRequests') || '[]');
        adminData.tasks = JSON.parse(localStorage.getItem('chaosTasks') || '[]');
        adminData.uploads = JSON.parse(localStorage.getItem('chaosUploads') || '[]');
        adminData.music = JSON.parse(localStorage.getItem('chaosMusic') || '[]');
    }
}

// Initialize event listeners
function initializeEventListeners() {
    try {
        // Navigation buttons
        const homeBtn = document.getElementById('homeBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (homeBtn) homeBtn.addEventListener('click', goHome);
        if (logoutBtn) logoutBtn.addEventListener('click', logout);
        
        // Sidebar navigation
        const sidebarBtns = document.querySelectorAll('.sidebar-btn');
        sidebarBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const section = this.getAttribute('data-section');
                if (section) showSection(section, this);
            });
        });
        
        // Action buttons
        const addUserBtn = document.getElementById('addUserBtn');
        const uploadMusicBtn = document.getElementById('uploadMusicBtn');
        const createTaskBtn = document.getElementById('createTaskBtn');
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');
        const requestFilter = document.getElementById('requestFilter');
        
        if (addUserBtn) addUserBtn.addEventListener('click', addUser);
        if (uploadMusicBtn) uploadMusicBtn.addEventListener('click', uploadMusic);
        if (createTaskBtn) createTaskBtn.addEventListener('click', createTask);
        if (requestFilter) requestFilter.addEventListener('change', filterRequests);
        
        if (uploadZone) {
            uploadZone.addEventListener('click', () => fileInput?.click());
            uploadZone.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInput?.click();
                }
            });
        }
        
        if (fileInput) fileInput.addEventListener('change', handleFileUpload);
        
        // Modal close buttons
        const closeUserModal = document.getElementById('closeUserModal');
        const closeTaskModal = document.getElementById('closeTaskModal');
        
        if (closeUserModal) closeUserModal.addEventListener('click', () => closeModal('userModal'));
        if (closeTaskModal) closeTaskModal.addEventListener('click', () => closeModal('taskModal'));
        
        // Add event delegation for dynamic buttons
        document.addEventListener('click', function(e) {
            // User management buttons
            if (e.target.closest('.btn-edit[data-user-id]')) {
                const id = parseInt(e.target.closest('.btn-edit[data-user-id]').getAttribute('data-user-id'));
                editUser(id);
            }
            if (e.target.closest('.btn-delete[data-user-id]')) {
                const id = parseInt(e.target.closest('.btn-delete[data-user-id]').getAttribute('data-user-id'));
                deleteUser(id);
            }
            
            // Request management buttons
            if (e.target.closest('.btn-view[data-request-id]')) {
                const id = parseInt(e.target.closest('.btn-view[data-request-id]').getAttribute('data-request-id'));
                viewRequest(id);
            }
            if (e.target.closest('.btn-edit[data-request-id]')) {
                const id = parseInt(e.target.closest('.btn-edit[data-request-id]').getAttribute('data-request-id'));
                updateRequestStatus(id);
            }
            
            // Task management buttons
            if (e.target.closest('.btn-edit[data-task-id]')) {
                const id = parseInt(e.target.closest('.btn-edit[data-task-id]').getAttribute('data-task-id'));
                updateTaskStatus(id);
            }
            if (e.target.closest('.btn-delete[data-task-id]')) {
                const id = parseInt(e.target.closest('.btn-delete[data-task-id]').getAttribute('data-task-id'));
                deleteTask(id);
            }
            
            // Music management buttons
            if (e.target.closest('.btn-delete[data-track-id]')) {
                const id = parseInt(e.target.closest('.btn-delete[data-track-id]').getAttribute('data-track-id'));
                deleteTrack(id);
            }
            
            // Upload management buttons
            if (e.target.closest('.btn-delete[data-upload-id]')) {
                const id = e.target.closest('.btn-delete[data-upload-id]').getAttribute('data-upload-id');
                deleteUpload(id);
            }
        });
        
    } catch (error) {
        console.error('Error initializing event listeners:', error);
    }
}

// Navigation functions
function goHome() {
    try {
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error navigating to home:', error);
    }
}

async function logout() {
    try {
        await cognitoAuth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error during logout:', error);
        // Fallback navigation
        window.location.href = 'index.html';
    }
}

// Section navigation
function showSection(sectionId, targetBtn) {
    try {
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.sidebar-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('active');
        }
        
        if (targetBtn) {
            targetBtn.classList.add('active');
        }
    } catch (error) {
        console.error('Error showing section:', error);
    }
}

// Dashboard stats
function loadDashboardStats() {
    try {
        const totalUsersEl = document.getElementById('totalUsers');
        const totalRequestsEl = document.getElementById('totalRequests');
        const pendingTasksEl = document.getElementById('pendingTasks');
        
        if (totalUsersEl) totalUsersEl.textContent = adminData.users.length;
        if (totalRequestsEl) totalRequestsEl.textContent = adminData.requests.length;
        if (pendingTasksEl) pendingTasksEl.textContent = adminData.tasks.filter(t => t.status === 'pending').length;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// User Management
function loadUsers() {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '';
    
    adminData.users.forEach(user => {
        const row = document.createElement('tr');
        
        // ID cell
        const idCell = document.createElement('td');
        idCell.textContent = user.id;
        row.appendChild(idCell);
        
        // Name cell
        const nameCell = document.createElement('td');
        nameCell.textContent = user.name;
        row.appendChild(nameCell);
        
        // Email cell
        const emailCell = document.createElement('td');
        emailCell.textContent = user.email;
        row.appendChild(emailCell);
        
        // Role cell
        const roleCell = document.createElement('td');
        const roleBadge = document.createElement('span');
        roleBadge.className = `role-badge ${user.role}`;
        roleBadge.textContent = user.role;
        roleCell.appendChild(roleBadge);
        row.appendChild(roleCell);
        
        // Status cell
        const statusCell = document.createElement('td');
        const statusBadge = document.createElement('span');
        statusBadge.className = `status-badge ${user.status}`;
        statusBadge.textContent = user.status;
        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);
        
        // Actions cell
        const actionsCell = document.createElement('td');
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-edit';
        editBtn.setAttribute('data-user-id', user.id);
        const editIcon = document.createElement('i');
        editIcon.className = 'fas fa-edit';
        editBtn.appendChild(editIcon);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.setAttribute('data-user-id', user.id);
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'fas fa-trash';
        deleteBtn.appendChild(deleteIcon);
        
        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
        row.appendChild(actionsCell);
        
        tbody.appendChild(row);
    });
}

function addUser() {
    try {
        const modal = document.getElementById('userModal');
        const titleEl = document.getElementById('userModalTitle');
        const formEl = document.getElementById('userForm');
        const userIdEl = document.getElementById('userId');
        
        if (titleEl) titleEl.textContent = 'Add User';
        if (formEl) formEl.reset();
        if (userIdEl) userIdEl.value = '';
        
        if (modal) {
            modal.style.display = 'block';
            modal.setAttribute('aria-hidden', 'false');
            // Focus first input
            const firstInput = modal.querySelector('input[type="text"]');
            if (firstInput) firstInput.focus();
        }
    } catch (error) {
        console.error('Error adding user:', error);
    }
}

function editUser(id) {
    try {
        const user = adminData.users.find(u => u.id === id);
        if (user) {
            const modal = document.getElementById('userModal');
            const titleEl = document.getElementById('userModalTitle');
            const userIdEl = document.getElementById('userId');
            const userNameEl = document.getElementById('userName');
            const userEmailEl = document.getElementById('userEmail');
            const userRoleEl = document.getElementById('userRole');
            const userStatusEl = document.getElementById('userStatus');
            
            if (titleEl) titleEl.textContent = 'Edit User';
            if (userIdEl) userIdEl.value = user.id;
            if (userNameEl) userNameEl.value = user.name;
            if (userEmailEl) userEmailEl.value = user.email;
            if (userRoleEl) userRoleEl.value = user.role;
            if (userStatusEl) userStatusEl.value = user.status;
            
            if (modal) {
                modal.style.display = 'block';
                modal.setAttribute('aria-hidden', 'false');
            }
        }
    } catch (error) {
        console.error('Error editing user:', error);
    }
}

async function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            await apiClient.deleteUser(id);
            adminData.users = adminData.users.filter(u => u.id !== id);
            loadUsers();
            loadDashboardStats();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user. Please try again.');
        }
    }
}

// Request Management
function loadRequests() {
    const tbody = document.querySelector('#requestsTable tbody');
    tbody.innerHTML = '';
    
    adminData.requests.forEach(request => {
        const row = document.createElement('tr');
        
        // ID cell
        const idCell = document.createElement('td');
        idCell.textContent = request.id;
        row.appendChild(idCell);
        
        // Type cell
        const typeCell = document.createElement('td');
        const typeBadge = document.createElement('span');
        typeBadge.className = `type-badge ${request.type}`;
        typeBadge.textContent = request.type;
        typeCell.appendChild(typeBadge);
        row.appendChild(typeCell);
        
        // User cell
        const userCell = document.createElement('td');
        userCell.textContent = request.user;
        row.appendChild(userCell);
        
        // Details cell
        const detailsCell = document.createElement('td');
        detailsCell.className = 'details-cell';
        detailsCell.textContent = truncateText(request.details, 50);
        row.appendChild(detailsCell);
        
        // Date cell
        const dateCell = document.createElement('td');
        dateCell.textContent = new Date(request.date || request.createdAt).toLocaleDateString();
        row.appendChild(dateCell);
        
        // Status cell
        const statusCell = document.createElement('td');
        const statusBadge = document.createElement('span');
        statusBadge.className = `status-badge ${request.status}`;
        statusBadge.textContent = request.status;
        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);
        
        // Actions cell
        const actionsCell = document.createElement('td');
        
        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn-view';
        viewBtn.setAttribute('data-request-id', request.id);
        const viewIcon = document.createElement('i');
        viewIcon.className = 'fas fa-eye';
        viewBtn.appendChild(viewIcon);
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-edit';
        editBtn.setAttribute('data-request-id', request.id);
        const editIcon = document.createElement('i');
        editIcon.className = 'fas fa-check';
        editBtn.appendChild(editIcon);
        
        actionsCell.appendChild(viewBtn);
        actionsCell.appendChild(editBtn);
        row.appendChild(actionsCell);
        
        tbody.appendChild(row);
    });
}

function filterRequests() {
    const filter = document.getElementById('requestFilter').value;
    const rows = document.querySelectorAll('#requestsTable tbody tr');
    
    rows.forEach(row => {
        const type = row.querySelector('.type-badge').textContent;
        if (filter === 'all' || type === filter) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function viewRequest(id) {
    const request = adminData.requests.find(r => r.id === id);
    if (request) {
        alert(`Request Details:\n\nType: ${request.type}\nUser: ${request.user}\nEmail: ${request.email}\nDetails: ${request.details}\nDate: ${new Date(request.date).toLocaleString()}`);
    }
}

function updateRequestStatus(id) {
    const request = adminData.requests.find(r => r.id === id);
    if (request) {
        request.status = request.status === 'pending' ? 'completed' : 'pending';
        localStorage.setItem('chaosRequests', JSON.stringify(adminData.requests));
        loadRequests();
    }
}

// Task Management
function loadTasks() {
    const tbody = document.querySelector('#tasksTable tbody');
    tbody.innerHTML = '';
    
    adminData.tasks.forEach(task => {
        const row = document.createElement('tr');
        
        // ID cell
        const idCell = document.createElement('td');
        idCell.textContent = task.id;
        row.appendChild(idCell);
        
        // Title cell
        const titleCell = document.createElement('td');
        titleCell.textContent = task.title;
        row.appendChild(titleCell);
        
        // Assignee cell
        const assigneeCell = document.createElement('td');
        assigneeCell.textContent = task.assignee;
        row.appendChild(assigneeCell);
        
        // Priority cell
        const priorityCell = document.createElement('td');
        const priorityBadge = document.createElement('span');
        priorityBadge.className = `priority-badge ${task.priority}`;
        priorityBadge.textContent = task.priority;
        priorityCell.appendChild(priorityBadge);
        row.appendChild(priorityCell);
        
        // Status cell
        const statusCell = document.createElement('td');
        const statusBadge = document.createElement('span');
        statusBadge.className = `status-badge ${task.status}`;
        statusBadge.textContent = task.status;
        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);
        
        // Due date cell
        const dueDateCell = document.createElement('td');
        dueDateCell.textContent = task.dueDate;
        row.appendChild(dueDateCell);
        
        // Actions cell
        const actionsCell = document.createElement('td');
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-edit';
        editBtn.setAttribute('data-task-id', task.id);
        const editIcon = document.createElement('i');
        editIcon.className = 'fas fa-check';
        editBtn.appendChild(editIcon);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.setAttribute('data-task-id', task.id);
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'fas fa-trash';
        deleteBtn.appendChild(deleteIcon);
        
        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
        row.appendChild(actionsCell);
        
        tbody.appendChild(row);
    });
}

function createTask() {
    try {
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.style.display = 'block';
            modal.setAttribute('aria-hidden', 'false');
            // Focus first input
            const firstInput = modal.querySelector('input');
            if (firstInput) firstInput.focus();
        }
    } catch (error) {
        console.error('Error creating task:', error);
    }
}

function populateTaskAssignees() {
    const select = document.getElementById('taskAssignee');
    select.innerHTML = '<option value="">Assign To</option>';
    
    adminData.users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.name;
        option.textContent = `${user.name} (${user.role})`;
        select.appendChild(option);
    });
}

function updateTaskStatus(id) {
    const task = adminData.tasks.find(t => t.id === id);
    if (task) {
        const statuses = ['pending', 'in-progress', 'completed'];
        const currentIndex = statuses.indexOf(task.status);
        task.status = statuses[(currentIndex + 1) % statuses.length];
        localStorage.setItem('chaosTasks', JSON.stringify(adminData.tasks));
        loadTasks();
        loadDashboardStats();
    }
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        adminData.tasks = adminData.tasks.filter(t => t.id !== id);
        localStorage.setItem('chaosTasks', JSON.stringify(adminData.tasks));
        loadTasks();
        loadDashboardStats();
    }
}

// Music Management
function loadMusic() {
    const grid = document.getElementById('musicGrid');
    grid.innerHTML = '';
    
    // Default tracks
    const defaultTracks = [
        { id: 1, title: 'Neon Dreams', genre: 'Electronic', year: '2024' },
        { id: 2, title: 'Digital Chaos', genre: 'Synthwave', year: '2024' },
        { id: 3, title: 'Future Bass', genre: 'EDM', year: '2024' }
    ];
    
    const allTracks = [...defaultTracks, ...adminData.music];
    
    allTracks.forEach(track => {
        const card = document.createElement('div');
        card.className = 'music-admin-card';
        
        // Track image
        const trackImage = document.createElement('div');
        trackImage.className = 'track-image';
        card.appendChild(trackImage);
        
        // Title
        const title = document.createElement('h3');
        title.textContent = track.title;
        card.appendChild(title);
        
        // Genre and year
        const info = document.createElement('p');
        info.textContent = `${track.genre} • ${track.year}`;
        card.appendChild(info);
        
        // Actions
        const actions = document.createElement('div');
        actions.className = 'music-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn-edit';
        editBtn.setAttribute('data-track-id', track.id);
        const editIcon = document.createElement('i');
        editIcon.className = 'fas fa-edit';
        editBtn.appendChild(editIcon);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.setAttribute('data-track-id', track.id);
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'fas fa-trash';
        deleteBtn.appendChild(deleteIcon);
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        card.appendChild(actions);
        
        grid.appendChild(card);
    });
}

function uploadMusic() {
    try {
        const title = prompt('Enter track title:');
        if (!title || title.trim() === '') return;
        
        const genre = prompt('Enter genre:');
        if (!genre || genre.trim() === '') return;
        
        const newTrack = {
            id: Date.now(),
            title: title.trim(),
            genre: genre.trim(),
            year: new Date().getFullYear().toString()
        };
        
        adminData.music.push(newTrack);
        localStorage.setItem('chaosMusic', JSON.stringify(adminData.music));
        loadMusic();
        loadDashboardStats();
    } catch (error) {
        console.error('Error uploading music:', error);
        alert('Error uploading music. Please try again.');
    }
}

function deleteTrack(id) {
    if (confirm('Are you sure you want to delete this track?')) {
        adminData.music = adminData.music.filter(t => t.id !== id);
        localStorage.setItem('chaosMusic', JSON.stringify(adminData.music));
        loadMusic();
    }
}

// File Upload Management
function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
        const upload = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            date: new Date().toISOString()
        };
        adminData.uploads.push(upload);
    });
    
    localStorage.setItem('chaosUploads', JSON.stringify(adminData.uploads));
    loadUploads();
}

function loadUploads() {
    const container = document.getElementById('uploadedFiles');
    container.innerHTML = '';
    
    adminData.uploads.forEach(upload => {
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';
        
        // File icon
        const fileIcon = document.createElement('div');
        fileIcon.className = 'file-icon';
        const icon = document.createElement('i');
        icon.className = 'fas fa-file';
        fileIcon.appendChild(icon);
        fileCard.appendChild(fileIcon);
        
        // File info
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        
        const fileName = document.createElement('h4');
        fileName.textContent = upload.name;
        fileInfo.appendChild(fileName);
        
        const fileDetails = document.createElement('p');
        fileDetails.textContent = `${formatFileSize(upload.size)} • ${new Date(upload.date).toLocaleDateString()}`;
        fileInfo.appendChild(fileDetails);
        
        fileCard.appendChild(fileInfo);
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.setAttribute('data-upload-id', upload.id);
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'fas fa-trash';
        deleteBtn.appendChild(deleteIcon);
        fileCard.appendChild(deleteBtn);
        
        container.appendChild(fileCard);
    });
}

function deleteUpload(id) {
    adminData.uploads = adminData.uploads.filter(u => u.id !== id);
    localStorage.setItem('chaosUploads', JSON.stringify(adminData.uploads));
    loadUploads();
}

// Form handlers
document.addEventListener('DOMContentLoaded', function() {
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const userId = document.getElementById('userId').value;
            const userData = {
                id: userId ? parseInt(userId) : Date.now(),
                name: document.getElementById('userName').value,
                email: document.getElementById('userEmail').value,
                role: document.getElementById('userRole').value,
                status: document.getElementById('userStatus').value
            };
            
            try {
                if (userId) {
                    await apiClient.updateUser(userId, userData);
                    const index = adminData.users.findIndex(u => u.id === parseInt(userId));
                    adminData.users[index] = userData;
                } else {
                    const result = await apiClient.createUser(userData);
                    userData.id = result.id;
                    adminData.users.push(userData);
                }
                
                loadUsers();
                loadDashboardStats();
                populateTaskAssignees();
                closeModal('userModal');
            } catch (error) {
                console.error('Error saving user:', error);
                alert('Error saving user. Please try again.');
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const taskData = {
        id: Date.now(),
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        assignee: document.getElementById('taskAssignee').value,
        priority: document.getElementById('taskPriority').value,
        status: 'pending',
        dueDate: document.getElementById('taskDueDate').value
    };
    
    adminData.tasks.push(taskData);
    localStorage.setItem('chaosTasks', JSON.stringify(adminData.tasks));
    loadTasks();
    loadDashboardStats();
    closeModal('taskModal');
            this.reset();
        });
    }
});

// Utility functions
function closeModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    } catch (error) {
        console.error('Error closing modal:', error);
    }
}

function truncateText(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Close modals when clicking outside
function handleModalClick(event) {
    try {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
                modal.setAttribute('aria-hidden', 'true');
            }
        });
    } catch (error) {
        console.error('Error handling modal click:', error);
    }
}

window.addEventListener('click', handleModalClick);