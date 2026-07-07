"use client";
import { useEffect, useState } from 'react';

export default function Editor() {
    const [settings, setSettings] = useState({
        primaryColor: '#1DB954',
        glassBgColor: 'rgba(20, 20, 20, 0.6)',
        activeFontSize: '2rem',
        inactiveFontSize: '1.5rem',
        showAlbumArt: true,
        showTrackInfo: true,
        lyricAlignment: 'left'
    });
    const [status, setStatus] = useState('');

    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/editor.css';
        document.head.appendChild(link);
        
        fetch('/api/settings').then(r => r.json()).then(setSettings);
        
        return () => document.head.removeChild(link);
    }, []);

    const handleSave = async () => {
        setStatus('Saving...');
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                setStatus('Settings saved successfully!');
                setTimeout(() => setStatus(''), 3000);
                document.getElementById('previewIframe').src = document.getElementById('previewIframe').src;
            } else {
                setStatus('Failed to save.');
            }
        } catch(e) {
            setStatus('Error occurred.');
        }
    };

    return (
        <div className="editor-container">
            <div className="sidebar">
                <h2>Overlay Settings</h2>
                
                <div className="setting-group">
                    <label>Primary Color (Active Lyric)</label>
                    <input type="color" value={settings.primaryColor} onChange={e => setSettings({...settings, primaryColor: e.target.value})} />
                </div>

                <div className="setting-group">
                    <label>Background Color (Overlay)</label>
                    <input type="text" value={settings.glassBgColor} onChange={e => setSettings({...settings, glassBgColor: e.target.value})} />
                </div>

                <div className="setting-group">
                    <label>Active Lyric Font Size</label>
                    <input type="text" value={settings.activeFontSize} onChange={e => setSettings({...settings, activeFontSize: e.target.value})} />
                </div>

                <div className="setting-group">
                    <label>Inactive Lyric Font Size</label>
                    <input type="text" value={settings.inactiveFontSize} onChange={e => setSettings({...settings, inactiveFontSize: e.target.value})} />
                </div>

                <div className="setting-group">
                    <label><input type="checkbox" checked={settings.showAlbumArt} onChange={e => setSettings({...settings, showAlbumArt: e.target.checked})} /> Show Album Art</label>
                </div>

                <div className="setting-group">
                    <label><input type="checkbox" checked={settings.showTrackInfo} onChange={e => setSettings({...settings, showTrackInfo: e.target.checked})} /> Show Track Info</label>
                </div>

                <div className="setting-group">
                    <label>Lyrics Alignment</label>
                    <select value={settings.lyricAlignment} onChange={e => setSettings({...settings, lyricAlignment: e.target.value})}>
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                    </select>
                </div>

                <button className="btn" onClick={handleSave}>Save Changes</button>
                <div id="statusMessage">{status}</div>
            </div>
            <div className="preview-panel">
                <div className="preview-header">Live Preview</div>
                <div className="iframe-wrapper">
                    <iframe src="/" id="previewIframe"></iframe>
                </div>
            </div>
        </div>
    );
}
