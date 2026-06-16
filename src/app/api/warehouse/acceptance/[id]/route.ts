import { NextResponse } from 'next/server';
import { deliveries, inventory, suppliers, consumables } from '@/lib/mock-data';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { acceptedItems } = body as {
    acceptedItems: { itemId: string; acceptedQty: number }[];
  };

  const delivery = deliveries.find((d) => d.id === id);
  if (!delivery) {
    return NextResponse.json({ error: '送货单不存在' }, { status: 404 });
  }

  const consumableMap = new Map(consumables.map((c) => [c.id, c]));

  const updatedItems = delivery.items.map((item) => {
    const accepted = acceptedItems.find((a) => a.itemId === item.id);
    if (accepted) {
      return { ...item, acceptedQty: accepted.acceptedQty };
    }
    return item;
  });

  const supplier = suppliers.find((s) => s.id === delivery.supplierId);
  const newInventoryEntries = updatedItems
    .filter((item) => item.acceptedQty > 0)
    .map((item, index) => {
      const consumable = consumableMap.get(item.consumableId);
      return {
        id: `inv${Date.now()}${index}`,
        consumableId: item.consumableId,
        consumableName: consumable?.name ?? item.consumableName,
        specification: consumable?.specification ?? item.specification,
        batchNo: item.batchNo,
        expiryDate: item.expiryDate,
        quantity: item.acceptedQty,
        location: '待分配',
        supplierId: delivery.supplierId,
        supplierName: delivery.supplierName,
        isConsignment: supplier?.isConsignment ?? false,
        unitPrice: consumable?.unitPrice ?? 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
    });

  inventory.push(...newInventoryEntries);

  const updatedDelivery = { ...delivery, items: updatedItems, status: 'accepted' as const };
  const deliveryIndex = deliveries.findIndex((d) => d.id === id);
  if (deliveryIndex >= 0) {
    deliveries[deliveryIndex] = updatedDelivery;
  }

  return NextResponse.json({
    delivery: updatedDelivery,
    inventoryAdded: newInventoryEntries,
  });
}
