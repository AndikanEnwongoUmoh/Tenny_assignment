// Global variables
let currentUser = null;
let activities = [];

// Authentication functions
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.querySelectorAll('.tab-btn')[1].classList.remove('active');
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.querySelectorAll('.tab-btn')[0].classList.remove('active');
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
}

// Login form handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    currentUser = result;
                    window.location.href = 'dashboard.html';
                } else {
                    alert(result.error || 'Login failed');
                }
            } catch (error) {
                alert('Network error. Please try again.');
            }
        });
    }
    
    // Register form handler
    const registerForm = document.getElementById('registerFormElement');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    alert('Registration successful! Please log in.');
                    showLogin();
                    registerForm.reset();
                } else {
                    alert(result.error || 'Registration failed');
                }
            } catch (error) {
                alert('Network error. Please try again.');
            }
        });
    }
    
    // Profile form handler
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await fetch('/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    alert('Profile updated successfully!');
                } else {
                    alert(result.error || 'Profile update failed');
                }
            } catch (error) {
                alert('Network error. Please try again.');
            }
        });
    }
    
    // Add activity form handler
    const addActivityForm = document.getElementById('addActivityForm');
    if (addActivityForm) {
        addActivityForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            try {
                const response = await fetch('/activities', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    alert('Activity added successfully!');
                    closeAddActivityModal();
                    loadActivities();
                    addActivityForm.reset();
                } else {
                    alert(result.error || 'Failed to add activity');
                }
            } catch (error) {
                alert('Network error. Please try again.');
            }
        });
    }
    
    // Edit activity form handler
    const editActivityForm = document.getElementById('editActivityForm');
    if (editActivityForm) {
        editActivityForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            const activityId = document.getElementById('editActivityId').value;
            
            try {
                const response = await fetch(`/activities/${activityId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    alert('Activity updated successfully!');
                    closeEditActivityModal();
                    loadActivities();
                } else {
                    alert(result.error || 'Failed to update activity');
                }
            } catch (error) {
                alert('Network error. Please try again.');
            }
        });
    }
    
    // Ensure Add Activity button opens the modal
    const addActivityBtn = document.getElementById('addActivityBtn');
    if (addActivityBtn) {
        addActivityBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default if inside a form
            openAddActivityModal();
        });
    }
});

// Dashboard functions
function checkAuth() {
    // This would normally check session/token
    // For demo purposes, we'll load the page if accessed directly
    loadUserInfo();
}

async function loadUserInfo() {
    try {
        const response = await fetch('/profile');
        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            
            document.getElementById('userWelcome').textContent = user.full_name;
            document.getElementById('userRole').textContent = user.role;
            document.getElementById('userRole').className = `role-badge ${user.role}`;
            
            // Show admin nav if user is admin
            if (user.role === 'admin') {
                document.getElementById('adminNav').style.display = 'block';
            }
        } else {
            // If not authenticated, redirect to login
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error loading user info:', error);
        window.location.href = 'index.html';
    }
}

async function loadProfile() {
    try {
        const response = await fetch('/profile');
        if (response.ok) {
            const user = await response.json();
            
            document.getElementById('profileUsername').value = user.username;
            document.getElementById('profileEmail').value = user.email;
            document.getElementById('profileFullName').value = user.full_name;
            document.getElementById('profileRole').value = user.role;
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function loadActivities() {
    try {
        // First, load activities with creator information
        const response = await fetch('/activities');
        if (response.ok) {
            activities = await response.json();
            
            // If we have activities, try to get creator names
            if (activities.length > 0) {
                // Get unique creator IDs
                const creatorIds = [...new Set(activities.map(a => a.created_by))];
                
                try {
                    // Fetch user details for creators
                    const usersResponse = await fetch('/admin/members/search');
                    if (usersResponse.ok) {
                        const users = await usersResponse.json();
                        const userMap = {};
                        
                        // Create a map of user IDs to user objects
                        users.forEach(user => {
                            userMap[user.id] = user;
                        });
                        
                        // Add creator_name to each activity
                        activities = activities.map(activity => ({
                            ...activity,
                            creator_name: userMap[activity.created_by]?.full_name || 'Unknown'
                        }));
                    }
                } catch (error) {
                    console.error('Error loading user details:', error);
                    // If we can't load user details, just continue with the activities we have
                }
            }
            
            displayActivities();
        }
    } catch (error) {
        console.error('Error loading activities:', error);
    }
}

function displayActivities() {
    const grid = document.getElementById('activitiesGrid');
    if (!grid) return;
    
    if (activities.length === 0) {
        grid.innerHTML = '<p class="no-activities">No activities available yet.</p>';
        return;
    }
    
    // Get current user info
    const currentUserId = currentUser?.id;
    const isAdmin = currentUser?.role === 'admin';
    
    const activitiesHTML = activities.map(activity => {
        // Check if current user can edit/delete this activity
        const canEditDelete = isAdmin || activity.created_by === currentUserId;
        
        return `
            <div class="activity-card">
                <h3>${activity.title}</h3>
                <p>${activity.description}</p>
                <div class="activity-meta">
                    <span>Date: ${new Date(activity.date).toLocaleDateString() || ''}</span>
                    <span>By: ${activity.creator_name || 'Unknown'}</span>
                </div>
                ${canEditDelete ? `
                <div class="activity-actions">
                    <button onclick="openEditActivityModal('${activity.id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteActivity('${activity.id}')">Delete</button>
                </div>
                ` : ''}
            </div>
        `;
    }).join('');
    grid.innerHTML = activitiesHTML;
}

// Modal handling for Add/Edit Activity
function openAddActivityModal() {
    console.log('Add Activity button clicked'); // Debug log
    document.getElementById('addActivityModal').style.display = 'block';
}
function closeAddActivityModal() {
    document.getElementById('addActivityModal').style.display = 'none';
}
function openEditActivityModal(activityId) {
    const activity = activities.find(a => a.id == activityId);
    if (!activity) return;
    document.getElementById('editActivityId').value = activity.id;
    document.getElementById('editActivityTitle').value = activity.title;
    document.getElementById('editActivityDescription').value = activity.description;
    document.getElementById('editActivityDate').value = activity.date || '';
    document.getElementById('editActivityModal').style.display = 'block';
}
function closeEditActivityModal() {
    document.getElementById('editActivityModal').style.display = 'none';
}

// Delete activity
async function deleteActivity(activityId) {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    try {
        const response = await fetch(`/activities/${activityId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (response.ok) {
            alert('Activity deleted successfully!');
            loadActivities();
        } else {
            alert(result.error || 'Failed to delete activity');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

// Logout
function logout() {
    fetch('/logout', { method: 'POST' })
        .then(() => {
            window.location.href = 'index.html';
        });
}

// Section switching function
function showSection(sectionId) {
    // Hide all sections first
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Remove active class from all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Show the selected section
    const activeSection = document.getElementById(sectionId + 'Section');
    if (activeSection) {
        activeSection.style.display = 'block';
    }
    
    // Add active class to clicked nav link
    const activeLink = document.querySelector(`.nav-link[onclick*="${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // If showing profile, reload profile data
    if (sectionId === 'profile') {
        loadProfile();
    }
}

// Expose modal functions to global scope
window.openAddActivityModal = openAddActivityModal;
window.closeAddActivityModal = closeAddActivityModal;
window.openEditActivityModal = openEditActivityModal;
window.closeEditActivityModal = closeEditActivityModal;
window.deleteActivity = deleteActivity;
window.logout = logout;
window.showSection = showSection;