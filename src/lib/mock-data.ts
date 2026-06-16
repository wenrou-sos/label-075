import {
  Department,
  Supplier,
  Consumable,
  PurchasePlan,
  PurchaseOrder,
  Delivery,
  Inventory,
  Requisition,
  UsageRecord,
  Settlement,
  DashboardData,
} from './types';

export const departments: Department[] = [
  { id: 'd1', name: '心内科', code: 'XNK', type: 'clinical', createdAt: '2025-01-01' },
  { id: 'd2', name: '骨科', code: 'GK', type: 'clinical', createdAt: '2025-01-01' },
  { id: 'd3', name: '眼科', code: 'YK', type: 'clinical', createdAt: '2025-01-01' },
  { id: 'd4', name: '神经外科', code: 'SJWK', type: 'clinical', createdAt: '2025-01-01' },
  { id: 'd5', name: '普外科', code: 'PWK', type: 'clinical', createdAt: '2025-01-01' },
  { id: 'd6', name: '介入科', code: 'JRK', type: 'clinical', createdAt: '2025-01-01' },
  { id: 'd7', name: 'ICU', code: 'ICU', type: 'clinical', createdAt: '2025-01-01' },
  { id: 'd8', name: '库房', code: 'KF', type: 'warehouse', createdAt: '2025-01-01' },
];

export const suppliers: Supplier[] = [
  { id: 's1', name: '美敦力医疗', code: 'MDT', contact: '张伟', phone: '13800001111', isConsignment: true, createdAt: '2025-01-01' },
  { id: 's2', name: '强生医疗', code: 'JNJ', contact: '李明', phone: '13800002222', isConsignment: true, createdAt: '2025-01-01' },
  { id: 's3', name: '雅培医疗', code: 'ABT', contact: '王芳', phone: '13800003333', isConsignment: false, createdAt: '2025-01-01' },
  { id: 's4', name: '波科国际', code: 'BSX', contact: '赵磊', phone: '13800004444', isConsignment: true, createdAt: '2025-01-01' },
  { id: 's5', name: '爱尔康眼科', code: 'ALC', contact: '刘洋', phone: '13800005555', isConsignment: false, createdAt: '2025-01-01' },
];

export const consumables: Consumable[] = [
  { id: 'c1', name: '药物洗脱支架', specification: '3.0×18mm', model: 'RESOLUTE', category: '心血管介入', unit: '个', unitPrice: 12800, isImplant: true, supplierId: 's1', supplierName: '美敦力医疗', createdAt: '2025-01-01' },
  { id: 'c2', name: '药物洗脱支架', specification: '3.5×24mm', model: 'RESOLUTE', category: '心血管介入', unit: '个', unitPrice: 14500, isImplant: true, supplierId: 's1', supplierName: '美敦力医疗', createdAt: '2025-01-01' },
  { id: 'c3', name: '球囊导管', specification: '2.5×15mm', model: 'NC', category: '心血管介入', unit: '个', unitPrice: 3600, isImplant: false, supplierId: 's1', supplierName: '美敦力医疗', createdAt: '2025-01-01' },
  { id: 'c4', name: '人工髋关节', specification: '标准型', model: 'PFC', category: '骨科植入', unit: '套', unitPrice: 28000, isImplant: true, supplierId: 's2', supplierName: '强生医疗', createdAt: '2025-01-01' },
  { id: 'c5', name: '人工膝关节', specification: '后稳定型', model: 'PFC', category: '骨科植入', unit: '套', unitPrice: 32000, isImplant: true, supplierId: 's2', supplierName: '强生医疗', createdAt: '2025-01-01' },
  { id: 'c6', name: '脊柱内固定系统', specification: '钛合金', model: 'VIPER', category: '骨科植入', unit: '套', unitPrice: 45000, isImplant: true, supplierId: 's2', supplierName: '强生医疗', createdAt: '2025-01-01' },
  { id: 'c7', name: '人工晶状体', specification: '单焦点', model: 'SN60WF', category: '眼科', unit: '个', unitPrice: 5800, isImplant: true, supplierId: 's5', supplierName: '爱尔康眼科', createdAt: '2025-01-01' },
  { id: 'c8', name: '人工晶状体', specification: '多焦点', model: 'SN6AD1', category: '眼科', unit: '个', unitPrice: 12000, isImplant: true, supplierId: 's5', supplierName: '爱尔康眼科', createdAt: '2025-01-01' },
  { id: 'c9', name: '起搏器', specification: '双腔', model: 'ADAPTIA', category: '心血管介入', unit: '个', unitPrice: 38000, isImplant: true, supplierId: 's3', supplierName: '雅培医疗', createdAt: '2025-01-01' },
  { id: 'c10', name: '封堵器', specification: '房间隔', model: 'AMPLATZER', category: '心血管介入', unit: '个', unitPrice: 22000, isImplant: true, supplierId: 's4', supplierName: '波科国际', createdAt: '2025-01-01' },
  { id: 'c11', name: '导管鞘组', specification: '6F', model: 'ULTRA', category: '心血管介入', unit: '套', unitPrice: 1200, isImplant: false, supplierId: 's4', supplierName: '波科国际', createdAt: '2025-01-01' },
  { id: 'c12', name: '引导导管', specification: '6F JR4.0', model: 'VISTA', category: '心血管介入', unit: '根', unitPrice: 1800, isImplant: false, supplierId: 's4', supplierName: '波科国际', createdAt: '2025-01-01' },
];

