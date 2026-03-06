// 1. Ayarlar ve Değişkenler
let user = localStorage.getItem('bananaUser');
let allModels = [];
let curLang = localStorage.getItem('bananaLang') || 'tr';

// BURASI KRİTİK: Render adresin tam olarak bu olmalı
const API_BASE = "https://banana-engine-docs.onrender.com";

const langData = {
    tr: { search: "Ara...", likes: "Beğeni", down: "İNDİR", del: "SİL", cat: "Kategori", otp: "Kod Al", verify: "Doğrula" },
    en: { search: "Search...", likes: "Likes", down: "DOWNLOAD", del: "DELETE", cat: "Category", otp: "Get Code", verify: "Verify" }
};
const t = langData[curLang] || langData.tr;

// 2. Sayfa Yüklendiğinde Çalışacak Kontrol
document.addEventListener('DOMContentLoaded', () => {
    console.log("Banana App Başlatıldı... 🍌");
    
    // Eğer kullanıcı zaten giriş yapmışsa direk içeri al
    if (user) {
        showMainContent();
    }
});

// 3. Mail Kodu Gönderme (OTP)
window.sendOtp = async () => {
    const email = document.getElementById('loginEmail').value;
    const btn = document.getElementById('btn-otp');

    if (!email || !email.includes('@')) {
        return alert("Geçerli bir Gmail adresi gir kanka! 📧");
    }

    btn.innerText = "Gönderiliyor...";
    btn.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        if (res.ok) {
            // Birinci adımı gizle, ikinci adımı (kod girme) göster
            document.getElementById('step-1').style.display = 'none';
            document.getElementById('step-2').style.display = 'block';
            console.log("✅ OTP Maili yola çıktı!");
        } else {
            const data = await res.json();
            alert("Hata: " + (data.error || "Kod gönderilemedi."));
        }
    } catch (e) {
        console.error(e);
        alert("Servera ulaşılamıyor! Render'ın 'Sleep' modunda olabilir, 1 dk bekle.");
    } finally {
        btn.innerText = t.otp;
        btn.disabled = false;
    }
};

// 4. Kod Doğrulama
window.verifyOtp = async () => {
    const email = document.getElementById('loginEmail').value;
    const otp = document.getElementById('otpCode').value;

    if (!otp) return alert("Kodu girmedin kanka!");

    try {
        const res = await fetch(`${API_BASE}/api/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });

        if (res.ok) {
            localStorage.setItem('bananaUser', email);
            user = email;
            showMainContent();
        } else {
            alert("Kod hatalı! Gmail'ini kontrol et.");
        }
    } catch (e) {
        alert("Doğrulama sırasında hata oluştu.");
    }
};

// 5. İçeriği Göster ve Modelleri Yükle
function showMainContent() {
    const authScreen = document.getElementById('auth-screen');
    const mainContent = document.getElementById('main-content');
    
    if (authScreen) authScreen.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';
    
    loadModels();
}

// 6. Modelleri Backend'den Çek
async function loadModels() {
    try {
        const res = await fetch(`${API_BASE}/api/models`);
        allModels = await res.json();
        renderCatalog(allModels);
    } catch (e) {
        console.log("Modeller yüklenirken hata:", e);
    }
}

// 7. Katalogu Ekrana Bas
function renderCatalog(data) {
    const container = document.getElementById('catalog');
    if (!container) return;

    container.innerHTML = data.map(m => `
        <div class="card" onclick="openDetail('${m.id}')">
            <model-viewer src="${API_BASE}${m.glb}" auto-rotate shadow-intensity="1"></model-viewer>
            <div class="card-info">
                <h3>${m.name}</h3>
                <small>Kategori: ${m.category}</small>
            </div>
        </div>
    `).join('');
}

// Dil Değiştirme
window.setLang = (l) => {
    localStorage.setItem('bananaLang', l);
    location.reload();
};
