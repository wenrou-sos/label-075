import { NextResponse } from 'next/server';
import { requisitions } from '@/lib/mock-data';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { fulfillItems } = body as {
    fulfillItems: { itemId: string; fulfilledQty: number; inventoryId: string }[];
  };

  const requisition = requisitions.find((r) => r.id === id);
  if (!requisition) {
    return NextResponse.json({ error: '领用单不存在' }, { status: 404 });
  }

  const updatedItems = requisition.items.map((item) => {
    const fulfill = fulfillItems.find((f) => f.itemId === item.id);
    if (fulfill) {
      return {
        ...item,
        fulfilledQty: item.fulfilledQty + fulfill.fulfilledQty,
        status: fulfill.fulfilledQty >= item.requestedQty ? 'fulfilled' as const : 'partial' as const,
      };
    }
    return item;
  });

  const allFulfilled = updatedItems.every((i) => i.status === 'fulfilled');
  const anyFulfilled = updatedItems.some((i) => i.fulfilledQty > 0);

  return NextResponse.json({
    requisition: {
      ...requisition,
      items: updatedItems,
      status: allFulfilled ? 'fulfilled' as const : anyFulfilled ? 'partial' as const : 'pending' as const,
    },
    inventoryDeducted: fulfillItems.map((fi) => ({
      inventoryId: fi.inventoryId,
      deductedQty: fi.fulfilledQty,
    })),
  });
}