export const purchasePlans: PurchasePlan[] = [
  {
    id: 'pp1',
    departmentId: 'd1',
    departmentName: '心内科',
    status: 'approved',
    createdAt: '2026-05-20',
    items: [
      { id: 'pp1i1', purchasePlanId: 'pp1', consumableId: 'c1', consumableName: '药物洗脱支架', specification: '3.0×18mm', unitPrice: 12800, quantity: 10, urgency: 'urgent', status: 'approved' },
      { id: 'pp1i2', purchasePlanId: 'pp1', consumableId: 'c3', consumableName: '球囊导管', specification: '2.5×15mm', unitPrice: 3600, quantity: 20, urgency: 'routine', status: 'approved' },
    ],
  },
  {
    id: 'pp2',
    departmentId: 'd2',
    departmentName: '骨科',
    status: 'approved',
    createdAt: '2026-05-22',
    items: [
      { id: 'pp2i1', purchasePlanId: 'pp2', consumableId: 'c4', consumableName: '人工髋关节', specification: '标准型', unitPrice: 28000, quantity: 5, urgency: 'routine', status: 'approved' },
      { id: 'pp2i2', purchasePlanId: 'pp2', consumableId: 'c5', consumableName: '人工膝关节', specification: '后稳定型', unitPrice: 32000, quantity: 5, urgency: 'urgent', status: 'approved' },
    ],
  },
  {
    id: 'pp3',
    departmentId: 'd3',
    departmentName: '眼科',
    status: 'pending',
    createdAt: '2026-06-10',
    items: [
      { id: 'pp3i1', purchasePlanId: 'pp3', consumableId: 'c7', consumableName: '人工晶状体', specification: '单焦点', unitPrice: 5800, quantity: 15, urgency: 'routine', status: 'pending' },
      { id: 'pp3i2', purchasePlanId: 'pp3', consumableId: 'c8', consumableName: '人工晶状体', specification: '多焦点', unitPrice: 12000, quantity: 8, urgency: 'routine', status: 'pending' },
    ],
  },
  {
    id: 'pp4',
    departmentId: 'd1',
    departmentName: '心内科',
    status: 'pending',
    createdAt: '2026-06-12',
    items: [
      { id: 'pp4i1', purchasePlanId: 'pp4', consumableId: 'c9', consumableName: '起搏器', specification: '双腔', unitPrice: 38000, quantity: 3, urgency: 'urgent', status: 'pending' },
      { id: 'pp4i2', purchasePlanId: 'pp4', consumableId: 'c10', consumableName: '封堵器', specification: '房间隔', unitPrice: 22000, quantity: 4, urgency: 'routine', status: 'pending' },
    ],
  },
  {
    id: 'pp5',
    departmentId: 'd4',
    departmentName: '神经外科',
    status: 'ordered',
    createdAt: '2026-06-05',
    items: [
      { id: 'pp5i1', purchasePlanId: 'pp5', consumableId: 'c6', consumableName: '脊柱内固定系统', specification: '钛合金', unitPrice: 45000, quantity: 3, urgency: 'routine', status: 'approved' },
    ],
  },
];

