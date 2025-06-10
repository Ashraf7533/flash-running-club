// Authentication functions for Flash Running Club

// Admin credentials
const adminCredentials = {
    username: 'FlashRC12',
    password: 'Flash12'
};

// Member database with join dates
let memberDb = JSON.parse(localStorage.getItem('memberDb')) || [
    { 
      username: 'member1', 
      password: 'password1', 
      joinDate: '2023-02-15',
      email: 'member1@example.com',
      phone: '555-111-2222'
    },
    { 
      username: 'member2', 
      password: 'password2',
      joinDate: '2023-03-20',
      email: 'member2@example.com',
      phone: '555-222-3333'
    },
    { 
      username: 'member3', 
      password: 'password3',
      joinDate: '2023-04-10',
      email: 'member3@example.com',
      phone: '555-333-4444'
    }
];

// Save initial member database if not already stored
if (!localStorage.getItem('memberDb')) {
    localStorage.setItem('memberDb', JSON.stringify(memberDb));
}

// Training database structure
if (!localStorage.getItem('trainings')) {
    const initialTrainings = {
        'member1': {
            current: [
                { 
                  id: 1, 
                  date: '2023-06-10',
                  morningSession: {
                    name: 'Morning Run',
                    description: '5km run at moderate pace followed by stretching exercises',
                    completed: false
                  },
                  eveningSession: {
                    name: 'Evening Strength',
                    description: 'Strength training: 3 sets of squats, lunges, and core exercises',
                    completed: false
                  }
                }
            ],
            past: []
        },
        'member2': {
            current: [],
            past: []
        },
        'member3': {
            current: [],
            past: []
        }
    };
    localStorage.setItem('trainings', JSON.stringify(initialTrainings));
}

// Events database structure
if (!localStorage.getItem('events')) {
    const initialEvents = [
        {
            id: 1,
            date: '2023-06-10',
            time: '08:00',
            title: 'Club 5K Race',
            location: 'City Park, Main Entrance',
            description: 'Monthly club 5K race at City Park. All members welcome.'
        },
        {
            id: 2,
            date: '2023-06-25',
            time: '07:30',
            title: 'Half Marathon',
            location: 'Downtown, Starting at Central Square',
            description: 'Annual Flash Running Club Half Marathon. Register by June 15.'
        },
        {
            id: 3,
            date: '2023-07-05',
            time: '18:00',
            title: 'Track Meet',
            location: 'City Stadium, Track Field',
            description: 'Evening track meet with 100m, 400m, 800m, and 1 mile events.'
        }
    ];
    localStorage.setItem('events', JSON.stringify(initialEvents));
}

/**
 * Admin login function 
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 */
function loginAsAdmin(username, password) {
    const loginError = document.getElementById('loginError');
    
    // Clear previous error
    loginError.style.display = 'none';
    
    // Check admin credentials
    if (username === adminCredentials.username && password === adminCredentials.password) {
        // Store admin info in localStorage
        localStorage.setItem('username', 'FlashRC12');
        localStorage.setItem('userType', 'admin');
        
        // Redirect to admin dashboard
        window.location.href = 'admin-dashboard.html';
    } else {
        loginError.style.display = 'block';
    }
}

/**
 * Verify member credentials from admin dashboard
 * @param {string} username - The member's username
 * @param {string} password - The member's password
 * @returns {boolean} - Whether credentials are valid
 */
function verifyMemberCredentials(username, password) {
    const members = JSON.parse(localStorage.getItem('memberDb')) || [];
    const validMember = members.find(member => 
        member.username === username && member.password === password);
    
    if (validMember) {
        // Store member credentials temporarily in sessionStorage
        sessionStorage.setItem('pendingUsername', username);
        sessionStorage.setItem('pendingPassword', password);
        return true;
    }
    return false;
}

/**
 * Login as a member
 * @param {string} username - The member's username
 * @param {string} password - The member's password
 */
