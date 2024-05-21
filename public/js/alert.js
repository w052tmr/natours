const removeAlert = () => {
    const alert = document.getElementById('alert');

    if (alert) alert.remove();
};

export const showAlert = (type, message) => {
    removeAlert();

    document
        .querySelector('body')
        .insertAdjacentHTML(
            'afterbegin',
            `<div class='alert alert--${type}' id='alert'>${message}</div>`
        );

    window.setTimeout(() => {
        removeAlert();
    }, 5000);
};