export const purchaseOrders: PurchaseOrder[] = [
  { id: 'po1', purchasePlanId: 'pp1', supplierId: 's1', supplierName: '美敦力医疗', status: 'delivered', createdAt: '2026-05-25' },
  { id: 'po2', purchasePlanId: 'pp2', supplierId: 's2', supplierName: '强生医疗', status: 'confirmed', createdAt: '2026-05-28' },
  { id: 'po3', purchasePlanId: 'pp5', supplierId: 's2', supplierName: '强生医疗', status: 'pending', createdAt: '2026-06-08' },
];

export const deliveries: Delivery[] = [
  {
    id: 'dl1',
    purchaseOrderId: 'po1',
    supplierId: 's1',
    supplierName: '美敦力医疗',
    deliveryNoteNo: 'MDT-20260601-001',
    status: 'accepted',
    createdAt: '2026-06-01',
    items: [
      { id: 'dl1i1', deliveryId: 'dl1', consumableId: 'c1', consumableName: '药物洗脱支架', specification: '3.0×18mm', batchNo: 'B202605001', expiryDate: '2028-05-01', deliveredQty: 10, acceptedQty: 10 },
      { id: 'dl1i2', deliveryId: 'dl1', consumableId: 'c3', consumableName: '球囊导管', specification: '2.5×15mm', batchNo: 'B202605002', expiryDate: '2028-08-15', deliveredQty: 20, acceptedQty: 20 },
    ],
  },
  {
    id: 'dl2',
    purchaseOrderId: 'po1',
    supplierId: 's1',
    supplierName: '美敦力医疗',
    deliveryNoteNo: 'MDT-20260610-002',
    status: 'pending',
    createdAt: '2026-06-10',
    items: [
      { id: 'dl2i1', deliveryId: 'dl2', consumableId: 'c2', consumableName: '药物洗脱支架', specification: '3.5×24mm', batchNo: 'B202606003', expiryDate: '2028-06-30', deliveredQty: 8, acceptedQty: 0 },
      { id: 'dl2i2', deliveryId: 'dl2', consumableId: 'c11', consumableName: '导管鞘组', specification: '6F', batchNo: 'B202606004', expiryDate: '2028-12-01', deliveredQty: 30, acceptedQty: 0 },
    ],
  },
  {
    id: 'dl3',
    purchaseOrderId: 'po2',
    supplierId: 's2',
    supplierName: '强生医疗',
    deliveryNoteNo: 'JNJ-20260608-001',
    status: 'pending',
    createdAt: '2026-06-08',
    items: [
      { id: 'dl3i1', deliveryId: 'dl3', consumableId: 'c4', consumableName: '人工髋关节', specification: '标准型', batchNo: 'B202606101', expiryDate: '2029-01-15', deliveredQty: 5, acceptedQty: 0 },
      { id: 'dl3i2', deliveryId: 'dl3', consumableId: 'c5', consumableName: '人工膝关节', specification: '后稳定型', batchNo: 'B202606102', expiryDate: '2029-03-20', deliveredQty: 5, acceptedQty: 0 },
    ],
  },
];

