// Store data
let users = [];
let elections = [];
let votes = [];
let currentUser = null;

// DOM Elements - General UI
const landingPage = document.getElementById('landingPage');
const dashboard = document.getElementById('dashboard');
const adminDashboard = document.getElementById('adminDashboard');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const createElectionModal = document.getElementById('createElectionModal');
const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');
const closeButtons = document.querySelectorAll('.close');
const logoutBtn = document.getElementById('logoutBtn');
const homeLink = document.getElementById('homeLink');
const userWelcome = document.getElementById('userWelcome');
const userVotingCards = document.getElementById('userVotingCards');

// Login Form
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');

// Register Form
const registerForm = document.getElementById('registerForm');
const registerName = document.getElementById('registerName');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const registerConfirmPassword = document.getElementById('registerConfirmPassword');
const registerSuccess = document.getElementById('registerSuccess');
const registerError = document.getElementById('registerError');

// Admin Elements
const adminTabs = document.querySelectorAll('.admin-tab');
const tabPanels = document.querySelectorAll('.tab-panel');
const createElectionBtn = document.getElementById('createElectionBtn');
const electionTable = document.getElementById('electionTable').querySelector('tbody');
const createElectionForm = document.getElementById('createElectionForm');
const electionType = document.getElementById('electionType');
const candidateOptions = document.getElementById('candidateOptions');
const referendumOptions = document.getElementById('referendumOptions');
const addCandidateBtn = document.getElementById('addCandidateBtn');
const candidatesContainer = document.getElementById('candidatesContainer');
const resultElectionSelect = document.getElementById('resultElectionSelect');
const resultsContainer = document.getElementById('resultsContainer');
const usersTable = document.getElementById('usersTable').querySelector('tbody');

// Event Listeners - Navigation and Modals
loginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    loginModal.style.display = 'flex';
});

registerBtn.addEventListener('click', function(e) {
    e.preventDefault();
    registerModal.style.display = 'flex';
});

switchToRegister.addEventListener('click', function(e) {
    e.preventDefault();
    loginModal.style.display = 'none';
    registerModal.style.display = 'flex';
});

switchToLogin.addEventListener('click', function(e) {
    e.preventDefault();
    registerModal.style.display = 'none';
    loginModal.style.display = 'flex';
});

closeButtons.forEach(button => {
    button.addEventListener('click', function() {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
        createElectionModal.style.display = 'none';
        resetForms();
    });
});

window.addEventListener('click', function(e) {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
        resetForms();
    }
    if (e.target === registerModal) {
        registerModal.style.display = 'none';
        resetForms();
    }
    if (e.target === createElectionModal) {
        createElectionModal.style.display = 'none';
        resetElectionForm();
    }
});

logoutBtn.addEventListener('click', function() {
    currentUser = null;
    showLandingPage();
});

homeLink.addEventListener('click', function(e) {
    e.preventDefault();
    if (currentUser) {
        if (currentUser.isAdmin) {
            showAdminDashboard();
        } else {
            showUserDashboard();
        }
    } else {
        showLandingPage();
    }
});

// Admin Tab Navigation
adminTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        const targetTab = this.getAttribute('data-tab');
        
        // Update active tab
        adminTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        // Show target panel
        tabPanels.forEach(panel => {
            panel.classList.remove('active');
            if (panel.id === targetTab) {
                panel.classList.add('active');
            }
        });
        
        // Refresh data for specific tabs
        if (targetTab === 'results') {
            populateResultsDropdown();
        } else if (targetTab === 'users') {
            renderUsersTable();
        }
    });
});

// Event Listeners - Forms and Admin Functions
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = loginEmail.value;
    const password = loginPassword.value;
    
    // Show some loading indicator if you have one
    
    fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email:'abc@gmail.com', password:'password123' })
    })
    .then(response => {
        // First check if the response is ok before parsing
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    })
    .then(data => {
        // Login successful
        const user = data.user || data; // Handling both formats
        
        // Store user info
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Close modal
        loginModal.style.display = 'none';
        resetForms();
        
        // Show appropriate dashboard
        if (currentUser.isAdmin) {
            showAdminDashboard();
        } else {
            showUserDashboard();
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        // Display error message to user
        const errorMessage = error.message || 'Login failed. Please try again.';
        // Update your UI to show the error message
        alert(errorMessage); // Replace with a better UI feedback
    });
});


registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = registerName.value;
    const email = registerEmail.value;
    const password = registerPassword.value;
    const confirmPassword = registerConfirmPassword.value;
    const registerSuccess = document.getElementById('registerSuccess');
    const registerError = document.getElementById('registerError');

    if (password !== confirmPassword) {
        registerError.textContent = "Passwords do not match";
        registerError.style.display = 'block';
        return;
    }

    fetch('http://localhost:5000/api/auth/register', { // Replace with your actual backend URL if different
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errData => {
                throw new Error(errData.message || 'Registration failed');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Registration successful:', data);
        registerSuccess.style.display = 'block';
        registerError.style.display = 'none';
        setTimeout(() => {
            registerModal.style.display = 'none';
            loginModal.style.display = 'flex';
            resetForms();
        }, 2000);
    })
    .catch(error => {
        console.error('Registration error:', error);
        registerError.textContent = error.message;
        registerError.style.display = 'block';
        registerSuccess.style.display = 'none';
    });
});

// Election Type Toggle
electionType.addEventListener('change', function() {
    if (this.value === 'candidate') {
        candidateOptions.style.display = 'block';
        referendumOptions.style.display = 'none';
    } else {
        candidateOptions.style.display = 'none';
        referendumOptions.style.display = 'block';
    }
});

// Add Candidate Button
addCandidateBtn.addEventListener('click', function() {
    const candidateInput = document.createElement('div');
    candidateInput.className = 'candidate-input';
    candidateInput.innerHTML = `
        <input type="text" name="candidates[]" placeholder="Candidate name" required>
        <button type="button" class="remove-option">×</button>
    `;
    candidatesContainer.appendChild(candidateInput);
    
    // Add event listener to new remove button
    candidateInput.querySelector('.remove-option').addEventListener('click', function() {
        candidatesContainer.removeChild(candidateInput);
    });
});

// Add event listeners to initial remove buttons
document.querySelectorAll('.remove-option').forEach(button => {
    button.addEventListener('click', function() {
        if (candidatesContainer.children.length > 2) {
            this.parentElement.remove();
        } else {
            alert('You need at least two candidates.');
        }
    });
});

// Create Election Form
createElectionBtn.addEventListener('click', function() {
    // Set default dates
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    document.getElementById('startDate').value = formatDate(today);
    document.getElementById('endDate').value = formatDate(tomorrow);
    
    createElectionModal.style.display = 'flex';
});

createElectionForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('electionTitle').value;
    const description = document.getElementById('electionDescription').value;
    const type = document.getElementById('electionType').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    let options = [];
    
    if (type === 'candidate') {
        const candidateInputs = document.querySelectorAll('#candidatesContainer input');
        candidateInputs.forEach(input => {
            if (input.value.trim()) {
                options.push({
                    id: generateId(),
                    name: input.value.trim(),
                    votes: 0
                });
            }
        });
    } else {
        const yesOption = document.getElementById('yesOption').value || 'Yes';
        const noOption = document.getElementById('noOption').value || 'No';
        options = [
            { id: 'yes', name: yesOption, votes: 0 },
            { id: 'no', name: noOption, votes: 0 }
        ];
    }
    
    const newElection = {
        id: generateId(),
        title,
        description,
        type,
        startDate,
        endDate,
        options,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        status: new Date(startDate) <= new Date() ? 'active' : 'scheduled'
    };
    
    elections.push(newElection);
    saveToLocalStorage('elections', elections);
    
    document.getElementById('createElectionSuccess').style.display = 'block';
    
    setTimeout(() => {
        createElectionModal.style.display = 'none';
        resetElectionForm();
        renderElectionsTable();
    }, 2000);
});

// Helper Functions
function showLandingPage() {
    landingPage.style.display = 'flex';
    dashboard.style.display = 'none';
    adminDashboard.style.display = 'none';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
}

function showUserDashboard() {
    landingPage.style.display = 'none';
    dashboard.style.display = 'block';
    adminDashboard.style.display = 'none';
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    
    userWelcome.textContent = `Welcome back, ${currentUser.name}!`;
    renderVotingCards();
}

