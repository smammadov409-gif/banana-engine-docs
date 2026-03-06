let user = localStorage.getItem('bananaUser');
let allModels = [];
let curLang = localStorage.getItem('bananaLang') || 'tr';

// BURAYI KENDİ RENDER LINKINLE DEĞİŞTİR (EĞER FARKLIYSA)
const API_BASE = "https://banana-engine-docs.onrender.com";

const langData = {
    tr: { search: "Ara...", likes: "Beğeni", down: "İNDİR", del: "SİL", cat: "Kategori", otp: "Kod Al", verify: "Doğrula" },
    en: { search: "Search...", likes: "Likes", down: "DOWNLOAD", del: "DELETE", cat: "Category", otp: "Get Code", verify: "Verify" }
};
const t = langData[curLang] || langData.en;

// --- AUTH FONKSİYONLARI ---
window.sendOtp = async () => {
    const email = document.getElementById('loginEmail').value;
    if(!email) return alert("Email gir kanka!");
    
    try {
        const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email })
        });
        if(res.ok) {
            document.getElementById('step-1').style.display = 'none';
            document.getElementById('step-2').style.display = 'block';
        } else {
            alert("Kod gönderilemedi. Render loglarını kontrol et!");
        }
    } catch (e) {
        alert("Servera bağlanılamadı!");
    }
};

window.verifyOtp = async () => {
    const email = document.getElementById('loginEmail').value;
    const otp = document.getElementById('otpCode').value;
    
    try {
        const res = await fetch(`${API_BASE}/api/auth/verify`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, otp })
        });
        if(res.ok) {
            localStorage.setItem('bananaUser', email);
            location.reload();
        } else alert("Hatalı Kod!");
    } catch (e) {
        alert("Doğrulama hatası!");
    }
};

// --- MODEL YÜKLEME VE RENDER ---
window.loadModels = async () => {
    try {
        const res = await fetch(`${API_BASE}/api/models`);
        allModels = await res.json();
        renderModels(allModels);
    } catch (e) { console.log("Modeller yüklenemedi."); }
};

function renderModels(data) {
    const container = document.getElementById('catalog');
    if(!container) return;
    container.innerHTML = data.map(m => `
        <div class="card" onclick="openDetail('${m.id}')">
            <model-viewer src="${API_BASE}${m.glb}" auto-rotate shadow-intensity="1"></model-viewer>
            <div class="card-info">
                <h3>${m.name}</h3>
                <small>${m.category}</small>
            </div>
        </div>
    `).join('');
}

// Sayfa yükleme kontrolü
document.addEventListener('DOMContentLoaded', () => {
    if (user) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        window.loadModels();
    }
});

window.setLang = (l) => { localStorage.setItem('bananaLang', l); location.reload(); };
