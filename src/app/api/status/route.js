import { NextResponse } from 'next/server';
import { store } from '../../../../legacy_src/store.js';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({ authenticated: !!store.accessToken });
}
