import { NextResponse } from 'next/server';
import { suppliers } from '@/lib/mock-data';
import type { Supplier } from '@/lib/types';

export async function GET() {
  return NextResponse.json(suppliers);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, code, contact, phone, isConsignment } = body as {
    name: string;
    code: string;
    contact: string;
    phone: string;
    isConsignment: boolean;
  };

  const newSupplier: Supplier = {
    id: `s${Date.now()}`,
    name,
    code,
    contact,
    phone,
    isConsignment,
    createdAt: new Date().toISOString().split('T')[0],
  };

  suppliers.push(newSupplier);
  return NextResponse.json(newSupplier, { status: 201 });
}
