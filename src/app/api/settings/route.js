import { NextResponse } from 'next/server';
import { getSettings, saveSettings } from '../../../../legacy_src/settings.js';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json(await getSettings());
}

export async function POST(request) {
    try {
        const body = await request.json();
        const updated = await saveSettings(body);
        return NextResponse.json(updated);
    } catch (err) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