export const inventory: Inventory[] = [
  { id: 'inv1', consumableId: 'c1', consumableName: '药物洗脱支架', specification: '3.0×18mm', batchNo: 'B202605001', expiryDate: '2028-05-01', quantity: 6, location: 'A区-01-03', supplierId: 's1', supplierName: '美敦力医疗', isConsignment: true, unitPrice: 12800, createdAt: '2026-06-01' },
  { id: 'inv2', consumableId: 'c3', consumableName: '球囊导管', specification: '2.5×15mm', batchNo: 'B202605002', expiryDate: '2028-08-15', quantity: 15, location: 'A区-02-01', supplierId: 's1', supplierName: '美敦力医疗', isConsignment: true, unitPrice: 3600, createdAt: '2026-06-01' },
  { id: 'inv3', consumableId: 'c7', consumableName: '人工晶状体', specification: '单焦点', batchNo: 'B202511201', expiryDate: '2026-09-15', quantity: 5, location: 'C区-01-05', supplierId: 's5', supplierName: '爱尔康眼科', isConsignment: false, unitPrice: 5800, createdAt: '2025-12-01' },
  { id: 'inv4', consumableId: 'c7', consumableName: '人工晶状体', specification: '单焦点', batchNo: 'B202601102', expiryDate: '2026-08-10', quantity: 3, location: 'C区-01-06', supplierId: 's5', supplierName: '爱尔康眼科', isConsignment: false, unitPrice: 5800, createdAt: '2026-02-01' },
  { id: 'inv5', consumableId: 'c8', consumableName: '人工晶状体', specification: '多焦点', batchNo: 'B202602050', expiryDate: '2026-07-20', quantity: 2, location: 'C区-02-01', supplierId: 's5', supplierName: '爱尔康眼科', isConsignment: false, unitPrice: 12000, createdAt: '2026-03-01' },
  { id: 'inv6', consumableId: 'c9', consumableName: '起搏器', specification: '双腔', batchNo: 'B202604011', expiryDate: '2029-04-30', quantity: 2, location: 'B区-03-02', supplierId: 's3', supplierName: '雅培医疗', isConsignment: false, unitPrice: 38000, createdAt: '2026-04-15' },
  { id: 'inv7', consumableId: 'c10', consumableName: '封堵器', specification: '房间隔', batchNo: 'B202603080', expiryDate: '2029-06-15', quantity: 4, location: 'A区-04-01', supplierId: 's4', supplierName: '波科国际', isConsignment: true, unitPrice: 22000, createdAt: '2026-04-01' },
  { id: 'inv8', consumableId: 'c11', consumableName: '导管鞘组', specification: '6F', batchNo: 'B202603090', expiryDate: '2028-11-30', quantity: 25, location: 'A区-05-02', supplierId: 's4', supplierName: '波科国际', isConsignment: true, unitPrice: 1200, createdAt: '2026-04-01' },
  { id: 'inv9', consumableId: 'c12', consumableName: '引导导管', specification: '6F JR4.0', batchNo: 'B202603100', expiryDate: '2028-10-15', quantity: 18, location: 'A区-05-03', supplierId: 's4', supplierName: '波科国际', isConsignment: true, unitPrice: 1800, createdAt: '2026-04-01' },
];

export const requisitions: Requisition[] = [
  {
    id: 'rq1',
    departmentId: 'd1',
    departmentName: '心内科',
    status: 'fulfilled',
    createdAt: '2026-06-03',
    items: [
      { id: 'rq1i1', requisitionId: 'rq1', consumableId: 'c1', consumableName: '药物洗脱支架', specification: '3.0×18mm', unitPrice: 12800, requestedQty: 2, fulfilledQty: 2, status: 'fulfilled' },
      { id: 'rq1i2', requisitionId: 'rq1', consumableId: 'c3', consumableName: '球囊导管', specification: '2.5×15mm', unitPrice: 3600, requestedQty: 3, fulfilledQty: 3, status: 'fulfilled' },
    ],
  },
  {
    id: 'rq2',
    departmentId: 'd3',
    departmentName: '眼科',
    status: 'fulfilled',
    createdAt: '2026-06-05',
    items: [
      { id: 'rq2i1', requisitionId: 'rq2', consumableId: 'c7', consumableName: '人工晶状体', specification: '单焦点', unitPrice: 5800, requestedQty: 2, fulfilledQty: 2, status: 'fulfilled' },
    ],
  },
  {
    id: 'rq3',
    departmentId: 'd1',
    departmentName: '心内科',
    status: 'pending',
    createdAt: '2026-06-12',
    items: [
      { id: 'rq3i1', requisitionId: 'rq3', consumableId: 'c1', consumableName: '药物洗脱支架', specification: '3.0×18mm', unitPrice: 12800, requestedQty: 2, fulfilledQty: 0, status: 'pending' },
      { id: 'rq3i2', requisitionId: 'rq3', consumableId: 'c11', consumableName: '导管鞘组', specification: '6F', unitPrice: 1200, requestedQty: 5, fulfilledQty: 0, status: 'pending' },
      { id: 'rq3i3', requisitionId: 'rq3', consumableId: 'c12', consumableName: '引导导管', specification: '6F JR4.0', unitPrice: 1800, requestedQty: 5, fulfilledQty: 0, status: 'pending' },
    ],
  },
  {
    id: 'rq4',
    departmentId: 'd7',
    departmentName: 'ICU',
    status: 'pending',
    createdAt: '2026-06-13',
    items: [
      { id: 'rq4i1', requisitionId: 'rq4', consumableId: 'c9', consumableName: '起搏器', specification: '双腔', unitPrice: 38000, requestedQty: 1, fulfilledQty: 0, status: 'pending' },
    ],
  },
];

