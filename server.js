require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// GÜVENLİK AYARI
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname)
});
const upload = multer({ storage });

let database = []; 
let users = {}; 

// --- GÜNCELLENMİŞ VE GÜVENLİ MAİL SİSTEMİ ---
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL bağlantısı için true
    auth: { 
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
    },
    tls: {
        rejectUnauthorized: false // Bağlantı kopmalarını önler
    }
});

// --- AUTH (GİRİŞ) ---
app.post('/api/auth/send-otp', async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    users[email] = { email, otp }; 
    
    try {
        await transporter.sendMail({
            from: `"Banana Corp" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Banana Key 🍌',
            text: `Banana Corp Giriş Kodun: ${otp}`
        });
        console.log(`✅ Mail başarıyla uçtu: ${email} -> ${otp}`);
        res.json({ success: true });
    } catch (e) {
        console.error("❌ MAİL HATASI:", e);
        res.status(500).json({ error: "Mail sunucusuna bağlanılamadı." });
    }
});

app.post('/api/auth/verify', (req, res) => {
    const { email, otp } = req.body;
    if (users[email] && String(users[email].otp) === String(otp)) {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: "Kod hatalı kanka!" });
    }
});

// MODELLER
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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Banana HQ Online | Port ${PORT}`));
