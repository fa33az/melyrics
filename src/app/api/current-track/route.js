import { NextResponse } from 'next/server';
import { getCurrentlyPlaying } from '../../../../legacy_src/services/spotify.js';
import { getTokens } from '../../../../legacy_src/store.js';

export const dynamic = 'force-dynamic';

export async function GET() {
    const tokens = await getTokens();
    if (!tokens.accessToken) {
        return NextResponse.json({ error: 'Server not authenticated' }, { status: 401 });
    }

    try {
        const data = await getCurrentlyPlaying(tokens.accessToken);
        
        if (!data || !data.item) {
            return NextResponse.json({ isPlaying: false });
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

        return NextResponse.json(trackInfo);
    } catch (err) {
        if (err.message.includes('401')) {
             return NextResponse.json({ error: 'Token expired' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