function loginAsMember(username, password) {
    const loginError = document.getElementById('loginError');
    
    // Clear previous error
    loginError.style.display = 'none';
    
    // Validate member credentials
    const members = JSON.parse(localStorage.getItem('memberDb')) || [];
    const validMember = members.find(member => 
        member.username === username && member.password === password);
    
    if (validMember) {
        // Store login info in localStorage
        localStorage.setItem('username', username);
        localStorage.setItem('userType', 'member');
        
        // Redirect to member dashboard
        window.location.href = 'member-dashboard.html';
    } else {
        loginError.style.display = 'block';
    }
}

/**
 * Logout function - clears localStorage and redirects to home
 */
function logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('userType');
    window.location.href = 'index.html';
}

/**
 * Add a new member
 * @param {Object} memberData - Member data including username, password, email, phone
 * @returns {boolean} - Whether the member was added successfully
 */
function addMember(memberData) {
    // Get current members
    const members = JSON.parse(localStorage.getItem('memberDb')) || [];
    
    // Check if username already exists
    if (members.some(member => member.username === memberData.username)) {
        return false;
    }
    
    // Add join date if not provided
    if (!memberData.joinDate) {
        const today = new Date();
        memberData.joinDate = today.toISOString().split('T')[0];
    }
    
    // Add to members array
    members.push(memberData);
    
    // Save back to localStorage
    localStorage.setItem('memberDb', JSON.stringify(members));
    
    // Initialize training record for the new member
    const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
    trainings[memberData.username] = { current: [], past: [] };
    localStorage.setItem('trainings', JSON.stringify(trainings));
    
    return true;
}

/**
 * Update an existing member
 * @param {string} username - Original username of the member to update
 * @param {Object} memberData - New member data
 * @returns {boolean} - Whether the member was updated successfully
 */
function updateMember(username, memberData) {
    // Get current members
    const members = JSON.parse(localStorage.getItem('memberDb')) || [];
    
    // Find the member
    const memberIndex = members.findIndex(member => member.username === username);
    if (memberIndex === -1) {
        return false;
    }
    
    // If username is changing, need to update training records too
    if (memberData.username !== username) {
        // Check if the new username already exists
        if (members.some((member, index) => index !== memberIndex && member.username === memberData.username)) {
            return false;
        }
        
        // Update training records
        const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
        trainings[memberData.username] = trainings[username];
        delete trainings[username];
        localStorage.setItem('trainings', JSON.stringify(trainings));
    }
    
    // Update member info
    members[memberIndex] = memberData;
    
    // Save back to localStorage
    localStorage.setItem('memberDb', JSON.stringify(members));
    
    return true;
}

/**
 * Delete a member
 * @param {string} username - Username of the member to delete
 * @returns {boolean} - Whether the member was deleted successfully
 */
function deleteMember(username) {
    // Get current members
    const members = JSON.parse(localStorage.getItem('memberDb')) || [];
    
    // Find the member
    const memberIndex = members.findIndex(member => member.username === username);
    if (memberIndex === -1) {
        return false;
    }
    
    // Remove from members array
    members.splice(memberIndex, 1);
    
    // Save back to localStorage
    localStorage.setItem('memberDb', JSON.stringify(members));
    
    // Remove training records
    const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
    delete trainings[username];
    localStorage.setItem('trainings', JSON.stringify(trainings));
    
    return true;
}

/**
 * Get all members
 * @returns {Array} - Array of all members
 */
function getAllMembers() {
    return JSON.parse(localStorage.getItem('memberDb')) || [];
}

/**
 * Add a training to a member
 * @param {string} memberUsername - The member's username
 * @param {string} trainingDate - Date of the training (YYYY-MM-DD)
 * @param {Object} morningSesssion - Morning session details {name, description}
 * @param {Object} eveningSession - Evening session details {name, description}
 * @returns {boolean} - Whether the training was added successfully
 */
