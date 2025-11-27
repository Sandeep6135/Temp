// Admin Data Storage
let adminData = {
    users: JSON.parse(localStorage.getItem('chaosUsers') || '[]'),
    requests: JSON.parse(localStorage.getItem('chaosRequests') || '[]'),
    tasks: JSON.parse(localStorage.getItem('chaosTasks') || '[]'),
    uploads: JSON.parse(localStorage.getItem('chaosUploads') || '[]'),
    music: JSON.parse(localStorage.getItem('chaosMusic') || '[]')
};

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeEventListeners();
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

function logout() {
    try {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('currentUser');
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
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="role-badge ${user.role}">${user.role}</span></td>
            <td><span class="status-badge ${user.status}">${user.status}</span></td>
            <td>
                <button class="btn-edit" data-user-id="${user.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" data-user-id="${user.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
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

function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        adminData.users = adminData.users.filter(u => u.id !== id);
        localStorage.setItem('chaosUsers', JSON.stringify(adminData.users));
        loadUsers();
        loadDashboardStats();
    }
}

// Request Management
function loadRequests() {
    const tbody = document.querySelector('#requestsTable tbody');
    tbody.innerHTML = '';
    
    adminData.requests.forEach(request => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.id}</td>
            <td><span class="type-badge ${request.type}">${request.type}</span></td>
            <td>${request.user}</td>
            <td class="details-cell">${truncateText(request.details, 50)}</td>
            <td>${new Date(request.date).toLocaleDateString()}</td>
            <td><span class="status-badge ${request.status}">${request.status}</span></td>
            <td>
                <button class="btn-view" data-request-id="${request.id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-edit" data-request-id="${request.id}">
                    <i class="fas fa-check"></i>
                </button>
            </td>
        `;
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
        row.innerHTML = `
            <td>${task.id}</td>
            <td>${task.title}</td>
            <td>${task.assignee}</td>
            <td><span class="priority-badge ${task.priority}">${task.priority}</span></td>
            <td><span class="status-badge ${task.status}">${task.status}</span></td>
            <td>${task.dueDate}</td>
            <td>
                <button class="btn-edit" data-task-id="${task.id}">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn-delete" data-task-id="${task.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
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
        card.innerHTML = `
            <div class="track-image"></div>
            <h3>${track.title}</h3>
            <p>${track.genre} • ${track.year}</p>
            <div class="music-actions">
                <button class="btn-edit" data-track-id="${track.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" data-track-id="${track.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
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
        fileCard.innerHTML = `
            <div class="file-icon">
                <i class="fas fa-file"></i>
            </div>
            <div class="file-info">
                <h4>${upload.name}</h4>
                <p>${formatFileSize(upload.size)} • ${new Date(upload.date).toLocaleDateString()}</p>
            </div>
            <button class="btn-delete" data-upload-id="${upload.id}">
                <i class="fas fa-trash"></i>
            </button>
        `;
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
        userForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const userData = {
        id: userId ? parseInt(userId) : Date.now(),
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        role: document.getElementById('userRole').value,
        status: document.getElementById('userStatus').value
    };
    
    if (userId) {
        const index = adminData.users.findIndex(u => u.id === parseInt(userId));
        adminData.users[index] = userData;
    } else {
        adminData.users.push(userData);
    }
    
    localStorage.setItem('chaosUsers', JSON.stringify(adminData.users));
    loadUsers();
    loadDashboardStats();
    populateTaskAssignees();
            closeModal('userModal');
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