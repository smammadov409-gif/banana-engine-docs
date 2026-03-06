// NETLİFY İÇİN DOĞRU ADRES (Gereksiz uzantıları sildik!)
const API_BASE = "/.netlify/functions/auth";

async function sendOtp() {
    const emailInput = document.getElementById('emailInput');
    const email = emailInput.value.trim();

    if (!email) {
        alert("Lütfen geçerli bir mail adresi yaz kanka! 🍌");
        return;
    }

    console.log("🚀 Banana Key isteniyor:", email);
    
    // Butonu geçici olarak kilitle (Çift tıklamayı önlemek için)
    const btn = document.querySelector('button');
    if(btn) btn.disabled = true;

    try {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            console.log("✅ Mail fırlatıldı!");
            alert("Banana Key mail kutuna fırlatıldı! 🍌 Lütfen kontrol et (Spam kutusuna da bakmayı unutma).");
            
            // Eğer varsa OTP giriş kutusunu burada gösterebilirsin
            // document.getElementById('otp-section').style.display = 'block';
            
        } else {
            console.error("❌ Sunucu Hatası:", data.error);
            alert("Hata: " + (data.error || "Mail gönderilemedi. Ayarları kontrol et kanka!"));
        }
    } catch (err) {
        console.error("🌐 Bağlantı Hatası:", err);
        alert("Sunucuya bağlanılamadı. İnternetini veya Netlify ayarlarını kontrol et!");
    } finally {
        if(btn) btn.disabled = false;
    }
}

// Sayfa yüklendiğinde konsola bir selam çakalım
console.log("🍌 Banana App Başlatıldı... Netlify Modu Aktif!");
