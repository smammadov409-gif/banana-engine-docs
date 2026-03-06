require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// --- 1. GÜVENLİK VE CORS AYARI (HATA BURADAYDI) ---
// Bu ayar, banana.js.org'dan gelen isteklere "GEÇ" izni verir.
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Klasör kontrolü
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname)
});
const upload = multer({ storage });

let database = []; 
let users = {}; 

// --- 2. NODEMAILER (MAİL) AYARI ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { 
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS // Google 16 haneli uygulama şifresi
    }
});

// --- 3. AUTH (GİRİŞ VE OTP) ---
app.post('/api/auth/send-otp', async (req, res) => {
    const { email } = req.body;
    console.log(`📩 Kod isteği geldi: ${email}`); // Render loglarında bunu görmelisin
    
    const otp = Math.floor(100000 + Math.random() * 900000);
    users[email] = { email, otp }; 
    
    try {
        await transporter.sendMail({
            from: `"Banana Corp" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Banana Key 🍌',
            text: `Banana Corp Giriş Anahtarın: ${otp}\n\nBu kod ile 3D Market'e giriş yapabilirsin.`
        });
        console.log(`✅ Kod başarıyla gönderildi: ${otp}`);
        res.json({ success: true });
    } catch (e) {
        console.error("❌ MAİL GÖNDERME HATASI:", e);
        res.status(500).json({ error: "Email gönderilemedi. Şifreni kontrol et kanka!" });
    }
});

app.post('/api/auth/verify', (req, res) => {
    const { email, otp } = req.body;
    if (users[email] && String(users[email].otp) === String(otp)) {
        console.log(`🔓 Giriş başarılı: ${email}`);
        res.json({ success: true });
    } else {
        res.status(401).json({ error: "Geçersiz kod!" });
    }
});

// --- 4. MODELLER VE DOSYALAR ---
app.get('/api/models', (req, res) => {
    res.json(database);
});

app.post('/api/upload', upload.fields([{ name: 'glb' }, { name: 'main' }]), (req, res) => {
    try {
        const { name, description, owner, category } = req.body;
        const model = { 
            id: String(Date.now()), 
            name: name || "Untitled",
            description: description || "",
            owner: owner || "anonymous",
            category: category || "General",
            glb: `/uploads/${req.files['glb'][0].filename}`,
            main: `/uploads/${req.files['main'][0].filename}`,
            fileName: req.files['main'][0].originalname,
            likes: []
        };
        database.unshift(model);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Yükleme başarısız." });
    }
});

// Statik Dosyalar (Public ve Uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// --- 5. RENDER PORT AYARI ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    🍌🍌🍌🍌🍌🍌🍌🍌🍌🍌🍌🍌🍌
    🚀 BANANA HQ ONLINE!
    📡 Port: ${PORT}
    🍌🍌🍌🍌🍌🍌🍌🍌🍌🍌🍌🍌🍌
    `);
});
