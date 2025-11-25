// Global variables
let userRole = '';

const credentials = {
  teacher: {
    username: 'teacher123',
    password: 'teacher@123'
  },
  student: {
    username: 'Muskan',
    password: 'Muskan@123'
  }
};

// DOM elements
const teacherBtn = document.getElementById('teacherBtn');
const studentBtn = document.getElementById('studentBtn');
const loginForm = document.getElementById('loginForm');
const roleBtns = document.getElementById('roleBtns');
const backBtn = document.getElementById('backBtn');

// Event Listeners
teacherBtn.addEventListener('click', () => showLoginForm('teacher'));
studentBtn.addEventListener('click', () => showLoginForm('student'));
backBtn.addEventListener('click', showRoleButtons);
loginForm.addEventListener('submit', handleLogin);

// Show login form
function showLoginForm(role) {
  userRole = role;
  roleBtns.style.display = 'none';
  loginForm.style.display = 'block';
  document.querySelector('.login_head').textContent = 
    role === 'teacher' ? 'Teacher Login' : 'Student Login';
}


function showRoleButtons() {
  roleBtns.style.display = 'flex';
  loginForm.style.display = 'none';
  loginForm.reset();
  document.querySelector('.login_head').textContent = 'Login Portal';
}


function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  // Validate credentials
  if (username === credentials[userRole].username && 
      password === credentials[userRole].password) {
    
    // Store user session
    sessionStorage.setItem('userRole', userRole);
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('isLoggedIn', 'true');
    
    // Redirect to appropriate dashboard
    if (userRole === 'teacher') {
      window.location.href = 'admindashboard.html';
    } else {
      window.location.href = 'studentdashboard.html';
    }
  } else {
    alert('Invalid username or password!');
  }
}

// Check if already logged in
window.addEventListener('load', () => {
  if (sessionStorage.getItem('isLoggedIn') === 'true') {
    const role = sessionStorage.getItem('userRole');
    if (role === 'teacher') {
      window.location.href = 'admindashboard.html';
    } else {
      window.location.href = 'studentdashboard.html';
    }
  }
});