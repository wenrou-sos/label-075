import { NextResponse } from 'next/server';
import { purchasePlans } from '@/lib/mock-data';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { action, reviewItems } = body as {
    action: 'approve' | 'reject';
    reviewItems?: { id: string; status: 'approved' | 'rejected' }[];
  };

  const plan = purchasePlans.find((p) => p.id === id);
  if (!plan) {
    return NextResponse.json({ error: '采购计划不存在' }, { status: 404 });
  }

  const updatedPlan = {
    ...plan,
    status: action === 'approve' ? 'approved' : 'rejected' as const,
    items: plan.items.map((item) => {
      const reviewItem = reviewItems?.find((ri) => ri.id === item.id);
      if (reviewItem) {
        return { ...item, status: reviewItem.status };
      }
      return { ...item, status: action === 'approve' ? 'approved' as const : 'rejected' as const };
    }),
  };

  return NextResponse.json(updatedPlan);
}
