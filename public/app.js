// NETLİFY API ADRESİ
const API_BASE = "/.netlify/functions/auth";

// 1. SAYFA YÜKLENDİĞİNDE KONTROL ET (Otomatik Giriş)
window.onload = () => {
    const isLoggedIn = localStorage.getItem('banana_auth');
    if (isLoggedIn === 'true') {
        console.log("✅ Giriş hatırlatıldı, markete geçiliyor...");
        showMarket();
    }
};

// 2. MAİL GÖNDERME FONKSİYONU
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
            alert("Hata: " + (data.error || "Mail gönderilemedi."));
        }
    } catch (err) {
        alert("Sunucuya bağlanılamadı!");
    } finally {
        if(btn) {
            btn.disabled = false;
            btn.innerText = "Get Access Key";
        }
    }
}

// 3. KODU ONAYLAMA FONKSİYONU
async function verifyOtp() {
    const otpInput = document.getElementById('otpCode');
    const userCode = otpInput.value.trim();

    if (userCode.length === 6) {
        // TARAYICIYA KAYDET (Artık seni tanıyacak)
        localStorage.setItem('banana_auth', 'true');
        
        showMarket();
        alert("Hoş geldin! Banana Market Aktif. 🍌🚀");
    } else {
        alert("Kod hatalı veya eksik! Lütfen 6 haneli kodu kontrol et. ❌");
    }
}

// 4. MARKETİ GÖSTEREN YARDIMCI FONKSİYON
function showMarket() {
    const authScreen = document.getElementById('auth-screen');
    const mainContent = document.getElementById('main-content');
    
    if(authScreen) authScreen.style.display = 'none';
    if(mainContent) mainContent.style.display = 'block';
    
    // Eğer varsa modelleri yükleyen fonksiyonun (katalog vs.)
    if (typeof loadModels === "function") {
        loadModels();
    }
}

// 5. ÇIKIŞ YAPMAK İSTERSEN (Gerekirse bir butona bağlarsın)
function logout() {
    localStorage.removeItem('banana_auth');
    location.reload();
}

console.log("🍌 Banana App Başlatıldı... Netlify Modu Aktif!");
