import { NextResponse } from 'next/server';
import { deliveries } from '@/lib/mock-data';
import type { Delivery } from '@/lib/types';

export async function GET() {
  return NextResponse.json(deliveries);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { purchaseOrderId, supplierId, supplierName, deliveryNoteNo, items } = body as {
    purchaseOrderId: string;
    supplierId: string;
    supplierName: string;
    deliveryNoteNo: string;
    items: { consumableId: string; batchNo: string; expiryDate: string; deliveredQty: number }[];
  };

  const newDelivery: Delivery = {
    id: `dl${Date.now()}`,
    purchaseOrderId,
    supplierId,
    supplierName,
    deliveryNoteNo,
    status: 'pending',
    items: items.map((item, index) => ({
      id: `dl${Date.now()}i${index}`,
      deliveryId: `dl${Date.now()}`,
      consumableId: item.consumableId,
      batchNo: item.batchNo,
      expiryDate: item.expiryDate,
      deliveredQty: item.deliveredQty,
      acceptedQty: 0,
    })),
    createdAt: new Date().toISOString().split('T')[0],
  };

  return NextResponse.json(newDelivery, { status: 201 });
}
