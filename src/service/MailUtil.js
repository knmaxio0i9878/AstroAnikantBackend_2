const sgMail = require('@sendgrid/mail');

// Set API key from environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendingMail = async(to, subject, text) => {
    try {
        const msg = {
            to: to,
            from: 'astroanekant@gmail.com', // Must match verified sender
            subject: subject,
            html: text, // Changed from text to html since you're passing HTML
        };
        
        const response = await sgMail.send(msg);
        console.log('Email sent successfully to:', to);
        return response;
    } catch (error) {
        console.error('SendGrid Error:', error.response?.body || error.message);
        throw error;
    }
}

module.exports = { sendingMail };