function showAdminDashboard() {
    landingPage.style.display = 'none';
    dashboard.style.display = 'none';
    adminDashboard.style.display = 'block';
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    
    renderElectionsTable();
    renderUsersTable();
    populateResultsDropdown();
}

function resetForms() {
    loginForm.reset();
    registerForm.reset();
    loginError.style.display = 'none';
    registerError.style.display = 'none';
    registerSuccess.style.display = 'none';
}

function resetElectionForm() {
    createElectionForm.reset();
    document.getElementById('createElectionSuccess').style.display = 'none';
    document.getElementById('createElectionError').style.display = 'none';
    
    // Reset candidate inputs
    while (candidatesContainer.children.length > 2) {
        candidatesContainer.removeChild(candidatesContainer.lastChild);
    }
    
    candidatesContainer.querySelectorAll('input').forEach(input => {
        input.value = '';
    });
    
    candidateOptions.style.display = 'block';
    referendumOptions.style.display = 'none';
}

function renderVotingCards() {
    userVotingCards.innerHTML = '';
    
    const now = new Date();
    const activeElections = elections.filter(election => {
        const startDate = new Date(election.startDate);
        const endDate = new Date(election.endDate);
        return startDate <= now && endDate >= now;
    });
    
    if (activeElections.length === 0) {
        userVotingCards.innerHTML = '<p>There are no active elections at the moment.</p>';
        return;
    }
    
    activeElections.forEach(election => {
        const userVoted = votes.some(vote => vote.electionId === election.id && vote.userId === currentUser.id);
        
        const votingCard = document.createElement('div');
        votingCard.className = 'voting-card';
        
        let optionsHTML = '';
        
        if (!userVoted) {
            election.options.forEach(option => {
                optionsHTML += `
                    <div class="voting-option" data-option-id="${option.id}">
                        <input type="radio" name="vote_${election.id}" class="option-radio" id="option_${option.id}">
                        <label for="option_${option.id}">${option.name}</label>
                    </div>
                `;
            });
        } else {
            const userVote = votes.find(vote => vote.electionId === election.id && vote.userId === currentUser.id);
            const selectedOption = election.options.find(option => option.id === userVote.optionId);
            
            optionsHTML = `
                <div class="vote-submitted">
                    You have voted for: <strong>${selectedOption.name}</strong>
                </div>
            `;
        }
        
        votingCard.innerHTML = `
            <h3 class="voting-title">${election.title}</h3>
            <p class="voting-description">${election.description}</p>
            <p class="voting-deadline">Voting ends on: ${formatDateForDisplay(election.endDate)}</p>
            
            <div class="voting-options">
                ${optionsHTML}
            </div>
            
            ${!userVoted ? `
                <div class="voting-actions">
                    <button class="btn btn-primary submit-vote-btn" data-election-id="${election.id}">Submit Vote</button>
                </div>
            ` : ''}
        `;
        
        userVotingCards.appendChild(votingCard);
    });
    
    // Add event listeners for voting options
    document.querySelectorAll('.voting-option').forEach(option => {
        option.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            
            // Remove selected class from all options in this election
            const electionId = this.closest('.voting-card').querySelector('.submit-vote-btn').getAttribute('data-election-id');
            document.querySelectorAll(`.voting-card .voting-option`).forEach(op => {
                if (op.closest('.voting-card').querySelector('.submit-vote-btn').getAttribute('data-election-id') === electionId) {
                    op.classList.remove('option-selected');
                }
            });
            
            this.classList.add('option-selected');
        });
    });
    
    // Add event listeners for submit buttons
    document.querySelectorAll('.submit-vote-btn').forEach(button => {
        button.addEventListener('click', function() {
            const electionId = this.getAttribute('data-election-id');
            const selectedOption = document.querySelector(`input[name="vote_${electionId}"]:checked`);
            
            if (!selectedOption) {
                alert('Please select an option to vote.');
                return;
            }
            
            const optionId = selectedOption.closest('.voting-option').getAttribute('data-option-id');
            
            // Record vote
            const newVote = {
                id: generateId(),
                userId: currentUser.id,
                electionId,
                optionId,
                timestamp: new Date().toISOString()
            };
            
            votes.push(newVote);
            saveToLocalStorage('votes', votes);
            
            // Update option votes count
            const election = elections.find(e => e.id === electionId);
            const option = election.options.find(o => o.id === optionId);
            option.votes++;
            saveToLocalStorage('elections', elections);
            
            // Update UI
            renderVotingCards();
        });
    });
}