function addMemberTraining(memberUsername, trainingDate, morningSession, eveningSession) {
    // Get current trainings
    const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
    
    // Initialize if not exist
    if (!trainings[memberUsername]) {
        trainings[memberUsername] = { current: [], past: [] };
    }
    
    // Generate new training ID
    const newId = Date.now();
    
    // Add completed property to sessions if they exist
    if (morningSession) {
        morningSession.completed = false;
    }
    
    if (eveningSession) {
        eveningSession.completed = false;
    }
    
    // Add new training
    trainings[memberUsername].current.push({
        id: newId,
        date: trainingDate,
        morningSession: morningSession || null,
        eveningSession: eveningSession || null
    });
    
    // Save back to localStorage
    localStorage.setItem('trainings', JSON.stringify(trainings));
    return true;
}

/**
 * Mark a specific session of a training as completed or incomplete permanently
 * @param {string} memberUsername - The member's username
 * @param {number} trainingId - ID of the training
 * @param {string} sessionType - Either 'morning' or 'evening'
 * @param {boolean} isCompleted - Whether the session is completed or not
 * @param {boolean} isPermanent - Whether the status should be permanent
 * @returns {boolean} - Whether the session was marked successfully
 */
function updateSessionStatus(memberUsername, trainingId, sessionType, isCompleted, isPermanent = false) {
    // Get current trainings
    const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
    
    // Check if member and training exist
    if (!trainings[memberUsername] || !trainings[memberUsername].current) {
        return false;
    }
    
    // Find training index
    const trainingIndex = trainings[memberUsername].current.findIndex(t => t.id === trainingId);
    if (trainingIndex === -1) {
        return false;
    }
    
    // Get the training
    const training = trainings[memberUsername].current[trainingIndex];
    
    // Mark the specific session as completed or incomplete and set permanent flag
    if (sessionType === 'morning' && training.morningSession) {
        training.morningSession.completed = isCompleted;
        training.morningSession.permanent = isPermanent;
    } else if (sessionType === 'evening' && training.eveningSession) {
        training.eveningSession.completed = isCompleted;
        training.eveningSession.permanent = isPermanent;
    } else {
        return false;
    }
    
    // Check if both sessions have a permanent status (either complete or incomplete)
    const morningPermanent = !training.morningSession || training.morningSession.permanent === true;
    const eveningPermanent = !training.eveningSession || training.eveningSession.permanent === true;
    
    // Only move to past if both sessions have permanent status
    if (morningPermanent && eveningPermanent) {
        // Remove from current
        trainings[memberUsername].current.splice(trainingIndex, 1);
        
        // Add to past
        if (!trainings[memberUsername].past) {
            trainings[memberUsername].past = [];
        }
        trainings[memberUsername].past.push(training);
    } else if (!isPermanent) {
        // For non-permanent updates, use the old behavior
        // Check if both sessions are completed
        const morningCompleted = !training.morningSession || training.morningSession.completed;
        const eveningCompleted = !training.eveningSession || training.eveningSession.completed;
        
        if (morningCompleted && eveningCompleted) {
            // If both sessions are completed, move the training to past
            trainings[memberUsername].current.splice(trainingIndex, 1);
            
            // Add to past
            if (!trainings[memberUsername].past) {
                trainings[memberUsername].past = [];
            }
            trainings[memberUsername].past.push(training);
        }
    }
    
    // Save back to localStorage
    localStorage.setItem('trainings', JSON.stringify(trainings));
    return true;
}

/**
 * Mark a specific session of a training as completed
 * @param {string} memberUsername - The member's username
 * @param {number} trainingId - ID of the training
 * @param {string} sessionType - Either 'morning' or 'evening'
 * @returns {boolean} - Whether the session was marked as completed
 */
function completeTrainingSession(memberUsername, trainingId, sessionType) {
    return updateSessionStatus(memberUsername, trainingId, sessionType, true, false);
}

/**
 * Mark a specific session of a training as completed permanently
 * @param {string} memberUsername - The member's username
 * @param {number} trainingId - ID of the training
 * @param {string} sessionType - Either 'morning' or 'evening'
 * @returns {boolean} - Whether the session was marked as completed permanently
 */
function completeTrainingSessionPermanently(memberUsername, trainingId, sessionType) {
    return updateSessionStatus(memberUsername, trainingId, sessionType, true, true);
}

