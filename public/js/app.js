const authContainer = document.getElementById('auth-container');
const overlayContainer = document.getElementById('overlay-container');
const albumArt = document.getElementById('album-art');
const trackName = document.getElementById('track-name');
const artistName = document.getElementById('artist-name');
const lyricsContent = document.getElementById('lyrics-content');

let currentTrackId = null;
let currentLyrics = []; // [{ timeMs: 0, text: '' }]
let currentProgressMs = 0;
let isSynced = false;
let lastSyncTime = Date.now();

const applySettings = async () => {
    try {
        const res = await fetch('/api/settings');
        const settings = await res.json();
        
        // Apply CSS variables
        const root = document.documentElement;
        root.style.setProperty('--primary-color', settings.primaryColor);
        root.style.setProperty('--glass-bg', settings.glassBgColor);
        root.style.setProperty('--lyric-active-size', settings.activeFontSize);
        root.style.setProperty('--lyric-inactive-size', settings.inactiveFontSize);
        root.style.setProperty('--lyric-align', settings.lyricAlignment);
        
        // Apply layout
        const trackInfoContainer = document.querySelector('.track-info');
        
        if (settings.showTrackInfo) {
            trackInfoContainer.style.display = 'flex';
        } else {
            trackInfoContainer.style.display = 'none';
        }
        
        if (settings.showAlbumArt) {
            albumArt.style.display = 'block';
        } else {
            albumArt.style.display = 'none';
        }
    } catch (err) {
        console.error('Failed to apply settings:', err);
    }
};

// Parse LRC format
const parseLRC = (lrcString) => {
    const lines = lrcString.split('\n');
    const parsed = [];
    const timeRegEx = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    lines.forEach(line => {
        const match = timeRegEx.exec(line);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const milliseconds = match[3].length === 2 ? parseInt(match[3], 10) * 10 : parseInt(match[3], 10);
            const timeMs = minutes * 60000 + seconds * 1000 + milliseconds;
            const text = line.replace(timeRegEx, '').trim();
            if (text) {
                parsed.push({ timeMs, text });
            }
        }
    });
    return parsed;
};

const checkAuthStatus = async () => {
    try {
        const res = await fetch('/auth/status');
        const data = await res.json();
        if (data.authenticated) {
            authContainer.classList.add('hidden');
            overlayContainer.classList.remove('hidden');
            startPolling();
            requestAnimationFrame(updateLyricsSync);
        } else {
            authContainer.classList.remove('hidden');
            overlayContainer.classList.add('hidden');
        }
    } catch (err) {
        console.error('Failed to check auth:', err);
    }
};

const fetchTrack = async () => {
    try {
        const res = await fetch('/api/current-track');
        
        if (res.status === 401) {
            window.location.reload(); // Force re-auth
            return;
        }
        
        const data = await res.json();
        
        if (!data.isPlaying) {
            return;
        }

        // Update progress
        currentProgressMs = data.progressMs;
        lastSyncTime = Date.now();

        if (data.id !== currentTrackId) {
            currentTrackId = data.id;
            updateTrackUI(data);
            fetchLyrics(data);
        }
    } catch (err) {
        console.error('Failed to fetch track:', err);
    }
};

const updateTrackUI = (track) => {
    albumArt.src = track.albumArt;
    trackName.textContent = track.name;
    artistName.textContent = track.artist;
};

const fetchLyrics = async (track) => {
    lyricsContent.innerHTML = '<div class="lyric-line plain">Loading lyrics...</div>';
    lyricsContent.style.transform = 'translateY(0)';
    currentLyrics = [];
    isSynced = false;

    try {
        const params = new URLSearchParams({
            trackName: track.name,
            artistName: track.artist,
            albumName: track.album,
            durationMs: track.durationMs
        });
        
        const res = await fetch(`/api/lyrics?${params}`);
        if (!res.ok) {
            lyricsContent.innerHTML = '<div class="lyric-line plain">Lyrics not found.</div>';
            return;
        }

        const data = await res.json();
        
        if (data.syncedLyrics) {
            currentLyrics = parseLRC(data.syncedLyrics);
            isSynced = true;
            renderSyncedLyrics();
        } else if (data.plainLyrics) {
            renderPlainLyrics(data.plainLyrics);
        } else {
            lyricsContent.innerHTML = '<div class="lyric-line plain">Lyrics not found.</div>';
        }
    } catch (err) {
        console.error('Failed to fetch lyrics:', err);
        lyricsContent.innerHTML = '<div class="lyric-line plain">Error loading lyrics.</div>';
    }
};

const renderSyncedLyrics = () => {
    lyricsContent.innerHTML = '';
    currentLyrics.forEach((lyric, index) => {
        const div = document.createElement('div');
        div.className = 'lyric-line';
        div.textContent = lyric.text;
        div.id = `lyric-${index}`;
        lyricsContent.appendChild(div);
    });
};

const renderPlainLyrics = (plainText) => {
    lyricsContent.innerHTML = '';
    const lines = plainText.split('\n');
    lines.forEach(line => {
        if (line.trim() === '') return;
        const div = document.createElement('div');
        div.className = 'lyric-line plain';
        div.textContent = line;
        lyricsContent.appendChild(div);
    });
};

const updateLyricsSync = () => {
    if (isSynced && currentLyrics.length > 0) {
        // Estimate current progress based on last fetch time
        const estimatedProgress = currentProgressMs + (Date.now() - lastSyncTime);
        
        let activeIndex = -1;
        for (let i = 0; i < currentLyrics.length; i++) {
            if (estimatedProgress >= currentLyrics[i].timeMs) {
                activeIndex = i;
            } else {
                break;
            }
        }

        // Remove active class from all, add to active
        const allLines = document.querySelectorAll('.lyric-line');
        allLines.forEach((line, idx) => {
            if (idx === activeIndex) {
                if (!line.classList.contains('active')) {
                    line.classList.add('active');
                    // Scroll to active lyric
                    const parentCenter = lyricsContent.parentElement.clientHeight / 2;
                    const lineOffset = line.offsetTop + (line.clientHeight / 2);
                    const offset = lineOffset - parentCenter;
                    lyricsContent.style.transform = `translateY(-${Math.max(0, offset)}px)`;
                }
            } else {
                line.classList.remove('active');
            }
        });
    }

    requestAnimationFrame(updateLyricsSync);
};

const startPolling = () => {
    fetchTrack();
    applySettings();
    setInterval(fetchTrack, 2000); // Fetch every 2 seconds to keep progress relatively synced
    setInterval(applySettings, 5000); // Fetch settings every 5 seconds
};

// Start app
checkAuthStatus();