export const usageRecords: UsageRecord[] = [
  {
    id: 'ur1',
    departmentId: 'd1',
    departmentName: '心内科',
    operatingRoom: 'OR-1',
    usedAt: '2026-06-04T09:30:00',
    createdAt: '2026-06-04',
    items: [
      { id: 'ur1i1', usageRecordId: 'ur1', consumableId: 'c1', consumableName: '药物洗脱支架', specification: '3.0×18mm', inventoryId: 'inv1', usedQty: 1, isImplant: true, patientId: 'P2026060401' },
      { id: 'ur1i2', usageRecordId: 'ur1', consumableId: 'c3', consumableName: '球囊导管', specification: '2.5×15mm', inventoryId: 'inv2', usedQty: 1, isImplant: false, patientId: null },
    ],
  },
  {
    id: 'ur2',
    departmentId: 'd3',
    departmentName: '眼科',
    operatingRoom: 'OR-3',
    usedAt: '2026-06-06T14:00:00',
    createdAt: '2026-06-06',
    items: [
      { id: 'ur2i1', usageRecordId: 'ur2', consumableId: 'c7', consumableName: '人工晶状体', specification: '单焦点', inventoryId: 'inv3', usedQty: 1, isImplant: true, patientId: 'P2026060602' },
    ],
  },
  {
    id: 'ur3',
    departmentId: 'd1',
    departmentName: '心内科',
    operatingRoom: 'OR-1',
    usedAt: '2026-06-10T10:00:00',
    createdAt: '2026-06-10',
    items: [
      { id: 'ur3i1', usageRecordId: 'ur3', consumableId: 'c1', consumableName: '药物洗脱支架', specification: '3.0×18mm', inventoryId: 'inv1', usedQty: 1, isImplant: true, patientId: 'P2026061003' },
      { id: 'ur3i2', usageRecordId: 'ur3', consumableId: 'c3', consumableName: '球囊导管', specification: '2.5×15mm', inventoryId: 'inv2', usedQty: 2, isImplant: false, patientId: null },
    ],
  },
];

export const settlements: Settlement[] = [
  {
    id: 'st1',
    supplierId: 's1',
    supplierName: '美敦力医疗',
    month: '2026-05',
    totalAmount: 25600,
    status: 'confirmed',
    createdAt: '2026-06-05',
    items: [
      { id: 'st1i1', settlementId: 'st1', consumableId: 'c1', consumableName: '药物洗脱支架', quantity: 2, unitPrice: 12800, amount: 25600 },
    ],
  },
  {
    id: 'st2',
    supplierId: 's5',
    supplierName: '爱尔康眼科',
    month: '2026-05',
    totalAmount: 5800,
    status: 'draft',
    createdAt: '2026-06-05',
    items: [
      { id: 'st2i1', settlementId: 'st2', consumableId: 'c7', consumableName: '人工晶状体', quantity: 1, unitPrice: 5800, amount: 5800 },
    ],
  },
  {
    id: 'st3',
    supplierId: 's4',
    supplierName: '波科国际',
    month: '2026-05',
    totalAmount: 22000,
    status: 'paid',
    createdAt: '2026-06-05',
    items: [
      { id: 'st3i1', settlementId: 'st3', consumableId: 'c10', consumableName: '封堵器', quantity: 1, unitPrice: 22000, amount: 22000 },
    ],
  },
];

export const dashboardData: DashboardData = {
  totalInventoryValue: 1123400,
  nearExpiryRatio: 12.5,
  nearExpiryItems: [
    { name: '人工晶状体(多焦点)', expiryDate: '2026-07-20', daysLeft: 35 },
    { name: '人工晶状体(单焦点)', expiryDate: '2026-08-10', daysLeft: 56 },
    { name: '人工晶状体(单焦点)', expiryDate: '2026-09-15', daysLeft: 92 },
  ],
  departmentRanking: [
    { departmentName: '心内科', amount: 358400 },
    { departmentName: '骨科', amount: 300000 },
    { departmentName: '眼科', amount: 120000 },
    { departmentName: 'ICU', amount: 38000 },
    { departmentName: '神经外科', amount: 135000 },
  ],
  pendingTasks: [
    { type: 'purchase', count: 2, label: '待审核申购', link: '/purchase' },
    { type: 'acceptance', count: 2, label: '待验收订单', link: '/acceptance' },
    { type: 'requisition', count: 2, label: '待出库领用', link: '/requisition' },
  ],
};
