document.addEventListener('DOMContentLoaded', function () {
    const signupBtn = document.getElementById('signupBtn');
    const loginBtn = document.getElementById('loginBtn');
    const getStartedBtn = document.getElementById('getStartedBtn');
    if (signupBtn) {
        // Add event listeners to the buttons
        signupBtn.addEventListener('click', function () {
            // Redirect the user to the signup page
            window.location.href = '/register.html';
        });
    }
    if (loginBtn) {
        loginBtn.addEventListener('click', function () {
            // Redirect the user to the login page
            window.location.href = '/login.html';
        });
    }
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function () {
            window.location.href = '/register.html';
        });
    }
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navRight = document.querySelector('.nav-right');

    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navRight.classList.toggle('active');

        // Move SignUp and Login buttons into/out of navMenu based on screen size
        if (navMenu.classList.contains('active')) {
            navMenu.appendChild(navRight);
        } else {
            document.querySelector('.nav-left').appendChild(navRight);
        }
    });



});



