import { displayMap } from './map';
import {
    login,
    signup,
    forgotPassword,
    resetPassword,
    logout,
} from './authentication';
import { updateUserSettings } from './updateUserSettings';
import { stripeCheckout } from './stripe';

//DOM ELEMENTS
const map = document.querySelector('#map');
const loginForm = document.querySelector('.form-login');
const signupForm = document.querySelector('.form-signup');
const forgotPasswordForm = document.querySelector('.form-forgotPassword');
const resetPasswordForm = document.querySelector('.form-resetPassword');
const logoutBtn = document.querySelector('#logout');
const updateUserDataForm = document.querySelector('.form-user-data');
const updateUserPasswordForm = document.querySelector('.form-user-password');
const bookingBtn = document.querySelector('#bookingBtn');

if (map) {
    const locations = JSON.parse(map.dataset.locations);
    displayMap(locations);
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        login(email, password);
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm =
            document.getElementById('passwordConfirm').value;

        signup(name, email, password, passwordConfirm);
    });
}

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.querySelector('#email').value;

        forgotPassword(email);
    });
}

if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const password = document.querySelector('#password').value;
        const passwordConfirm =
            document.querySelector('#passwordConfirm').value;
        const token = resetPasswordForm.dataset.token;

        resetPassword(password, passwordConfirm, token);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();

        logout();
    });
}

if (updateUserDataForm) {
    updateUserDataForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const form = new FormData();
        form.append('email', document.getElementById('email').value);
        form.append('name', document.getElementById('name').value);
        form.append('photo', document.getElementById('photo').files[0]);

        updateUserSettings(form, 'data');
    });
}

if (updateUserPasswordForm) {
    updateUserPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const passwordOld = document.getElementById('password-current').value;
        const passwordNew = document.getElementById('password').value;
        const passwordNewConfirm =
            document.getElementById('password-confirm').value;

        updateUserSettings('password', {
            passwordOld,
            passwordNew,
            passwordNewConfirm,
        });
    });
}

if (bookingBtn) {
    bookingBtn.addEventListener('click', (e) => {
        bookingBtn.textContent = 'Processing...';

        const { tourid } = e.target.dataset;

        stripeCheckout(tourid);
    });
}
