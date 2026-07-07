import { NextResponse } from 'next/server';
import { getTokens } from '../../../../legacy_src/store.js';

export const dynamic = 'force-dynamic';

export async function GET() {
    const tokens = await getTokens();
    return NextResponse.json({ authenticated: !!tokens.accessToken });
}
