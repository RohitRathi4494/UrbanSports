import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const { email } = await request.json();
    const { v4: uuid } = require('uuid');

    const existing = await db.prepare('SELECT id FROM newsletter_subscribers WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json({ message: 'Already subscribed!' });
    }

    await db.prepare('INSERT INTO newsletter_subscribers (id, email) VALUES (?, ?)').run(uuid(), email);
    return NextResponse.json({ message: 'Subscribed successfully!' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
