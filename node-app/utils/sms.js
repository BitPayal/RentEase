require('dotenv').config();
const twilio = require('twilio');

const sendVerificationSMS = async (phoneNumber, otp) => {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

        // Fallback for development if Twilio credentials are not set
        if (!accountSid || !authToken || !twilioPhone) {
            console.log("\n==========================================");
            console.log("⚠️ TWILIO CREDENTIALS NOT FOUND IN .env");
            console.log(`📡 MOCK SMS SENT TO: ${phoneNumber}`);
            console.log(`🔑 OTP IS: ${otp}`);
            console.log("==========================================\n");
            return { mock: true, otp };
        }

        const client = twilio(accountSid, authToken);

        const message = await client.messages.create({
            body: `Your RentEase Seller Verification code is: ${otp}. Do not share this with anyone.`,
            from: twilioPhone,
            to: phoneNumber
        });

        console.log('Real SMS sent via Twilio: %s', message.sid);
        return { mock: false };
    } catch (error) {
        console.error("Error sending SMS:", error);
        throw error;
    }
};

module.exports = { sendVerificationSMS };
