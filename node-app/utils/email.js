require('dotenv').config();
const nodemailer = require('nodemailer');

const sendPriceChangeEmail = async (userEmail, itemTitle, originalPrice, suggestedPrice, tokenStr) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'payalchoudharyx@gmail.com', 
                pass: process.env.EMAIL_PASS
            },
        });

        const approvalLink = `http://localhost:3000/approve-price?token=${tokenStr}`;

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"RentEase Admin" <payalchoudharyx@gmail.com>',
            to: userEmail,
            subject: `Action Required: Price Update Suggested for your item: ${itemTitle}`,
            text: `Hello,\n\nThe admin has reviewed your item "${itemTitle}" and suggested a new price.\nOriginal Price: $${originalPrice}\nSuggested Price: $${suggestedPrice}\n\nPlease click the following link to review and accept/reject this new price: ${approvalLink}`,
            html: `
                <h3>Hello,</h3>
                <p>The admin has reviewed your item <strong>"${itemTitle}"</strong> and suggested a new price.</p>
                <ul>
                    <li><strong>Original Price:</strong> $${originalPrice}</li>
                    <li><strong>Suggested Price:</strong> $${suggestedPrice}</li>
                </ul>
                <p>Please click the button below to review and approve or reject this new price. This link will expire in 1 hour.</p>
                <a href="${approvalLink}" style="display:inline-block; padding:10px 20px; background-color:#2563eb; color:white; text-decoration:none; border-radius:5px;">Review Price Update</a>
                <p>If the button doesn't work, copy and paste this link into your browser: <br/>${approvalLink}</p>
                <p>Thanks,<br/>RentEase Team</p>
            `,
        });

        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

const sendVerificationEmail = async (userEmail, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'payalchoudharyx@gmail.com', 
                pass: process.env.EMAIL_PASS
            },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"RentEase Security" <payalchoudharyx@gmail.com>',
            to: userEmail,
            subject: `RentEase Seller Verification Code: ${otp}`,
            text: `Hello,\n\nYour RentEase seller verification code is: ${otp}\n\nThis code will expire soon. Please do not share this code with anyone.\n\nThanks,\nRentEase Team`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>RentEase Seller Verification</h2>
                    <p>Hello,</p>
                    <p>To continue setting up your seller profile, please use the following One-Time Password (OTP):</p>
                    <div style="font-size: 24px; font-weight: bold; background-color: #f3f4f6; padding: 15px; border-radius: 8px; display: inline-block; margin: 10px 0; letter-spacing: 3px;">
                        ${otp}
                    </div>
                    <p>This code will expire shortly. For your security, please do not share this code with anyone.</p>
                    <p>If you did not request this verification, please ignore this email.</p>
                    <br/>
                    <p>Thanks,<br/><strong>The RentEase Team</strong></p>
                </div>
            `,
        });

        console.log("OTP Email sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending OTP email:", error);
    }
};

module.exports = { sendPriceChangeEmail, sendVerificationEmail };
