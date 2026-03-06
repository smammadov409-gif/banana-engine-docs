const nodemailer = require('nodemailer');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    const { email } = JSON.parse(event.body);
    const otp = Math.floor(100000 + Math.random() * 900000);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS // ljlgiekhkaflfvhe kodu buraya gelecek
        }
    });

    try {
        await transporter.sendMail({
            from: `"Banana Corp" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Banana Key 🍌',
            text: `Giriş Kodun: ${otp}`
        });
        return { 
            statusCode: 200, 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ success: true, message: "Kod gönderildi!" }) 
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
