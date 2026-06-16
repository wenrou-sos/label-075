import { NextResponse } from 'next/server';
import { purchasePlans } from '@/lib/mock-data';
import type { PurchasePlan } from '@/lib/types';

export async function GET() {
  return NextResponse.json(purchasePlans);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { departmentId, items } = body as { departmentId: string; items: { consumableId: string; quantity: number; urgency: 'routine' | 'urgent' }[] };

  const newPlan: PurchasePlan = {
    id: `pp${Date.now()}`,
    departmentId,
    status: 'pending',
    items: items.map((item, index) => ({
      id: `pp${Date.now()}i${index}`,
      purchasePlanId: `pp${Date.now()}`,
      consumableId: item.consumableId,
      quantity: item.quantity,
      urgency: item.urgency,
      status: 'pending' as const,
    })),
    createdAt: new Date().toISOString().split('T')[0],
  };

  return NextResponse.json(newPlan, { status: 201 });
}
