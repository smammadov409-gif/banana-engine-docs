// NETLİFY API ADRESİ
const API_BASE = "/.netlify/functions/auth";

// 1. ADIM: MAİL GÖNDERME FONKSİYONU
async function sendOtp() {
    const emailInput = document.getElementById('loginEmail');
    if (!emailInput) return;

    const email = emailInput.value.trim();
    if (!email) {
        alert("Lütfen Gmail adresini yaz kanka! 🍌");
        return;
    }

    console.log("🚀 Banana Key isteniyor:", email);
    
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
            
            // Ekranı değiştir (Kod girme alanını aç)
            document.getElementById('step-1').style.display = 'none';
            document.getElementById('step-2').style.display = 'block';
            
        } else {
            console.error("❌ Sunucu Hatası:", data.error);
            alert("Hata: " + (data.error || "Mail gönderilemedi."));
        }
    } catch (err) {
        console.error("🌐 Bağlantı Hatası:", err);
        alert("Sunucuya bağlanılamadı!");
    } finally {
        if(btn) {
            btn.disabled = false;
            btn.innerText = "Get Access Key";
        }
    }
}

// 2. ADIM: KODU ONAYLAMA FONKSİYONU (Verify)
async function verifyOtp() {
    const otpInput = document.getElementById('otpCode');
    const userCode = otpInput.value.trim();

    if (!userCode) {
        alert("Lütfen mailine gelen kodu yaz kanka! 🍌");
        return;
    }

    // GÜVENLİK NOTU: Gerçek projede bu kod sunucuda kontrol edilir.
    // Şimdilik 6 haneli herhangi bir kod yazıldığında markete girişe izin veriyoruz.
    if (userCode.length === 6) {
        console.log("✅ Kod onaylandı, markete giriliyor...");
        
        // Giriş ekranını (Auth Screen) tamamen kapat
        document.getElementById('auth-screen').style.display = 'none';
        
        // Ana içeriği (Market) göster
        document.getElementById('main-content').style.display = 'block';
        
        alert("Hoş geldin! Banana Market Aktif. 🍌🚀");
        
        // Eğer varsa modelleri yükleyen fonksiyonu tetikle
        if (typeof loadModels === "function") {
            loadModels();
        }
    } else {
        alert("Kod hatalı veya eksik! Lütfen 6 haneli kodu kontrol et. ❌");
    }
}

console.log("🍌 Banana App Başlatıldı... Netlify Modu Aktif!");
