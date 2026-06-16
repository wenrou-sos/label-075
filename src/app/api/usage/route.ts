import { NextResponse } from 'next/server';
import { usageRecords } from '@/lib/mock-data';
import type { UsageRecord } from '@/lib/types';

export async function GET() {
  return NextResponse.json(usageRecords);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { departmentId, operatingRoom, items } = body as {
    departmentId: string;
    operatingRoom: string;
    items: { consumableId: string; inventoryId: string; usedQty: number; isImplant: boolean; patientId: string | null }[];
  };

  const implantWithoutPatient = items.some((item) => item.isImplant && !item.patientId);
  if (implantWithoutPatient) {
    return NextResponse.json(
      { error: '植入类耗材必须关联患者ID' },
      { status: 400 }
    );
  }

  const newRecord: UsageRecord = {
    id: `ur${Date.now()}`,
    departmentId,
    operatingRoom,
    usedAt: new Date().toISOString(),
    items: items.map((item, index) => ({
      id: `ur${Date.now()}i${index}`,
      usageRecordId: `ur${Date.now()}`,
      consumableId: item.consumableId,
      inventoryId: item.inventoryId,
      usedQty: item.usedQty,
      isImplant: item.isImplant,
      patientId: item.patientId,
    })),
    createdAt: new Date().toISOString().split('T')[0],
  };

  return NextResponse.json(newRecord, { status: 201 });
}