function renderElectionsTable() {
    electionTable.innerHTML = '';
    
    elections.forEach(election => {
        const startDate = new Date(election.startDate);
        const endDate = new Date(election.endDate);
        const now = new Date();
        
        let status;
        if (endDate < now) {
            status = 'closed';
        } else if (startDate > now) {
            status = 'scheduled';
        } else {
            status = 'active';
        }
        
        // Update status in the election object
        election.status = status;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${election.title}</td>
            <td>${election.type === 'candidate' ? 'Candidate Election' : 'Referendum'}</td>
            <td>${formatDateForDisplay(election.startDate)}</td>
            <td>${formatDateForDisplay(election.endDate)}</td>
            <td>
                <span class="status-badge ${status}">
                    ${status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            </td>
            <td class="action-buttons">
                <button class="btn btn-secondary view-results-btn" data-id="${election.id}">View Results</button>
                ${status === 'scheduled' ? `<button class="btn btn-danger delete-election-btn" data-id="${election.id}">Delete</button>` : ''}
            </td>
        `;
        
        electionTable.appendChild(row);
    });
    
    // Add event listeners for action buttons
    document.querySelectorAll('.view-results-btn').forEach(button => {
        button.addEventListener('click', function() {
            const electionId = this.getAttribute('data-id');
            viewElectionResults(electionId);
            
            // Switch to results tab
            adminTabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.getAttribute('data-tab') === 'results') {
                    tab.classList.add('active');
                }
            });
            
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === 'results') {
                    panel.classList.add('active');
                }
            });
            
            // Set the dropdown value
            resultElectionSelect.value = electionId;
        });
    });
    
    document.querySelectorAll('.delete-election-btn').forEach(button => {
        button.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this election?')) {
                const electionId = this.getAttribute('data-id');
                deleteElection(electionId);
            }
        });
    });
    
    saveToLocalStorage('elections', elections);
}

function renderUsersTable() {
    usersTable.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${formatDateForDisplay(user.registrationDate)}</td>
            <td>${user.isAdmin ? 'Administrator' : 'Voter'}</td>
            <td class="action-buttons">
                ${!user.isAdmin ? `
                    <button class="btn btn-secondary make-admin-btn" data-id="${user.id}">Make Admin</button>
                ` : ''}
                ${user.id !== currentUser.id ? `
                    <button class="btn btn-danger delete-user-btn" data-id="${user.id}">Delete</button>
                ` : ''}
            </td>
        `;
        
        usersTable.appendChild(row);
    });
    
    // Add event listeners
    document.querySelectorAll('.make-admin-btn').forEach(button => {
        button.addEventListener('click', function() {
            if (confirm('Are you sure you want to make this user an administrator?')) {
                const userId = this.getAttribute('data-id');
                makeUserAdmin(userId);
            }
        });
    });
    
    document.querySelectorAll('.delete-user-btn').forEach(button => {
        button.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this user?')) {
                const userId = this.getAttribute('data-id');
                deleteUser(userId);
            }
        });
    });
}

function populateResultsDropdown() {
    resultElectionSelect.innerHTML = '<option value="">Select an election</option>';
    
    elections.forEach(election => {
        const option = document.createElement('option');
        option.value = election.id;
        option.textContent = election.title;
        resultElectionSelect.appendChild(option);
    });
    
    resultElectionSelect.addEventListener('change', function() {
        const electionId = this.value;
        if (electionId) {
            viewElectionResults(electionId);
        } else {
            resultsContainer.innerHTML = '<p>Select an election to view results</p>';
        }
    });
}

