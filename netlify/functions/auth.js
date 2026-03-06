const nodemailer = require('nodemailer');

exports.handler = async (event) => {
    // CORS ayarı (Netlify için önemli)
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    try {
        const { email } = JSON.parse(event.body);
        const otp = Math.floor(100000 + Math.random() * 900000);

        // Şifreleri doğrudan buradan kontrol ediyoruz
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"Banana Corp" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Banana Key 🍌',
            text: `Giriş Kodun: ${otp}`
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
