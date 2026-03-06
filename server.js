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

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname)
});
const upload = multer({ storage });

let database = []; 
let users = {}; 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// AUTH
app.post('/api/auth/send-otp', async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    if(!users[email]) users[email] = { email };
    users[email].otp = otp;
    try {
        await transporter.sendMail({
            from: `"Banana Corp"`, to: email, subject: 'Banana Key', text: `Code: ${otp}`
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Email error" }); }
});

app.post('/api/auth/verify', (req, res) => {
    const { email, otp } = req.body;
    if (users[email] && String(users[email].otp) === String(otp)) res.json({ success: true });
    else res.status(401).json({ error: "Invalid" });
});

// MODELS
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

app.post('/api/models/:id/like', (req, res) => {
    const m = database.find(x => String(x.id) === String(req.params.id));
    const { email } = req.body;
    if(m) {
        if(!m.likes.includes(email)) m.likes.push(email);
        return res.json({ success: true, count: m.likes.length });
    }
    res.status(404).json({ error: "Not Found" });
});

app.delete('/api/models/:id', (req, res) => {
    const idx = database.findIndex(x => String(x.id) === String(req.params.id) && x.owner === req.body.userEmail);
    if(idx !== -1) { database.splice(idx, 1); return res.json({ success: true }); }
    res.status(403).send();
});

app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));
app.listen(3000, () => console.log("🚀 Banana HQ Online | Port 3000"));