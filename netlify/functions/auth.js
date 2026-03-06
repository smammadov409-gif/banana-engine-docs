const nodemailer = require('nodemailer');

exports.handler = async (event) => {
    // CORS ayarları: Frontend'den gelen isteğe izin ver
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Preflight (ön kontrol) isteği için
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: 'Method Not Allowed' };
    }

    try {
        const { email } = JSON.parse(event.body);
        const otp = Math.floor(100000 + Math.random() * 900000);

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
            body: JSON.stringify({ success: true, message: "Kod gönderildi!" })
        };
    } catch (error) {
        console.error("Mail Hatası:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
