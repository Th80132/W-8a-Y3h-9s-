const express = require('express');
const axios = require('axios');
const session = require('express-session');
const app = express();

const CLIENT_ID = '1382885464482250762';
const CLIENT_SECRET = 'WZVRDR2k8JO7Si2n6vkmPkbrHpvZMwJh';
const REDIRECT_URI = 'https://discord.com/oauth2/authorize?client_id=1382885464482250762&permissions=8&integration_type=0&scope=bot';

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

app.get('/login', (req, res) => {
    const redirect = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify`;
    res.redirect(redirect);
});

app.get('/callback', async(req, res) => {
    const code = req.query.code;
    const data = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        scope: 'identify'
    });

    const response = await axios.post('https://discord.com/api/oauth2/token', data, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    const { access_token } = response.data;

    const userRes = await axios.get('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${access_token}` }
    });

    req.session.user = userRes.data;
    res.redirect('/');
});

app.get('/user', (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
    res.json(req.session.user);
});

app.use(express.static('public'));

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});