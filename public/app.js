let user = localStorage.getItem('bananaUser');
let allModels = [];
let curLang = localStorage.getItem('bananaLang') || 'tr';

const langData = {
    tr: { search: "Ara...", likes: "Beğeni", down: "İNDİR", del: "SİL", cat: "Kategori", otp: "Kod Al", verify: "Doğrula" },
    en: { search: "Search...", likes: "Likes", down: "DOWNLOAD", del: "DELETE", cat: "Category", otp: "Get Code", verify: "Verify" },
    fr: { search: "Chercher...", likes: "J'aime", down: "TÉLÉCHARGER", del: "SUPPRIMER", cat: "Catégorie", otp: "Code", verify: "Vérifier" },
    es: { search: "Buscar...", likes: "Me gusta", down: "DESCARGAR", del: "ELIMINAR", cat: "Categoría", otp: "Código", verify: "Verificar" },
    ru: { search: "Поиск...", likes: "Лайки", down: "СКАЧАТЬ", del: "УДАЛИТЬ", cat: "Категория", otp: "Код", verify: "Проверить" }
};

const t = langData[curLang];

// --- AUTH FONKSİYONLARI (HATA BURADAYDI) ---
window.sendOtp = async () => {
    const email = document.getElementById('loginEmail').value;
    if(!email) return alert("Email?");
    const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email })
    });
    if(res.ok) {
        document.getElementById('step-1').style.display = 'none';
        document.getElementById('step-2').style.display = 'block';
    }
};

window.verifyOtp = async () => {
    const email = document.getElementById('loginEmail').value;
    const otp = document.getElementById('otpCode').value;
    const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, otp })
    });
    if(res.ok) {
        localStorage.setItem('bananaUser', email);
        location.reload();
    } else alert("Hatalı Kod!");
};

window.setLang = (l) => { localStorage.setItem('bananaLang', l); location.reload(); };

// --- MODEL YÜKLEME ---
window.loadModels = async () => {
    try {
        const res = await fetch('/api/models');
        allModels = await res.json();
        render(allModels);
        
        // UI Dili Ayarla
        document.getElementById('searchInput').placeholder = t.search;
        if(document.getElementById('btn-otp')) document.getElementById('btn-otp').innerText = t.otp;
        if(document.getElementById('btn-verify')) document.getElementById('btn-verify').innerText = t.verify;
    } catch (e) { console.log("Backend henüz bağlı değil veya model yok."); }
};

window.searchModels = () => {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allModels.filter(m => 
        (m.name && m.name.toLowerCase().includes(q)) || (m.category && m.category.toLowerCase().includes(q))
    );
    render(filtered);
};

function render(data) {
    const container = document.getElementById('catalog');
    if(!container || !data) return;
    container.innerHTML = data.map(m => {
        // Split hatası koruması
        const ext = (m.fileName && m.fileName.includes('.')) ? m.fileName.split('.').pop().toUpperCase() : '3D';
        return `
        <div class="card" onclick="openDetail('${m.id}')">
            <div class="badge">${ext}</div>
            <div class="category-badge">${m.category || "General"}</div>
            <model-viewer src="${m.glb}" auto-rotate shadow-intensity="1" touch-action="none"></model-viewer>
            <div class="card-info" style="padding:15px">
                <h3 style="margin:0">${m.name || 'Untitled'}</h3>
                <small style="color:#777">by ${m.owner ? m.owner.split('@')[0] : 'Artist'}</small>
            </div>
        </div>`;
    }).join('');
}

window.openDetail = async (id) => {
    const m = allModels.find(x => String(x.id) === String(id));
    if(!m) return;
    document.getElementById('detail-modal').style.display = 'flex';
    document.getElementById('viewer-area').innerHTML = `<model-viewer src="${m.glb}" camera-controls auto-rotate shadow-intensity="2" touch-action="pan-y" style="width:100%; height:100%"></model-viewer>`;
    document.getElementById('det-name').innerText = m.name;
    document.getElementById('det-desc').innerText = m.description;
    document.getElementById('det-cat').innerText = `${t.cat}: ${m.category}`;
    
    document.getElementById('likeBtn').innerHTML = `<i class="fas fa-heart"></i> ${m.likes ? m.likes.length : 0} ${t.likes}`;
    document.getElementById('downBtn').innerText = t.down;
    document.getElementById('downBtn').onclick = () => { window.open(m.main, '_blank'); };

    if(m.owner === user) {
        const dBtn = document.getElementById('deleteBtn');
        dBtn.style.display = "block"; dBtn.innerText = t.del;
        dBtn.onclick = async () => { if(confirm("Silinsin mi?")) { await fetch(`/api/models/${id}`, { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({userEmail:user}) }); location.reload(); } };
    }
};

window.closeDetail = () => document.getElementById('detail-modal').style.display = 'none';

if (user) {
    const authScreen = document.getElementById('auth-screen');
    const mainContent = document.getElementById('main-content');
    if(authScreen) authScreen.style.display = 'none';
    if(mainContent) mainContent.style.display = 'block';
    window.loadModels();
}