const nodemailer = require('nodemailer');

exports.handler = async (event) => {
    // CORS Ayarları (Tarayıcı engeline takılmamak için)
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Tarayıcı "istek atabilir miyim?" diye sorduğunda (OPTIONS) "Evet" de
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Sadece POST isteklerini kabul et
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: 'Method Not Allowed' };
    }

    try {
        const { email } = JSON.parse(event.body);
        const otp = Math.floor(100000 + Math.random() * 900000);

        // GMAIL AYARLARI (Senin yeni şifrenle)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'smammadov409@gmail.com',
                pass: 'ngyoalugdkkzzuot' // Yeni 16 haneli kodun (Boşluksuz)
            }
        });

        // MAİL GÖNDERME
        await transporter.sendMail({
            from: `"Banana Corp" <smammadov409@gmail.com>`,
            to: email,
            subject: 'Banana Key 🍌',
            text: `Banana Key Kodun: ${otp}\n\nBu kodla giriş yapabilirsin kanka!`
        });

        console.log(`✅ Başarılı: ${email} adresine ${otp} kodu gönderildi.`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: "Kod gönderildi!" })
        };

    } catch (error) {
        console.error("❌ Mail Hatası:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