/**
 * Mark a specific session of a training as incomplete
 * @param {string} memberUsername - The member's username
 * @param {number} trainingId - ID of the training
 * @param {string} sessionType - Either 'morning' or 'evening'
 * @returns {boolean} - Whether the session was marked as incomplete
 */
function markSessionIncomplete(memberUsername, trainingId, sessionType) {
    return updateSessionStatus(memberUsername, trainingId, sessionType, false, false);
}

/**
 * Mark a specific session of a training as incomplete permanently
 * @param {string} memberUsername - The member's username
 * @param {number} trainingId - ID of the training
 * @param {string} sessionType - Either 'morning' or 'evening'
 * @returns {boolean} - Whether the session was marked as incomplete permanently
 */
function markSessionIncompletePermanently(memberUsername, trainingId, sessionType) {
    return updateSessionStatus(memberUsername, trainingId, sessionType, false, true);
}

/**
 * Check if a session status is permanent and cannot be changed
 * @param {string} memberUsername - The member's username
 * @param {number} trainingId - ID of the training
 * @param {string} sessionType - Either 'morning' or 'evening'
 * @returns {boolean} - Whether the session status is permanent
 */
function isSessionStatusPermanent(memberUsername, trainingId, sessionType) {
    // Get trainings data
    const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
    
    // Check in current trainings
    if (trainings[memberUsername]?.current) {
        const training = trainings[memberUsername].current.find(t => t.id === trainingId);
        if (training) {
            if (sessionType === 'morning' && training.morningSession) {
                return training.morningSession.permanent === true;
            } else if (sessionType === 'evening' && training.eveningSession) {
                return training.eveningSession.permanent === true;
            }
        }
    }
    
    // Check in past trainings
    if (trainings[memberUsername]?.past) {
        const training = trainings[memberUsername].past.find(t => t.id === trainingId);
        if (training) {
            if (sessionType === 'morning' && training.morningSession) {
                return training.morningSession.permanent === true;
            } else if (sessionType === 'evening' && training.eveningSession) {
                return training.eveningSession.permanent === true;
            }
        }
    }
    
    return false;
}

/**
 * Mark a complete training as completed (legacy function)
 * @param {string} memberUsername - The member's username
 * @param {number} trainingId - ID of the training to mark as completed
 * @returns {boolean} - Whether the training was marked as completed
 */
function completeTraining(memberUsername, trainingId) {
    // Get current trainings
    const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
    
    // Check if member and training exist
    if (!trainings[memberUsername] || !trainings[memberUsername].current) {
        return false;
    }
    
    // Find training index
    const trainingIndex = trainings[memberUsername].current.findIndex(t => t.id === trainingId);
    if (trainingIndex === -1) {
        return false;
    }
    
    // Get the training
    const training = trainings[memberUsername].current[trainingIndex];
    
    // Mark both sessions as completed if they exist
    if (training.morningSession) {
        training.morningSession.completed = true;
    }
    if (training.eveningSession) {
        training.eveningSession.completed = true;
    }
    
    // Remove from current
    trainings[memberUsername].current.splice(trainingIndex, 1);
    
    // Add to past
    if (!trainings[memberUsername].past) {
        trainings[memberUsername].past = [];
    }
    trainings[memberUsername].past.push(training);
    
    // Save back to localStorage
    localStorage.setItem('trainings', JSON.stringify(trainings));
    return true;
}

/**
 * Get member's trainings
 * @param {string} memberUsername - The member's username
 * @returns {Object} - Current and past trainings for the member
 */
function getMemberTrainings(memberUsername) {
    const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
    
    if (!trainings[memberUsername]) {
        return { current: [], past: [] };
    }
    
    return {
        current: trainings[memberUsername].current || [],
        past: trainings[memberUsername].past || []
    };
}

/**
 * Get all members with their training status
 * @returns {Array} - Array of members with training info
 */
function getAllMembersWithTrainings() {
    const members = JSON.parse(localStorage.getItem('memberDb')) || [];
    const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
    
    return members.map(member => {
        const memberTrainings = trainings[member.username] || { current: [], past: [] };
        return {
            ...member,
            currentTrainings: memberTrainings.current || [],
            pastTrainings: memberTrainings.past || []
        };
    });
}

