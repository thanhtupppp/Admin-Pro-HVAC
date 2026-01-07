# P2/P3 Features Roadmap

## Overview

Implementation roadmap for Phase 2 (P2) và Phase 3 (P3) nice-to-have features to enhance Admin Pro HVAC.

---

## P2 Features (High Value)

### 1. Rich Media Support in Error Code Steps

**Priority:** P2  
**Effort:** Medium (2-3 days)  
**Value:** High - Visual guides improve repair accuracy

**Implementation:**

```typescript
// Extend RepairStep interface
interface RepairStep {
  text: string;
  image?: string; // Firebase Storage URL
  video?: string; // YouTube or Storage URL
  order: number;
}

// Image upload component
const StepImageUpload: React.FC<{ stepIndex: number }> = ({ stepIndex }) => {
  const handleImagePaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        const url = await uploadToStorage(file);
        updateStep(stepIndex, { image: url });
      }
    }
  };
  
  return (
    <div 
      onPaste={handleImagePaste}
      className="border-2 border-dashed p-4"
    >
      Paste image here (Ctrl+V)
    </div>
  );
};
```

---

### 2. A/B Testing for Pricing

**Priority:** P2  
**Effort:** Medium (3-4 days)  
**Value:** Medium - Optimize conversion rates

**Implementation:**

```typescript
interface PricingExperiment {
  id: string;
  name: string;
  variants: PricingVariant[];
  traffic: number; // Percentage of users
  status: 'active' | 'paused' | 'completed';
  metrics: {
    variant: string;
    views: number;
    conversions: number;
    revenue: number;
  }[];
}

// A/B test service
const abTestService = {
  assignVariant: (userId: string, experimentId: string) => {
    // Consistent hashing for same user gets same variant
    const hash = hashCode(userId + experimentId);
    const variants = getExperiment(experimentId).variants;
    return variants[hash % variants.length];
  },
  
  trackConversion: async (userId: string, experimentId: string, amount: number) => {
    const variant = getAssignedVariant(userId, experimentId);
    await firestore.collection('abTestMetrics').add({
      experimentId,
      variant: variant.id,
      userId,
      amount,
      convertedAt: new Date()
    });
  }
};
```

---

### 3. Discount Codes Management

**Priority:** P2  
**Effort:** Small (1-2 days)  
**Value:** Medium - Promotional campaigns

**Implementation:**

```typescript
interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usedCount: number;
  status: 'active' | 'inactive';
}

// Discount validation
const validateDiscount = async (code: string, amount: number): Promise<{
  valid: boolean;
  discount: number;
  message: string;
}> => {
  const doc = await firestore
    .collection('discountCodes')
    .where('code', '==', code.toUpperCase())
    .where('status', '==', 'active')
    .limit(1)
    .get();
  
  if (doc.empty) {
    return { valid: false, discount: 0, message: 'Mã không hợp lệ' };
  }
  
  const discount = doc.docs[0].data() as DiscountCode;
  
  // Check expiry
  if (new Date() > new Date(discount.validTo)) {
    return { valid: false, discount: 0, message: 'Mã đã hết hạn' };
  }
  
  // Check usage limit
  if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
    return { valid: false, discount: 0, message: 'Mã đã hết lượt sử dụng' };
  }
  
  // Calculate discount
  let discountAmount = discount.type === 'percentage'
    ? (amount * discount.value / 100)
    : discount.value;
  
  if (discount.maxDiscount) {
    discountAmount = Math.min(discountAmount, discount.maxDiscount);
  }
  
  return {
    valid: true,
    discount: discountAmount,
    message: `Giảm ${discountAmount.toLocaleString('vi-VN')}đ`
  };
};
```

---

### 4. Invoice PDF Download

**Priority:** P2  
**Effort:** Small (1 day)  
**Value:** Medium - Professional invoicing

**Implementation:**

