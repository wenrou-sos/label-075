import { NextResponse } from 'next/server';
import { departments } from '@/lib/mock-data';
import type { Department } from '@/lib/types';

export async function GET() {
  return NextResponse.json(departments);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, code, type } = body as { name: string; code: string; type: string };

  const newDepartment: Department = {
    id: `d${Date.now()}`,
    name,
    code,
    type,
    createdAt: new Date().toISOString().split('T')[0],
  };

  return NextResponse.json(newDepartment, { status: 201 });
}
