import { NextResponse } from 'next/server';
import { requisitions } from '@/lib/mock-data';
import type { Requisition } from '@/lib/types';

export async function GET() {
  return NextResponse.json(requisitions);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { departmentId, items } = body as {
    departmentId: string;
    items: { consumableId: string; requestedQty: number }[];
  };

  const newRequisition: Requisition = {
    id: `rq${Date.now()}`,
    departmentId,
    status: 'pending',
    items: items.map((item, index) => ({
      id: `rq${Date.now()}i${index}`,
      requisitionId: `rq${Date.now()}`,
      consumableId: item.consumableId,
      requestedQty: item.requestedQty,
      fulfilledQty: 0,
      status: 'pending' as const,
    })),
    createdAt: new Date().toISOString().split('T')[0],
  };

  return NextResponse.json(newRequisition, { status: 201 });
}