function viewElectionResults(electionId) {
    const election = elections.find(e => e.id === electionId);
    
    if (!election) {
        resultsContainer.innerHTML = '<p>Election not found</p>';
        return;
    }
    
    // Calculate total votes
    const totalVotes = election.options.reduce((sum, option) => sum + option.votes, 0);
    
    // Create results HTML
    let resultsHTML = `
        <h3>${election.title}</h3>
        <p>${election.description}</p>
        <p>Status: ${election.status.charAt(0).toUpperCase() + election.status.slice(1)}</p>
        <p>Total Votes: ${totalVotes}</p>
        
        <table class="results-table">
            <thead>
                <tr>
                    <th>Option</th>
                    <th>Votes</th>
                    <th>Percentage</th>
                    <th>Visual</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    election.options.forEach(option => {
        const percentage = totalVotes > 0 ? (option.votes / totalVotes * 100).toFixed(2) : 0;
        
        resultsHTML += `
            <tr>
                <td>${option.name}</td>
                <td>${option.votes}</td>
                <td>${percentage}%</td>
                <td>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${percentage}%"></div>
                    </div>
                </td>
            </tr>
        `;
    });
    
    resultsHTML += `
            </tbody>
        </table>
    `;
    
    resultsContainer.innerHTML = resultsHTML;
}

function deleteElection(electionId) {
    elections = elections.filter(election => election.id !== electionId);
    votes = votes.filter(vote => vote.electionId !== electionId);
    
    saveToLocalStorage('elections', elections);
    saveToLocalStorage('votes', votes);
    
    renderElectionsTable();
    populateResultsDropdown();
}

function makeUserAdmin(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        user.isAdmin = true;
        saveToLocalStorage('users', users);
        renderUsersTable();
    }
}

function deleteUser(userId) {
    users = users.filter(user => user.id !== userId);
    votes = votes.filter(vote => vote.userId !== userId);
    
    saveToLocalStorage('users', users);
    saveToLocalStorage('votes', votes);
    
    renderUsersTable();
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    
    return [year, month, day].join('-');
}

function formatDateForDisplay(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Initialize App
function initApp() {
    // Load data from localStorage
    users = loadFromLocalStorage('users');
    elections = loadFromLocalStorage('elections');
    votes = loadFromLocalStorage('votes');
    
    // Create admin user if none exists
    if (!users.some(user => user.isAdmin)) {
        users.push({
            id: 'admin1',
            name: 'Admin User',
            email: 'admin@votesafe.com',
            password: 'admin123', // In a real app, use password hashing
            isAdmin: true,
            registrationDate: new Date().toISOString()
        });
        saveToLocalStorage('users', users);
    }
    
    // Create sample election if none exists
    if (elections.length === 0) {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        elections.push({
            id: 'election1',
            title: 'City Council Elections 2025',
            description: 'Vote for your preferred candidate for the city council position.',
            type: 'candidate',
            startDate: formatDate(today),
            endDate: formatDate(nextWeek),
            options: [
                { id: 'candidate1', name: 'Jane Smith', votes: 0 },
                { id: 'candidate2', name: 'John Doe', votes: 0 },
                { id: 'candidate3', name: 'Sarah Johnson', votes: 0 }
            ],
            createdBy: 'admin1',
            createdAt: new Date().toISOString(),
            status: 'active'
        });
        
        elections.push({
            id: 'election2',
            title: 'Public Transportation Referendum',
            description: 'Do you support the expansion of the city\'s public transportation system with a 0.5% increase in sales tax?',
            type: 'referendum',
            startDate: formatDate(today),
            endDate: formatDate(nextWeek),
            options: [
                { id: 'yes', name: 'Yes - Support the expansion', votes: 0 },
                { id: 'no', name: 'No - Oppose the expansion', votes: 0 }
            ],
            createdBy: 'admin1',
            createdAt: new Date().toISOString(),
            status: 'active'
        });
        
        saveToLocalStorage('elections', elections);
    }
    
    // Check for session
    const sessionUser = localStorage.getItem('currentUser');
    if (sessionUser) {
        const userId = JSON.parse(sessionUser).id;
        currentUser = users.find(u => u.id === userId);
        
        if (currentUser) {
            if (currentUser.isAdmin) {
                showAdminDashboard();
            } else {
                showUserDashboard();
            }
            return;
        }
    }
    
    // Default view
    showLandingPage();
}

// Start the application
initApp();