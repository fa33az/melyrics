import express from 'express';
import { getSpotifyAuthUrl, getAccessToken } from '../services/spotify.js';
import { store } from '../store.js';

const router = express.Router();

router.get('/login', (req, res) => {
    const authUrl = getSpotifyAuthUrl(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_REDIRECT_URI);
    res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
    const { code, error } = req.query;

    if (error) {
        return res.status(400).send(`Error from Spotify: ${error}`);
    }

    if (!code) {
        return res.status(400).send('No code provided');
    }

    try {
        const data = await getAccessToken(
            process.env.SPOTIFY_CLIENT_ID,
            process.env.SPOTIFY_CLIENT_SECRET,
            process.env.SPOTIFY_REDIRECT_URI,
            code
        );

        // Store tokens globally for OBS
        store.accessToken = data.access_token;
        store.refreshToken = data.refresh_token;
        
        res.redirect('/');
    } catch (err) {
        console.error('Auth Error:', err);
        res.status(500).send('Authentication failed');
    }
});

router.get('/status', (req, res) => {
    if (store.accessToken) {
        res.json({ authenticated: true });
    } else {
        res.json({ authenticated: false });
    }
});

router.get('/logout', (req, res) => {
    store.accessToken = null;
    store.refreshToken = null;
    if (req.session) {
        req.session.destroy();
    }
    res.redirect('/');
});

export default router;
