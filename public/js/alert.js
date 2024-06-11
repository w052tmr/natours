const removeAlert = () => {
    const alert = document.getElementById('alert');

    if (alert) alert.remove();
};

export const showAlert = (type, message, time = 5) => {
    removeAlert();

    document
        .querySelector('body')
        .insertAdjacentHTML(
            'afterbegin',
            `<div class='alert alert--${type}' id='alert'>${message}</div>`
        );

    window.setTimeout(() => {
        removeAlert();
    }, time * 1000);
};
