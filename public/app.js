// NETLİFY İÇİN DOĞRU ADRES
const API_BASE = "/.netlify/functions/auth";

async function sendOtp() {
    // BURASI DÜZELDİ: HTML'deki ID olan "loginEmail" ile eşitledik!
    const emailInput = document.getElementById('loginEmail'); 
    
    if (!emailInput) {
        console.error("❌ Hata: loginEmail ID'li kutu bulunamadı!");
        return;
    }

    const email = emailInput.value.trim();

    if (!email) {
        alert("Lütfen geçerli bir mail adresi yaz kanka! 🍌");
        return;
    }

    console.log("🚀 Banana Key isteniyor:", email);
    
    // Butonu geçici olarak kilitle
    const btn = document.getElementById('btn-otp');
    if(btn) {
        btn.disabled = true;
        btn.innerText = "Gönderiliyor...";
    }

    try {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            console.log("✅ Mail fırlatıldı!");
            alert("Banana Key mail kutuna fırlatıldı! 🍌");
            
            // Kod giriş ekranına geçiş yapalım (Senin HTML'indeki step'ler)
            document.getElementById('step-1').style.display = 'none';
            document.getElementById('step-2').style.display = 'block';
            
        } else {
            console.error("❌ Sunucu Hatası:", data.error);
            alert("Hata: " + (data.error || "Mail gönderilemedi."));
        }
    } catch (err) {
        console.error("🌐 Bağlantı Hatası:", err);
        alert("Sunucuya bağlanılamadı kanka!");
    } finally {
        if(btn) {
            btn.disabled = false;
            btn.innerText = "Get Access Key";
        }
    }
}

console.log("🍌 Banana App Başlatıldı... Netlify Modu Aktif!");
