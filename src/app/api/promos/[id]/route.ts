import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    await db.prepare('DELETE FROM promo_codes WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Promo code deleted' });
  } catch (error) {
    console.error('Delete promo error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