```typescript
// Using browser print dialog (simplest)
const downloadInvoicePDF = (transaction: Transaction) => {
  const invoiceHTML = `
    <html>
    <head>
      <title>Invoice ${transaction.id}</title>
      <style>
        body { font-family: Arial; padding: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .details { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>HÓA ĐƠN</h1>
        <p>Invoice #${transaction.id}</p>
      </div>
      <div class="details">
        <p><strong>Khách hàng:</strong> ${transaction.userName}</p>
        <p><strong>Ngày:</strong> ${new Date(transaction.createdAt).toLocaleDateString('vi-VN')}</p>
        <p><strong>Số tiền:</strong> ${transaction.amount.toLocaleString('vi-VN')}đ</p>
      </div>
      <table>
        <tr>
          <th>Gói dịch vụ</th>
          <th>Giá</th>
        </tr>
        <tr>
          <td>${transaction.planName}</td>
          <td>${transaction.amount.toLocaleString('vi-VN')}đ</td>
        </tr>
      </table>
    </body>
    </html>
  `;
  
  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow?.document.write(invoiceHTML);
  printWindow?.document.close();
  printWindow?.print();
};
```

---

### 5. Document Tags Management

**Priority:** P2  
**Effort:** Small (1-2 days)  
**Value:** Medium - Better organization

**Implementation:**

```typescript
interface DocumentTag {
  id: string;
  name: string;
  color: string;
  count: number; // Number of documents with this tag
}

// Tag management
const tagService = {
  createTag: async (name: string, color: string) => {
    return await firestore.collection('documentTags').add({
      name,
      color,
      count: 0,
      createdAt: new Date()
    });
  },
  
  addTagToDocument: async (documentId: string, tagId: string) => {
    await firestore.collection('documents').doc(documentId).update({
      tags: FieldValue.arrayUnion(tagId)
    });
    
    // Increment tag count
    await firestore.collection('documentTags').doc(tagId).update({
      count: FieldValue.increment(1)
    });
  },
  
  searchByTag: async (tagId: string) => {
    return await firestore
      .collection('documents')
      .where('tags', 'array-contains', tagId)
      .get();
  }
};
```

---

## P3 Features (Future Enhancements)

### 1. Route Optimization for Dispatch

**Priority:** P3  
**Effort:** Large (1-2 weeks)  
**Value:** High - Save time & fuel

**Implementation Strategy:**

```typescript
// Use Google Maps API or open-source routing
interface RouteOptimization {
  jobs: Job[];
  startLocation: Location;
  optimizedRoute: {
    order: string[]; // Job IDs in optimal order
    totalDistance: number; // km
    totalDuration: number; // minutes
    waypoints: Location[];
  };
}

// Simplified TSP (Traveling Salesman Problem)
const optimizeRoute = async (jobs: Job[], start: Location) => {
  // Use Google Maps Directions API with waypoints optimization
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?` +
    `origin=${start.lat},${start.lng}&` +
    `destination=${start.lat},${start.lng}&` +
    `waypoints=optimize:true|${jobs.map(j => 
      `${j.location.lat},${j.location.lng}`
    ).join('|')}&` +
    `key=${GOOGLE_MAPS_API_KEY}`
  );
  
  const data = await response.json();
  return parseOptimizedRoute(data);
};
```

---

### 2. Van Stock & Inventory

**Priority:** P3  
**Effort:** Medium (1 week)  
**Value:** Medium - Prevent stockouts

**Implementation:**

```typescript
interface VanInventory {
  technicianId: string;
  items: InventoryItem[];
  lastUpdated: string;
}

interface InventoryItem {
  partId: string;
  partName: string;
  quantity: number;
  minQuantity: number; // Alert threshold
  location: 'van' | 'warehouse';
}

// Low stock alerts
const checkLowStock = (inventory: VanInventory) => {
  return inventory.items.filter(item => 
    item.quantity <= item.minQuantity
  );
};

// Update stock after job
const usePartForJob = async (
  technicianId: string,
  partId: string,
  quantity: number
) => {
  await firestore
    .collection('vanInventory')
    .doc(technicianId)
    .update({
      [`items.${partId}.quantity`]: FieldValue.increment(-quantity)
    });
  
  // Check if restock needed
  const inventory = await getInventory(technicianId);
  const lowStock = checkLowStock(inventory);
  
  if (lowStock.length > 0) {
    await sendRestockAlert(technicianId, lowStock);
  }
};
```

---

### 3. Incremental Backup

**Priority:** P3  
**Effort:** Medium (3-4 days)  
**Value:** Medium - Reduce storage costs

**Implementation:**

```typescript
// Track document changes
interface BackupMetadata {
  lastFullBackup: string;
  lastIncrementalBackup: string;
  changedCollections: string[];
}

const incrementalBackup = async () => {
  const metadata = await getBackupMetadata();
  const lastBackupTime = new Date(metadata.lastIncrementalBackup);
  
  const changes: any = {};
  
  // Only backup changed documents
  for (const collection of COLLECTIONS) {
    const snapshot = await firestore
      .collection(collection)
      .where('updatedAt', '>', lastBackupTime)
      .get();
    
    if (!snapshot.empty) {
      changes[collection] = snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }));
    }
  }
  
  // Save incremental backup
  await saveToStorage(`backups/incremental-${Date.now()}.json`, changes);
  
  // Update metadata
  await updateBackupMetadata({
    lastIncrementalBackup: new Date().toISOString()
  });
};
```

---

## Implementation Priority Matrix

| Feature | Priority | Effort | Value | Timeline |
|---------|----------|--------|-------|----------|
| Rich Media Steps | P2 | Medium | High | Week 1-2 |
| Discount Codes | P2 | Small | Medium | Week 3 |
| Invoice PDF | P2 | Small | Medium | Week 3 |
| Document Tags | P2 | Small | Medium | Week 4 |
| A/B Testing | P2 | Medium | Medium | Week 5-6 |
| Route Optimization | P3 | Large | High | Month 2 |
| Van Inventory | P3 | Medium | Medium | Month 3 |
| Incremental Backup | P3 | Medium | Medium | Month 3 |

---

## Summary

**P2 Features (Next 6 weeks):**
- 5 features
- ~2 weeks total effort
- High business value additions

**P3 Features (3-6 months):**
- 3 major features
- ~1 month total effort
- Strategic enhancements

**Recommendation:** Focus on P2 features first for quick wins, then evaluate P3 based on user feedback.
