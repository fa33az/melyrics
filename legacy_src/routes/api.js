import express from 'express';
import { getCurrentlyPlaying } from '../services/spotify.js';
import { getLyrics } from '../services/lyrics.js';
import { store } from '../store.js';
import { getSettings, saveSettings } from '../settings.js';

const router = express.Router();

// Middleware to check auth
const requireAuth = (req, res, next) => {
    if (!store.accessToken) {
        return res.status(401).json({ error: 'Server not authenticated with Spotify.' });
    }
    next();
};

router.get('/current-track', requireAuth, async (req, res) => {
    try {
        const data = await getCurrentlyPlaying(store.accessToken);
        
        if (!data || !data.item) {
            return res.json({ isPlaying: false });
        }

        const trackInfo = {
            isPlaying: data.is_playing,
            id: data.item.id,
            name: data.item.name,
            artist: data.item.artists.map(a => a.name).join(', '),
            album: data.item.album.name,
            albumArt: data.item.album.images[0]?.url || '',
            durationMs: data.item.duration_ms,
            progressMs: data.progress_ms
        };

        res.json(trackInfo);
    } catch (err) {
        console.error('Current track error:', err);
        // Token might be expired. In a real app we'd refresh it using refresh_token.
        // For simplicity, we just send 401 to force re-login if it fails.
        if (err.message.includes('401')) {
             return res.status(401).json({ error: 'Token expired. Please login again.' });
        }
        res.status(500).json({ error: 'Failed to fetch current track' });
    }
});

router.get('/lyrics', requireAuth, async (req, res) => {
    const { trackName, artistName, albumName, durationMs } = req.query;

    if (!trackName || !artistName) {
        return res.status(400).json({ error: 'Missing trackName or artistName' });
    }

    try {
        const lyrics = await getLyrics(trackName, artistName, albumName, durationMs);
        if (!lyrics) {
            return res.status(404).json({ error: 'Lyrics not found' });
        }

        res.json(lyrics);
    } catch (err) {
        console.error('Lyrics endpoint error:', err);
        res.status(500).json({ error: 'Failed to fetch lyrics' });
    }
});

router.get('/settings', (req, res) => {
    res.json(getSettings());
});

router.post('/settings', (req, res) => {
    try {
        const updated = saveSettings(req.body);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

export default router;
