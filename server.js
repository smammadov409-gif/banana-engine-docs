require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Klasör kontrolü
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname)
});
const upload = multer({ storage });

let database = []; 
let users = {}; 

// --- MAIL AYARI ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { 
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
    }
});

// --- AUTH (GİRİŞ) ---
app.post('/api/auth/send-otp', async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    users[email] = { email, otp }; // OTP'yi hafızaya al
    
    try {
        await transporter.sendMail({
            from: `"Banana Corp" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Banana Key',
            text: `Banana Corp Giriş Kodun: ${otp}`
        });
        console.log(`✅ Kod gönderildi: ${email} -> ${otp}`);
        res.json({ success: true });
    } catch (e) {
        console.error("❌ Mail Hatası:", e);
        res.status(500).json({ error: "Email gönderilemedi" });
    }
});

app.post('/api/auth/verify', (req, res) => {
    const { email, otp } = req.body;
    if (users[email] && String(users[email].otp) === String(otp)) {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: "Geçersiz kod" });
    }
});

// --- MODELLER ---
app.get('/api/models', (req, res) => res.json(database));

app.post('/api/upload', upload.fields([{ name: 'glb' }, { name: 'main' }]), (req, res) => {
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
});

app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// RENDER İÇİN PORT AYARI
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Banana HQ Online | Port ${PORT}`));
