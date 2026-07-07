import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_FILE = path.join(__dirname, 'settings.json');

const DEFAULT_SETTINGS = {
    primaryColor: '#1DB954',
    glassBgColor: 'rgba(20, 20, 20, 0.6)',
    activeFontSize: '2rem',
    inactiveFontSize: '1.5rem',
    showAlbumArt: true,
    showTrackInfo: true,
    lyricAlignment: 'left'
};

export const getSettings = () => {
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

export const saveSettings = (newSettings) => {
    try {
        const current = getSettings();
        const updated = { ...current, ...newSettings };
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
        return updated;
    } catch (err) {
        console.error('Error saving settings:', err);
        throw err;
    }
};
