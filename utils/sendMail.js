const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class sendMail {
    constructor(user, linkUrl) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.from = 'Troy M. Ricker <troymricker@gmail.com>';
        this.linkUrl = linkUrl;
    }

    createTransport() {
        if (process.env.NODE_ENV === 'development') {
            return nodemailer.createTransport({
                host: process.env.NODEMAILER_HOST,
                secure: false,
                port: process.env.NODEMAILER_PORT,
                auth: {
                    user: process.env.NODEMAILER_USERNAME,
                    pass: process.env.NODEMAILER_PASSWORD,
                },
            });
        }

        return nodemailer.createTransport({
            host: process.env.BREVO_HOST,
            port: process.env.BREVO_PORT,
            auth: {
                user: process.env.BREVO_USERNAME,
                pass: process.env.BREVO_PASSWORD,
            },
        });
    }

    async send(template, subject) {
        const html = pug.renderFile(template, {
            name: this.firstName,
            linkUrl: this.linkUrl,
            from: 'Troy M. Ricker',
            title: subject,
        });

        await this.createTransport().sendMail({
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.htmlToText(html),
        });
    }

    async welcome() {
        await this.send(
            `${__dirname}/../views/email/welcome.pug`,
            'Welcome To The Natours Family!'
        );
    }

    async passwordReset() {
        await this.send(
            `${__dirname}/../views/email/password.pug`,
            'Your Password Reset Token (Expires in 10 Minutes)'
        );
    }
};

const mailtrap = async (email, text) => {
    const transporter = nodemailer.createTransport({
        host: process.env.NODEMAILER_HOST,
        secure: false,
        port: process.env.NODEMAILER_PORT,
        auth: {
            user: process.env.NODEMAILER_USERNAME,
            pass: process.env.NODEMAILER_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: 'ricker.troym@gmail.com',
        to: email,
        subject: 'Your Password Reset Token',
        text,
    });
};
