import { NextResponse } from 'next/server';
import { inventory, consumables } from '@/lib/mock-data';
import type { Inventory } from '@/lib/types';

export const revalidate = 0;

interface NearExpiryItem extends Inventory {
  daysLeft: number;
  warningLevel: 'critical' | 'warning' | 'notice';
}

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const consumableMap = new Map(consumables.map((c) => [c.id, c]));

  const nearExpiryItems: NearExpiryItem[] = inventory
    .map((item) => {
      const expiry = new Date(item.expiryDate);
      expiry.setHours(0, 0, 0, 0);
      const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const consumable = consumableMap.get(item.consumableId);
      return {
        ...item,
        consumableName: consumable?.name ?? item.consumableName,
        specification: consumable?.specification ?? item.specification,
        daysLeft,
      };
    })
    .filter((item) => item.daysLeft <= 180)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .map((item) => ({
      ...item,
      warningLevel: item.daysLeft <= 30 ? 'critical' : item.daysLeft <= 90 ? 'warning' : 'notice',
    }));

  return NextResponse.json(
    {
      total: nearExpiryItems.length,
      criticalCount: nearExpiryItems.filter((i) => i.warningLevel === 'critical').length,
      warningCount: nearExpiryItems.filter((i) => i.warningLevel === 'warning').length,
      noticeCount: nearExpiryItems.filter((i) => i.warningLevel === 'notice').length,
      items: nearExpiryItems,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
