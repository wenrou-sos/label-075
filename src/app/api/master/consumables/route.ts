import { NextResponse } from 'next/server';
import { consumables } from '@/lib/mock-data';
import type { Consumable } from '@/lib/types';

export async function GET() {
  return NextResponse.json(consumables);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, specification, model, category, unit, unitPrice, isImplant, supplierId, supplierName } = body as {
    name: string;
    specification: string;
    model: string;
    category: string;
    unit: string;
    unitPrice: number;
    isImplant: boolean;
    supplierId: string;
    supplierName?: string;
  };

  const newConsumable: Consumable = {
    id: `c${Date.now()}`,
    name,
    specification,
    model,
    category,
    unit,
    unitPrice,
    isImplant,
    supplierId,
    supplierName,
    createdAt: new Date().toISOString().split('T')[0],
  };

  consumables.push(newConsumable);
  return NextResponse.json(newConsumable, { status: 201 });
}
