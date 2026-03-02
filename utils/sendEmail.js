const nodemailer = require('nodemailer');

const sendEmail = async (email, otp) => {
    try {

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "BlushBerry OTP Verification 💄",
            text: `Your OTP for BlushBerry is ${otp}. It will expire in 60 seconds.`
        };

        await transporter.sendMail(mailOptions);

        console.log("Email sent successfully ✅");

    } catch (error) {
        console.log("Email error:", error);
        throw error;
    }
};

module.exports = sendEmail;