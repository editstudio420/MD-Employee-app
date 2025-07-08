const adminUsername = "admin";
const adminPassword = "password";
const allowedLat = -1.264056;
const allowedLng = 36.838194;
const allowedRadius = 100; // meters

const loginForm = document.getElementById('login-form');
const loginContainer = document.getElementById('login-container');
const attendanceContainer = document.getElementById('attendance-container');
const attendanceForm = document.getElementById('attendance-form');
const nameInput = document.getElementById('employee-name');
const positionInput = document.getElementById('employee-position');
const list = document.getElementById('attendance-list');
const logoutBtn = document.getElementById('logout-btn');
const profileName = document.getElementById('profile-name');
const weeklyBtn = document.getElementById('weekly-view-btn');
const dailyBtn = document.getElementById('daily-view-btn');
const monthlyBtn = document.getElementById('monthly-view-btn');
const welcomeMessage = document.getElementById('welcome-message');

const today = new Date().toISOString().split('T')[0];
let currentViewDate = today;
let allData = JSON.parse(localStorage.getItem("attendanceData")) || {};
if (!allData[today]) allData[today] = [];

function saveData() {
  localStorage.setItem("attendanceData", JSON.stringify(allData));
}

loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('admin-username').value.trim();
  const password = document.getElementById('admin-password').value.trim();

  if (username === adminUsername && password === adminPassword) {
    loginContainer.style.display = 'none';
    attendanceContainer.style.display = 'block';
    profileName.textContent = username;
    logoutBtn.style.display = 'inline-block';
    welcomeMessage.style.display = 'block';
    renderDailyView();
  } else {
    alert("Invalid login details");
  }
});

logoutBtn.addEventListener('click', () => {
  loginContainer.style.display = 'flex';
  attendanceContainer.style.display = 'none';
  logoutBtn.style.display = 'none';
  profileName.textContent = 'Not logged in';
});

attendanceForm.addEventListener('submit', function(e) {
  e.preventDefault();
  navigator.geolocation.getCurrentPosition(pos => {
    const distance = getDistanceFromLatLonInM(pos.coords.latitude, pos.coords.longitude, allowedLat, allowedLng);
    if (distance > allowedRadius) {
      alert("You are not within office coordinates.");
      return;
    }

    const name = nameInput.value.trim();
    const position = positionInput.value.trim();
    const now = new Date().toLocaleTimeString();

    const record = { name, position, checkIn: now, checkOut: "-" };
    allData[today].push(record);
    saveData();
    renderDailyView();

    nameInput.value = '';
    positionInput.value = '';
  }, () => alert("Could not get location."));
});

function renderDailyView() {
  const records = allData[today] || [];
  list.innerHTML = '';
  records.forEach((record, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${record.name}</td>
      <td>${record.position}</td>
      <td>${record.checkIn}</td>
      <td>${record.checkOut}</td>
      <td><button class="checkout-btn" ${record.checkOut !== '-' ? 'disabled' : ''}>Check Out</button></td>
    `;
    const btn = row.querySelector('.checkout-btn');
    btn.addEventListener('click', () => {
      record.checkOut = new Date().toLocaleTimeString();
      saveData();
      renderDailyView();
    });
    list.appendChild(row);
  });
}

function renderWeeklyView() {
  list.innerHTML = '';
  list.innerHTML = `<tr><td colspan=\"6\">Weekly view coming soon</td></tr>`;
}

function renderMonthlyView() {
  list.innerHTML = '';
  list.innerHTML = `<tr><td colspan=\"6\">Monthly view coming soon</td></tr>`;
}

weeklyBtn.addEventListener('click', renderWeeklyView);
dailyBtn.addEventListener('click', renderDailyView);
monthlyBtn.addEventListener('click', renderMonthlyView);

function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI/180;
  const dLon = (lon2 - lon1) * Math.PI/180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
