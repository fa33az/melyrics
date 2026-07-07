import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';

let redis = null;
try {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    if (url && token) {
        redis = new Redis({
            url: url,
            token: token,
        });
    }
} catch (e) {
    console.warn("KV Redis not configured properly. Falling back to local FS.");
}

const SETTINGS_FILE = path.join(process.cwd(), 'legacy_src', 'settings.json');

const DEFAULT_SETTINGS = {
    primaryColor: '#1DB954',
    glassBgColor: 'rgba(25, 25, 25, 0.75)',
    activeFontSize: '42px',
    inactiveFontSize: '24px',
    lyricAlignment: 'center',
    showAlbumArt: true,
    showTrackInfo: true,
};

export const getSettings = async () => {
    if (redis) {
        try {
            const data = await redis.get('overlay_settings');
            return data ? { ...DEFAULT_SETTINGS, ...data } : DEFAULT_SETTINGS;
        } catch (e) {
            console.error("Failed to read settings from KV", e);
        }
    }

    try {
        if (!fs.existsSync(SETTINGS_FILE)) {
            return DEFAULT_SETTINGS;
        }
        const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (err) {
        console.error('Error reading settings:', err);
        return DEFAULT_SETTINGS;
    }
};

export const saveSettings = async (newSettings) => {
    const current = await getSettings();
    const updated = { ...current, ...newSettings };

    if (redis) {
        try {
            await redis.set('overlay_settings', updated);
        } catch (e) {
            console.error("Failed to write settings to KV", e);
        }
    }

    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    } catch (err) {
        console.error('Error saving settings:', err);
    }
    return updated;
};
