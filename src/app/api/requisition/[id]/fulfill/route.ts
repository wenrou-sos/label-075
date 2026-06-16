import { NextResponse } from 'next/server';
import { requisitions, inventory } from '@/lib/mock-data';

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
  const newStatus = allFulfilled ? 'fulfilled' as const : anyFulfilled ? 'partial' as const : 'pending' as const;

  const updatedRequisition = {
    ...requisition,
    items: updatedItems,
    status: newStatus,
  };

  const reqIndex = requisitions.findIndex((r) => r.id === id);
  if (reqIndex >= 0) {
    requisitions[reqIndex] = updatedRequisition;
  }

  fulfillItems.forEach((fi) => {
    const invItem = inventory.find((i) => i.id === fi.inventoryId);
    if (invItem) {
      invItem.quantity = Math.max(0, invItem.quantity - fi.fulfilledQty);
    }
  });

  return NextResponse.json({
    requisition: updatedRequisition,
    inventoryDeducted: fulfillItems.map((fi) => ({
      inventoryId: fi.inventoryId,
      deductedQty: fi.fulfilledQty,
    })),
  });
}