/**
 * Get statistics for admin dashboard
 * @returns {Object} - Statistics object with counts
 */
function getAdminStats() {
    const members = JSON.parse(localStorage.getItem('memberDb')) || [];
    const trainings = JSON.parse(localStorage.getItem('trainings')) || {};
    const events = JSON.parse(localStorage.getItem('events')) || [];
    
    let totalCurrentTrainings = 0;
    let totalCompletedTrainings = 0;
    
    Object.values(trainings).forEach(memberTraining => {
        totalCurrentTrainings += (memberTraining.current || []).length;
        totalCompletedTrainings += (memberTraining.past || []).length;
    });
    
    return {
        memberCount: members.length,
        currentTrainingsCount: totalCurrentTrainings,
        completedTrainingsCount: totalCompletedTrainings,
        totalTrainingsCount: totalCurrentTrainings + totalCompletedTrainings,
        eventsCount: events.length
    };
}

/**
 * Get all upcoming events
 * @returns {Array} - Array of event objects
 */
function getAllEvents() {
    return JSON.parse(localStorage.getItem('events')) || [];
}

/**
 * Add a new event
 * @param {Object} eventData - Event data including date, time, title, location, description
 * @returns {boolean} - Whether the event was added successfully
 */
function addEvent(eventData) {
    // Get current events
    const events = getAllEvents();
    
    // Generate new event ID
    const newId = Date.now();
    eventData.id = newId;
    
    // Add to events array
    events.push(eventData);
    
    // Sort events by date and time
    events.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });
    
    // Save back to localStorage
    localStorage.setItem('events', JSON.stringify(events));
    
    return true;
}

/**
 * Edit an existing event
 * @param {number} eventId - ID of the event to edit
 * @param {Object} eventData - Updated event data
 * @returns {boolean} - Whether the event was updated successfully
 */
function editEvent(eventId, eventData) {
    // Get current events
    const events = getAllEvents();
    
    // Find the event
    const eventIndex = events.findIndex(event => event.id === eventId);
    if (eventIndex === -1) {
        return false;
    }
    
    // Update event, keeping the original ID
    eventData.id = eventId;
    events[eventIndex] = eventData;
    
    // Sort events by date and time
    events.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });
    
    // Save back to localStorage
    localStorage.setItem('events', JSON.stringify(events));
    
    return true;
}

/**
 * Delete an event
 * @param {number} eventId - ID of the event to delete
 * @returns {boolean} - Whether the event was deleted successfully
 */
function deleteEvent(eventId) {
    // Get current events
    const events = getAllEvents();
    
    // Find the event
    const eventIndex = events.findIndex(event => event.id === eventId);
    if (eventIndex === -1) {
        return false;
    }
    
    // Remove from events array
    events.splice(eventIndex, 1);
    
    // Save back to localStorage
    localStorage.setItem('events', JSON.stringify(events));
    
    return true;
}

/**
 * Auto-clear past events (runs at midnight)
 * This removes events from the previous day
 */
function autoClearPastEvents() {
    // Get current events
    const events = getAllEvents();
    
    // Get yesterday's date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today
    
    // Filter out events that have passed
    const futureEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0); // Set to beginning of event day
        return eventDate >= today;
    });
    
    // If we've removed any events, save the updated list
    if (futureEvents.length < events.length) {
        localStorage.setItem('events', JSON.stringify(futureEvents));
    }
}

// Set up auto-clearing of past events at midnight
function scheduleEventCleanup() {
    // First, run it once to clear any past events
    autoClearPastEvents();
    
    // Calculate time until next midnight
    const now = new Date();
    const midnight = new Date();
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = midnight - now;
    
    // Schedule the first cleanup at next midnight
    setTimeout(() => {
        autoClearPastEvents();
        
        // Then set up daily interval (24 hours)
        setInterval(autoClearPastEvents, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
}

// Call the scheduler when the page loads
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', scheduleEventCleanup);
}