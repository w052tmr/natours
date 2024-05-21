import axios from 'axios';
import { showAlert } from './alert';

export const stripeCheckout = async (tourId) => {
    try {
        const res = await axios({
            method: 'GET',
            url: `http://127.0.0.1:8000/api/v1/bookings/checkout/${tourId}`,
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Checkout Session Loaded Successfully');

            window.setInterval(() => {
                location = res.data.session.url;
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
