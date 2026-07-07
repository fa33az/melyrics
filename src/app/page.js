"use client";
import { useEffect, useState, useRef } from 'react';

// Reusing parseLRC from vanilla JS
const parseLRC = (lrcString) => {
    const lines = lrcString.split('\n');
    const parsed = [];
    const timeRegEx = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
    lines.forEach(line => {
        const match = timeRegEx.exec(line);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const ms = match[3].length === 2 ? parseInt(match[3], 10) * 10 : parseInt(match[3], 10);
            const timeMs = minutes * 60000 + seconds * 1000 + ms;
            const text = line.replace(timeRegEx, '').trim();
            if (text) parsed.push({ timeMs, text });
        }
    });
    return parsed;
};

export default function Overlay() {
    const [auth, setAuth] = useState(false);
    const [track, setTrack] = useState(null);
    const [lyrics, setLyrics] = useState([]);
    const [plainLyrics, setPlainLyrics] = useState(null);
    const [settings, setSettings] = useState(null);
    const [activeIdx, setActiveIdx] = useState(-1);
    
    const progressRef = useRef(0);
    const lastSyncRef = useRef(Date.now());
    const isSyncedRef = useRef(false);
    const lyricsDataRef = useRef([]);

    useEffect(() => {
        let trackInterval, settingsInterval, syncFrame;

        const init = async () => {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                setAuth(data.authenticated);
                if (data.authenticated) {
                    pollTrack();
                    pollSettings();
                    trackInterval = setInterval(pollTrack, 2000);
                    settingsInterval = setInterval(pollSettings, 5000);
                    
                    const updateSync = () => {
                        if (isSyncedRef.current && lyricsDataRef.current.length > 0) {
                            const est = progressRef.current + (Date.now() - lastSyncRef.current);
                            let active = -1;
                            for (let i = 0; i < lyricsDataRef.current.length; i++) {
                                if (est >= lyricsDataRef.current[i].timeMs) {
                                    active = i;
                                } else {
                                    break;
                                }
                            }
                            setActiveIdx(active);
                            
                            // Scroll logic
                            const activeEl = document.getElementById(`lyric-${active}`);
                            if (activeEl) {
                                const container = activeEl.parentElement;
                                const parentCenter = container.parentElement.clientHeight / 2;
                                const lineOffset = activeEl.offsetTop + (activeEl.clientHeight / 2);
                                const offset = lineOffset - parentCenter;
                                container.style.transform = `translateY(-${Math.max(0, offset)}px)`;
                            }
                        }
                        syncFrame = requestAnimationFrame(updateSync);
                    };
                    syncFrame = requestAnimationFrame(updateSync);
                }
            } catch (err) {
                console.error("Initialization error", err);
            }
        };
        init();

        return () => {
            clearInterval(trackInterval);
            clearInterval(settingsInterval);
            cancelAnimationFrame(syncFrame);
        };
    }, []);

    const pollSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
                
                const root = document.documentElement;
                root.style.setProperty('--primary-color', data.primaryColor);
                root.style.setProperty('--glass-bg', data.glassBgColor);
                root.style.setProperty('--lyric-active-size', data.activeFontSize);
                root.style.setProperty('--lyric-inactive-size', data.inactiveFontSize);
                root.style.setProperty('--lyric-align', data.lyricAlignment);
            }
        } catch (e) {}
    };

    const pollTrack = async () => {
        try {
            const res = await fetch('/api/current-track');
            if (res.status === 401) { window.location.reload(); return; }
            if (!res.ok) return;
            const data = await res.json();
            if (!data.isPlaying) return;

            progressRef.current = data.progressMs;
            lastSyncRef.current = Date.now();

            setTrack(t => {
                if (!t || t.id !== data.id) {
                    fetchLyrics(data);
                    return data;
                }
                return t;
            });
        } catch (e) {}
    };

    const fetchLyrics = async (newTrack) => {
        setLyrics([]);
        setPlainLyrics(null);
        isSyncedRef.current = false;
        
        try {
            const params = new URLSearchParams({
                trackName: newTrack.name,
                artistName: newTrack.artist,
                albumName: newTrack.album,
                durationMs: newTrack.durationMs
            });
            const res = await fetch(`/api/lyrics?${params}`);
            if (!res.ok) {
                setPlainLyrics('Lyrics not found.');
                return;
            }
            const data = await res.json();
            if (data.syncedLyrics) {
                const parsed = parseLRC(data.syncedLyrics);
                setLyrics(parsed);
                lyricsDataRef.current = parsed;
                isSyncedRef.current = true;
            } else if (data.plainLyrics) {
                setPlainLyrics(data.plainLyrics);
            } else {
                setPlainLyrics('Lyrics not found.');
            }
        } catch (e) {
            setPlainLyrics('Error loading lyrics.');
        }
    };

    if (!auth) {
        return (
            <>
                <link rel="stylesheet" href="/css/style.css" />
                <div id="auth-container">
                    <h1>Spotify Lyrics Overlay</h1>
                    <p>Please authenticate to continue.</p>
                    <a href="/api/auth" className="btn">Login with Spotify</a>
                </div>
            </>
        );
    }

    return (
        <>
            <link rel="stylesheet" href="/css/style.css" />
            <div id="overlay-container">
            {settings?.showTrackInfo && track && (
                <div className="track-info glass-panel" style={{ display: 'flex' }}>
                    {settings?.showAlbumArt && <img id="album-art" src={track.albumArt} alt="Art" />}
                    <div className="track-details">
                        <div id="track-name">{track.name}</div>
                        <div id="artist-name">{track.artist}</div>
                    </div>
                </div>
            )}
            
            <div className="lyrics-container glass-panel">
                <div id="lyrics-content">
                    {plainLyrics ? (
                        plainLyrics.split('\n').map((line, i) => (
                            <div key={i} className="lyric-line plain">{line}</div>
                        ))
                    ) : lyrics.length > 0 ? (
                        lyrics.map((l, i) => (
                            <div key={i} id={`lyric-${i}`} className={`lyric-line ${i === activeIdx ? 'active' : ''}`}>
                                {l.text}
                            </div>
                        ))
                    ) : (
                        <div className="lyric-line plain">Loading lyrics...</div>
                    )}
                </div>
            </div>
        </div>
        </>
    );
}
