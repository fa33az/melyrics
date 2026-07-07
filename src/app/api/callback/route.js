import { NextResponse } from 'next/server';
import { getAccessToken } from '../../../../legacy_src/services/spotify.js';
import { store } from '../../../../legacy_src/store.js';

export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) return new NextResponse(`Error: ${error}`, { status: 400 });
    if (!code) return new NextResponse('No code', { status: 400 });

    try {
        const data = await getAccessToken(
            process.env.SPOTIFY_CLIENT_ID,
            process.env.SPOTIFY_CLIENT_SECRET,
            process.env.SPOTIFY_REDIRECT_URI,
            code
        );

        // Store globally. TODO: Move to Vercel KV for Serverless deployments
        store.accessToken = data.access_token;
        store.refreshToken = data.refresh_token;
        
        return NextResponse.redirect(new URL('/', request.url));
    } catch (err) {
        return new NextResponse('Auth failed', { status: 500 });
    }
}
