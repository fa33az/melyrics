export const fetchLyricsLRCLIB = async (trackName, artistName, albumName, durationMs) => {
    try {
        const url = new URL('https://lrclib.net/api/get');
        url.searchParams.append('track_name', trackName);
        url.searchParams.append('artist_name', artistName);
        if (albumName) url.searchParams.append('album_name', albumName);
        if (durationMs) url.searchParams.append('duration', Math.floor(durationMs / 1000).toString());

        const response = await fetch(url.toString());
        if (!response.ok) return null;

        const data = await response.json();
        return data; // { syncedLyrics, plainLyrics }
    } catch (err) {
        console.error('LRCLIB fetch error:', err);
        return null;
    }
};

export const fetchLyricsOvh = async (trackName, artistName) => {
    try {
        const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artistName)}/${encodeURIComponent(trackName)}`);
        if (!response.ok) return null;

        const data = await response.json();
        return { plainLyrics: data.lyrics };
    } catch (err) {
        console.error('Lyrics.ovh fetch error:', err);
        return null;
    }
};

export const getLyrics = async (trackName, artistName, albumName, durationMs) => {
    let lyrics = await fetchLyricsLRCLIB(trackName, artistName, albumName, durationMs);
    
    if (!lyrics || (!lyrics.syncedLyrics && !lyrics.plainLyrics)) {
        console.log('Falling back to lyrics.ovh');
        const ovhLyrics = await fetchLyricsOvh(trackName, artistName);
        if (ovhLyrics && ovhLyrics.plainLyrics) {
            lyrics = {
                syncedLyrics: null,
                plainLyrics: ovhLyrics.plainLyrics
            };
        } else {
            return null;
        }
    }
    
    return {
        syncedLyrics: lyrics.syncedLyrics || null,
        plainLyrics: lyrics.plainLyrics || null
    };
};
