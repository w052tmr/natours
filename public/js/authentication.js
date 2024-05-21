import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/users/login',
            data: {
                email,
                password,
            },
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Login Successful!');
            window.setInterval(() => {
                location = '/';
            }, 1000);
        }
    } catch (error) {
        if (error.response) {
            showAlert('error', error.response.data.message);
            console.log(error.response.data.message);
        } else if (error.request) {
            showAlert('error', error.message);
            console.log('Error: ', error.request);
        } else {
            showAlert('error', error.message);
            console.log('Error:', error.message);
        }
    }
};

export const signup = async (name, email, password, passwordConfirm) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm,
            },
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Account Creation Successful!');
            window.setInterval(() => {
                location = '/';
            }, 1000);
        }
    } catch (error) {
        if (error.response) {
            showAlert('error', error.response.data.message);
            console.log(error.response.data.message);
        } else if (error.request) {
            showAlert('error', error.message);
            console.log('Error: ', error.request);
        } else {
            showAlert('error', error.message);
            console.log('Error:', error.message);
        }
    }
};

export const forgotPassword = async (email) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/users/forgotPassword',
            data: { email },
        });

        if (res.data.status === 'success') {
            showAlert(
                'success',
                'Password reset token successfully sent to your email!'
            );
        }
    } catch (error) {
        if (error.response) {
            showAlert('error', error.response.data.message);
        } else if (error.request) {
            showAlert('error', error.message);
            console.log(error.request);
        } else {
            showAlert('error', error.message);
            console.log('Error', error.message);
        }
    }
};

export const resetPassword = async (password, passwordConfirm, token) => {
    try {
        const res = await axios({
            method: 'POST',
            url: `http://127.0.0.1:8000/api/v1/users/resetPassword/${token}`,
            data: {
                password,
                passwordConfirm,
            },
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Password Reset Successful!');
            window.setInterval(() => {
                location = '/login';
            }, 1500);
        }
    } catch (error) {
        if (error.response) {
            showAlert('error', error.response.data.message);
        } else if (error.request) {
            showAlert('error', error.message);
            console.log(error.request);
        } else {
            showAlert('error', error.message);
            console.log('Error', error.message);
        }
    }
};

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:8000/api/v1/users/logout',
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Logout Successful!');
            window.setInterval(() => {
                location = '/login';
            }, 1000);
        }
    } catch (error) {
        if (error.response) {
            showAlert('error', error.response.data.message);
        } else if (error.request) {
            showAlert('error', error.message);
            console.log(error.request);
        } else {
            showAlert('error', error.message);
            console.log('Error', error.message);
        }
    }
};
