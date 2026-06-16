import { NextResponse } from 'next/server';
import { settlements, usageRecords, inventory, suppliers, consumables } from '@/lib/mock-data';
import type { Settlement } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const filtered = month
    ? settlements.filter((s) => s.month === month)
    : settlements;
  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  let month: string;
  try {
    const body = await request.json();
    month = body?.month;
  } catch {
    month = null;
  }
  if (!month) {
    const currentDate = new Date();
    month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  }

  const supplierMap = new Map(suppliers.map((s) => [s.id, s]));
  const consumableMap = new Map(consumables.map((c) => [c.id, c]));
  const inventoryMap = new Map(inventory.map((i) => [i.id, i]));

  const usageBySupplier = new Map<
    string,
    { consumableId: string; consumableName: string; quantity: number; unitPrice: number; amount: number }[]
  >();

  usageRecords.forEach((usage) => {
    const usageDate = usage.usageDate || usage.createdAt || '';
    const usageMonth = usageDate.substring(0, 7);
    if (usageMonth !== month) return;

    usage.items.forEach((item) => {
      if (!item.isImplant) return;
      const inv = inventoryMap.get(item.inventoryId);
      if (!inv?.isConsignment) return;
      const supplierId = inv?.supplierId;
      if (!supplierId) return;

      const c = consumableMap.get(item.consumableId);
      const unitPrice = inv?.unitPrice ?? c?.unitPrice ?? 0;
      const amount = item.usedQty * unitPrice;

      if (!usageBySupplier.has(supplierId)) {
        usageBySupplier.set(supplierId, []);
      }
      usageBySupplier.get(supplierId)!.push({
        consumableId: item.consumableId,
        consumableName: item.consumableName || '',
        quantity: item.usedQty,
        unitPrice,
        amount,
      });
    });
  });

  const existingSupplierIds = new Set(settlements.filter((s) => s.month === month).map((s) => s.supplierId));

  const newSettlements: Settlement[] = [];
  usageBySupplier.forEach((items, supplierId) => {
    if (existingSupplierIds.has(supplierId)) return;

    const supplier = supplierMap.get(supplierId);
    if (!supplier) return;

    const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);
    if (totalAmount === 0) return;

    newSettlements.push({
      id: `st${Date.now()}-${supplierId}`,
      supplierId,
      supplierName: supplier.name,
      month,
      totalAmount,
      status: 'draft',
      items: items.map((item, index) => ({
        id: `st${Date.now()}-${supplierId}-i${index}`,
        settlementId: `st${Date.now()}-${supplierId}`,
        consumableId: item.consumableId,
        consumableName: item.consumableName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
      })),
      createdAt: new Date().toISOString().split('T')[0],
    });
  });

  settlements.push(...newSettlements);

  const filtered = settlements.filter((s) => s.month === month);
  return NextResponse.json(filtered);
}
