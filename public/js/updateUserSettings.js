import axios from 'axios';
import { showAlert } from './alert';

export const updateUserSettings = async (type, data) => {
    try {
        const url =
            type === 'password'
                ? `${window.location.origin}/api/v1/users/changePassword`
                : `${window.location.origin}/api/v1/users/updateMe`;

        const res = await axios({
            method: 'PATCH',
            url,
            data,
        });

        if (res.data.status === 'success') {
            showAlert('success', `User ${type} updated successfully.`);
            window.setInterval(() => {
                location = '/accountSettings';
            }, 1000);
        }
    } catch (error) {
        if (error.response) {
            showAlert('error', error.response.data.message);
        } else if (error.request && type !== 'password') {
            showAlert(
                'error',
                'Sorry, but file uploads are only supported when the application is run locally.',
                15
            );
            console.log('Error: ', error.request);
        } else if (error.request) {
            showAlert('error', error.message);
            console.log('Error: ', error.request);
        } else {
            showAlert('error', error.message);
            console.log('Error:', error.message);
        }
    }
};
