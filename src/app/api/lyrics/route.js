import { NextResponse } from 'next/server';
import { getLyrics } from '../../../../legacy_src/services/lyrics.js';
import { getTokens } from '../../../../legacy_src/store.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const tokens = await getTokens();
    if (!tokens.accessToken) {
        return NextResponse.json({ error: 'Server not authenticated' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const trackName = searchParams.get('trackName');
    const artistName = searchParams.get('artistName');
    const albumName = searchParams.get('albumName');
    const durationMs = searchParams.get('durationMs');

    if (!trackName || !artistName) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    try {
        const lyrics = await getLyrics(trackName, artistName, albumName, durationMs);
        if (!lyrics) return NextResponse.json({ error: 'Lyrics not found' }, { status: 404 });
        return NextResponse.json(lyrics);
    } catch (err) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
