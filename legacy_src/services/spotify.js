export const getSpotifyAuthUrl = (clientId, redirectUri) => {
    const scopes = ['user-read-currently-playing', 'user-read-playback-state'];
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', scopes.join(' '));
    return authUrl.toString();
};

export const getAccessToken = async (clientId, clientSecret, redirectUri, code) => {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri
        })
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch access token');
    }
    
    return response.json();
};

export const getCurrentlyPlaying = async (accessToken) => {
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (response.status === 204) {
        return null; // Nothing playing
    }

    if (!response.ok) {
        throw new Error(`Spotify API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
};
