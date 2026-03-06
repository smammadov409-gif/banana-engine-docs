require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// --- 1. GÜVENLİK (CORS) ---
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Klasör Kontrolü
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname)
});
const upload = multer({ storage });

let database = []; 
let users = {}; 

// --- 2. EN GARANTİ MAİL AYARI (PORT 587) ---
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: { 
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
    },
    tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
    }
});

// --- 3. AUTH (GİRİŞ) ---
app.post('/api/auth/send-otp', async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    users[email] = { email, otp }; 
    
    console.log(`📩 Mail denemesi: ${email} için kod: ${otp}`);

    try {
        await transporter.sendMail({
            from: `"Banana Corp" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Banana Key 🍌',
            text: `Giriş Kodun: ${otp}`
        });
        console.log("✅ Mail başarıyla fırlatıldı!");
        res.json({ success: true });
    } catch (e) {
        console.error("❌ MAİL HATASI DETAYI:", e);
        res.status(500).json({ error: "Mail sunucusu reddetti. Ayarları kontrol et kanka!" });
    }
});

app.post('/api/auth/verify', (req, res) => {
    const { email, otp } = req.body;
    if (users[email] && String(users[email].otp) === String(otp)) {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: "Kod hatalı!" });
    }
});

// --- 4. MODELLER ---
app.get('/api/models', (req, res) => res.json(database));

app.post('/api/upload', upload.fields([{ name: 'glb' }, { name: 'main' }]), (req, res) => {
    try {
        const { name, description, owner, category } = req.body;
        const model = { 
            id: String(Date.now()), 
            name: name || "Untitled",
            glb: `/uploads/${req.files['glb'][0].filename}`,
            main: `/uploads/${req.files['main'][0].filename}`,
            likes: []
        };
        database.unshift(model);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Upload hatası!" });
    }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Sunucu ${PORT} portunda aktif!`));
