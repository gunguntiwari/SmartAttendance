// Check authentication
if (sessionStorage.getItem('isLoggedIn') !== 'true' || 
    sessionStorage.getItem('userRole') !== 'teacher') {
  window.location.href = 'index.html';
}


const studentList = [
  'student123',
  'student456',
  'student789'
];

// Load dashboard data
function loadDashboard() {
  const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
  const today = new Date().toLocaleDateString();
  
  // Get today's attendance
  const todayRecords = records.filter(r => r.date === today);
  const presentToday = todayRecords.length;
  const totalStudents = studentList.length;
  const absentToday = totalStudents - presentToday;
  const attendanceRate = totalStudents > 0 
    ? ((presentToday / totalStudents) * 100).toFixed(1) 
    : 0;
  
  // Update stats (guard DOM access)
  const totalEl = document.getElementById('totalStudents');
  const presentEl = document.getElementById('presentToday');
  const absentEl = document.getElementById('absentToday');
  const rateEl = document.getElementById('attendanceRate');

  if (totalEl) totalEl.textContent = totalStudents;
  if (presentEl) presentEl.textContent = presentToday;
  if (absentEl) absentEl.textContent = absentToday;
  if (rateEl) rateEl.textContent = attendanceRate + '%';
  
  // Load all records
  loadAttendanceTable(records);
}

// Load attendance table
function loadAttendanceTable(records) {
  const tbody = document.getElementById('attendanceTable');
  if (!tbody) return;
  
  if (records.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">No records found</td></tr>';
    return;
  }
  
  // Sort by date and time (newest first)
  records.sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.time);
    const dateB = new Date(b.date + ' ' + b.time);
    return dateB - dateA;
  });
  
  tbody.innerHTML = records.map(record => `
    <tr>
      <td>${record.username}</td>
      <td>${record.date}</td>
      <td>${record.time}</td>
      <td class="status-present">${record.status}</td>
      <td>${record.location}</td>
    </tr>
  `).join('');
}

//  date
function filterByDate() {
  const selectedDate = document.getElementById('filterDate').value;
  if (!selectedDate) {
    alert('Please select a date');
    return;
  }
  
  const filterDate = new Date(selectedDate).toLocaleDateString();
  const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
  const filtered = records.filter(r => r.date === filterDate);
  
  loadAttendanceTable(filtered);
}

// Show all records
function showAllRecords() {
  const filterEl = document.getElementById('filterDate');
  if (filterEl) filterEl.value = '';
  const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
  loadAttendanceTable(records);
}


function exportToCSV() {
  const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
  
  if (records.length === 0) {
    alert('No records to export');
    return;
  }
  
  let csv = 'Student ID,Date,Time,Status,Location\n';
  records.forEach(record => {
    const username = String(record.username || '').replace(/"/g, '""');
    const location = String(record.location || '').replace(/"/g, '""');
    csv += `${username},${record.date},${record.time},${record.status},"${location}"\n`;
  });
  
  // Create download link
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileDate = new Date().toISOString().slice(0,10); // yyyy-mm-dd
  a.download = `attendance_${fileDate}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Send notification
function sendNotification() {
  const recipientsEl = document.getElementById('recipients');
  const messageEl = document.getElementById('message');
  const recipients = recipientsEl ? recipientsEl.value : 'all';
  const message = messageEl ? messageEl.value : '';
  
  if (!message.trim()) {
    alert('Please enter a message');
    return;
  }
  
  const today = new Date().toLocaleDateString();
  const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
  const todayRecords = records.filter(r => r.date === today);
  
  let targetStudents = [];
  
  if (recipients === 'absent') {
    const presentStudents = todayRecords.map(r => r.username);
    targetStudents = studentList.filter(s => !presentStudents.includes(s));
  } else {
    targetStudents = studentList;
  }
  
  // In production, send actual email/SMS via backend API
  console.log('Sending notification to:', targetStudents);
  console.log('Message:', message);
  
  alert(`Notification sent to ${targetStudents.length} student(s):\n\n${message}`);
  if (messageEl) messageEl.value = '';
}

// Logout function
function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

// Initialize dashboard after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const teacherEl = document.getElementById('teacherName');
  if (teacherEl) teacherEl.textContent = sessionStorage.getItem('username') || 'Teacher';

  // Initialize dashboard
  loadDashboard();

  // Refresh dashboard every 30 seconds
  setInterval(loadDashboard, 30000);
});