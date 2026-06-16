export interface Department {
  id: string;
  name: string;
  code: string;
  type: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contact: string;
  phone: string;
  isConsignment: boolean;
  createdAt: string;
}

export interface Consumable {
  id: string;
  name: string;
  specification: string;
  model: string;
  category: string;
  unit: string;
  unitPrice: number;
  isImplant: boolean;
  supplierId: string;
  supplierName?: string;
  createdAt: string;
}

export interface PurchasePlan {
  id: string;
  departmentId: string;
  departmentName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'ordered';
  items: PurchasePlanItem[];
  createdAt: string;
}

export interface PurchasePlanItem {
  id: string;
  purchasePlanId: string;
  consumableId: string;
  consumableName?: string;
  specification?: string;
  unitPrice?: number;
  quantity: number;
  urgency: 'routine' | 'urgent';
  status: 'pending' | 'approved' | 'rejected';
}

export interface PurchaseOrder {
  id: string;
  purchasePlanId: string;
  supplierId: string;
  supplierName?: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'completed';
  createdAt: string;
}

export interface Delivery {
  id: string;
  purchaseOrderId: string;
  supplierId: string;
  supplierName?: string;
  deliveryNoteNo: string;
  status: 'pending' | 'accepted' | 'partial' | 'rejected';
  items: DeliveryItem[];
  createdAt: string;
}

export interface DeliveryItem {
  id: string;
  deliveryId: string;
  consumableId: string;
  consumableName?: string;
  specification?: string;
  batchNo: string;
  expiryDate: string;
  deliveredQty: number;
  acceptedQty: number;
}

export interface Inventory {
  id: string;
  consumableId: string;
  consumableName?: string;
  specification?: string;
  batchNo: string;
  expiryDate: string;
  quantity: number;
  location: string;
  supplierId: string;
  supplierName?: string;
  isConsignment: boolean;
  unitPrice?: number;
  createdAt: string;
}

export interface Requisition {
  id: string;
  departmentId: string;
  departmentName?: string;
  status: 'pending' | 'fulfilled' | 'partial' | 'cancelled';
  items: RequisitionItem[];
  createdAt: string;
}

export interface RequisitionItem {
  id: string;
  requisitionId: string;
  consumableId: string;
  consumableName?: string;
  specification?: string;
  unitPrice?: number;
  requestedQty: number;
  fulfilledQty: number;
  status: 'pending' | 'fulfilled' | 'partial';
}

export interface UsageRecord {
  id: string;
  departmentId: string;
  departmentName?: string;
  operatingRoom: string;
  usedAt: string;
  items: UsageRecordItem[];
  createdAt: string;
}

export interface UsageRecordItem {
  id: string;
  usageRecordId: string;
  consumableId: string;
  consumableName?: string;
  specification?: string;
  inventoryId: string;
  usedQty: number;
  isImplant: boolean;
  patientId: string | null;
}

export interface Settlement {
  id: string;
  supplierId: string;
  supplierName?: string;
  month: string;
  totalAmount: number;
  status: 'draft' | 'confirmed' | 'paid';
  items: SettlementItem[];
  createdAt: string;
}

export interface SettlementItem {
  id: string;
  settlementId: string;
  consumableId: string;
  consumableName?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface DashboardData {
  totalInventoryValue: number;
  nearExpiryRatio: number;
  nearExpiryItems: { name: string; expiryDate: string; daysLeft: number }[];
  departmentRanking: { departmentName: string; amount: number }[];
  pendingTasks: { type: string; count: number; label: string; link: string }[];
}
