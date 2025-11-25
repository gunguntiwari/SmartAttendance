// Check authentication
if (sessionStorage.getItem('isLoggedIn') !== 'true' || 
    sessionStorage.getItem('userRole') !== 'student') {
  window.location.href = 'index.html';
}

// Campus coordinates (DSEU Delhi)
const CAMPUS_LAT = 28.6517;
const CAMPUS_LNG = 77.0303;
const ALLOWED_RADIUS = 0.5; // km

let userLat = null;
let userLng = null;
let isWithinRange = false;

// Update UI only when DOM is ready and attach handlers
document.addEventListener('DOMContentLoaded', () => {
  const studentNameEl = document.getElementById('studentName');
  if (studentNameEl) studentNameEl.textContent = sessionStorage.getItem('username') || 'Student';

  // Attach mark attendance handler if button exists
  const markBtn = document.getElementById('markAttendanceBtn');
  if (markBtn) {
    markBtn.addEventListener('click', () => {
      if (!isWithinRange) {
        alert('You must be within campus range to mark attendance!');
        return;
      }

      const now = new Date();
      const attendance = {
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        status: 'Present',
        location: `${userLat !== null ? userLat.toFixed(4) : 'N/A'}° N, ${userLng !== null ? userLng.toFixed(4) : 'N/A'}° E`,
        username: sessionStorage.getItem('username')
      };

      // Save to localStorage
      let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');

      // Check if already marked today
      const today = attendance.date;
      const alreadyMarked = attendanceRecords.some(record => 
        record.date === today && record.username === attendance.username
      );

      if (alreadyMarked) {
        alert('You have already marked attendance for today!');
        return;
      }

      attendanceRecords.push(attendance);
      localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));

      alert('Attendance marked successfully!');
      loadAttendanceHistory();
    });
  }

  // Initial actions
  getUserLocation();
  loadAttendanceHistory();

  // Refresh location every 30 seconds
  setInterval(getUserLocation, 30000);
});

// Get user location
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      showPosition,
      showError,
      { enableHighAccuracy: true }
    );
  } else {
    updateLocationStatus('Geolocation is not supported by this browser.', 'danger');
  }
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(degrees) {
  return degrees * Math.PI / 180;
}

// Show user position
function showPosition(position) {
  userLat = position.coords.latitude;
  userLng = position.coords.longitude;

  const userLocationEl = document.getElementById('userLocation');
  if (userLocationEl) {
    userLocationEl.textContent = `${userLat.toFixed(4)}° N, ${userLng.toFixed(4)}° E`;
  }

  const distance = calculateDistance(CAMPUS_LAT, CAMPUS_LNG, userLat, userLng);
  const distanceEl = document.getElementById('distance');
  if (distanceEl) {
    distanceEl.textContent = `${distance.toFixed(2)} km`;
  }

  const markBtn = document.getElementById('markAttendanceBtn');
  if (distance <= ALLOWED_RADIUS) {
    isWithinRange = true;
    updateLocationStatus('✓ You are within campus range. You can mark attendance.', 'success');
    if (markBtn) markBtn.disabled = false;
  } else {
    isWithinRange = false;
    updateLocationStatus('✗ You are outside campus range. Please come to campus to mark attendance.', 'danger');
    if (markBtn) markBtn.disabled = true;
  }
}

// Show error
function showError(error) {
  let message = '';
  switch(error.code) {
    case error.PERMISSION_DENIED:
      message = 'Please allow location access to mark attendance.';
      break;
    case error.POSITION_UNAVAILABLE:
      message = 'Location information is unavailable.';
      break;
    case error.TIMEOUT:
      message = 'Location request timed out.';
      break;
    default:
      message = 'An unknown error occurred.';
  }
  updateLocationStatus(message, 'danger');
}

// Update location status
function updateLocationStatus(message, type) {
  const statusDiv = document.getElementById('locationStatus');
  if (!statusDiv) return;
  statusDiv.textContent = message;
  statusDiv.className = `alert alert-${type}`;
}

// Load attendance history
function loadAttendanceHistory() {
  const username = sessionStorage.getItem('username');
  const records = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
  const userRecords = records.filter(r => r.username === username);

  const tbody = document.getElementById('attendanceTable');
  if (!tbody) return;

  if (userRecords.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">No attendance records found</td></tr>';
    return;
  }

  tbody.innerHTML = userRecords.map(record => `
    <tr>
      <td>${record.date}</td>
      <td>${record.time}</td>
      <td class="status-present">${record.status}</td>
      <td>${record.location}</td>
    </tr>
  `).join('');
}

// Logout function
function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}