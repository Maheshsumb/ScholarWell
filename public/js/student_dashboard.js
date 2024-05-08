const greetingNav = document.querySelector('.nav-right .greeting');
const greetingSidebar = document.querySelector('.dashboard .heading1 .greeting2');
const timeTableModule = document.getElementById('time-table-d');
const sleepDataModule = document.getElementById('sleep-data');
window.onload = () => {
    if (!sessionStorage.name) {
        location.href = '/login';
    } else {
        if (greetingNav) {
            greetingNav.innerHTML = `${sessionStorage.name}`;
        }
        if (greetingSidebar) {
            greetingSidebar.innerHTML = `Hello ${sessionStorage.name}`;
        }
    }
}
if (timeTableModule) {
    timeTableModule.addEventListener('click', () => {
        window.location.href = '/user_timetable.html';
    });
}
if (sleepDataModule) {
    sleepDataModule.addEventListener('click', () => {
        window.location.href = '/user_sleep.html';
    });
}
const logOut = document.querySelector('.logout');
const sidebarLogout = document.getElementById('sidebar-logout');
const dashboard = document.getElementById('dashboard');
if (sidebarLogout) {
    sidebarLogout.addEventListener('click', function () {
        sessionStorage.clear();
        location.reload();
    });
}
if (dashboard) {
    dashboard.addEventListener('click', function () {
        window.location.href = '/student_dashboard.html';
    });
}
if (logOut) {
    logOut.onclick = () => {
        console.log('dadadiyaaaaaaaaaaa');
        sessionStorage.clear();
        location.reload();
    }
}
