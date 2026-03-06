const nodemailer = require('nodemailer');

exports.handler = async (event) => {
    // CORS Ayarları: Tarayıcıdan gelen isteklere izin ver
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Preflight kontrolü
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: 'Method Not Allowed' };
    }

    try {
        const { email } = JSON.parse(event.body);
        
        // 6 haneli rastgele kod üret
        const otp = Math.floor(100000 + Math.random() * 900000);

        // GMAIL AYARLARI (12cosqun12 hesabı için)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: '12cosqun12@gmail.com', // Kodu aldığın mail adresi
                pass: 'ngyoalugdkkzzuot'      // Yeni 16 haneli kodun (Boşluksuz)
            }
        });

        // MAİL GÖNDERME İŞLEMİ
        await transporter.sendMail({
            from: `"Banana Corp" <12cosqun12@gmail.com>`,
            to: email,
            subject: 'Banana Key 🍌',
            text: `Selam kanka! Banana Key Kodun: ${otp}\n\nBu kodla markete giriş yapabilirsin.`
        });

        console.log(`✅ Başarılı: ${email} adresine kod fırlatıldı!`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                message: "Kod gönderildi!",
                // Test aşamasında kolaylık olsun diye kodu buraya da yazıyorum
                debug_otp: otp 
            })
        };

    } catch (error) {
        console.error("❌ Gmail Hatası:", error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: "Gmail bağlantısı kurulamadı: " + error.message 
            })
        };
    }
};
