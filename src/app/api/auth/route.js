import { NextResponse } from 'next/server';
import { getSpotifyAuthUrl } from '../../../../legacy_src/services/spotify.js';

export async function GET(request) {
    const authUrl = getSpotifyAuthUrl(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_REDIRECT_URI);
    return NextResponse.redirect(authUrl);
}
