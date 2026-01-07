# Firebase Firestore Collections & Indexes

## Collections Structure

### 1. `users`
```typescript
{
  id: string (auto-generated)
  email: string
  displayName: string
  role: 'admin' | 'manager' | 'technician' | 'viewer'
  createdAt: Timestamp
  lastLogin: Timestamp
}
```

**Indexes Required:**
- `role` ASC, `createdAt` DESC
- `email` ASC (auto-created for queries)

---

### 2. `errorCodes`
```typescript
{
  id: string
  code: string
  brand: string
  model: string
  title: string
  diagnosis: string
  solution: string
  components: string[]
  tools: string[]
  repairSteps: string[]
  priority: 'low' | 'medium' | 'high'
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Indexes Required:**
- `brand` ASC, `model` ASC, `code` ASC
- `priority` ASC, `createdAt` DESC
- `brand` ASC, `createdAt` DESC

---

### 3. `transactions`
```typescript
{
  id: string
  userId: string
  planId: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  paymentMethod: string
  createdAt: Timestamp
}
```

**Indexes Required:**
- `userId` ASC, `createdAt` DESC
- `status` ASC, `createdAt` DESC
- `paymentMethod` ASC, `status` ASC

---

### 4. `claims`
```typescript
{
  id: string
  claimNumber: string
  customerId: string
  type: string
  amount: number
  status: 'draft' | 'submitted' | 'in_review' | 'pending_approval' | 'approved' | 'rejected'
  createdAt: Timestamp
}
```

**Indexes Required:**
- `customerId` ASC, `createdAt` DESC
- `status` ASC, `createdAt` DESC
- `status` ASC, `amount` DESC

---

### 5. `claimRules`
```typescript
{
  id: string
  name: string
  priority: number
  status: 'active' | 'inactive'
  createdAt: Timestamp
}
```

**Indexes Required:**
- `status` ASC, `priority` ASC
- `priority` ASC (for sorting active rules)

---

### 6. `workflows`
```typescript
{
  id: string
  name: string
  status: 'draft' | 'active' | 'archived'
  createdAt: Timestamp
}
```

**Indexes Required:**
- `status` ASC, `createdAt` DESC

---

### 7. `approvalChains`
```typescript
{
  id: string
  claimId: string
  workflowId: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Timestamp
}
```

**Indexes Required:**
- `claimId` ASC (unique)
- `status` ASC, `createdAt` DESC

---

### 8. `fraudAlerts`
```typescript
{
  id: string
  claimId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  riskScore: number
  status: 'open' | 'investigating' | 'confirmed' | 'false_positive'
  detectedAt: Timestamp
}
```

**Indexes Required:**
- `status` ASC, `detectedAt` DESC
- `severity` ASC, `riskScore` DESC
- `claimId` ASC

---

### 9. `videos`
```typescript
{
  id: string
  status: 'active' | 'draft' | 'archived'
  category: string
  views: number
  uploadedAt: Timestamp
}
```

**Indexes Required:**
- `status` ASC, `uploadedAt` DESC
- `category` ASC, `views` DESC
- `views` DESC (for top videos)

---

### 10. `activityLog`
```typescript
{
  id: string
  userId: string
  action: string
  timestamp: Timestamp
  success: boolean
}
```

**Indexes Required:**
- `timestamp` DESC (for recent logs)
- `userId` ASC, `timestamp` DESC
- `action` ASC, `timestamp` DESC

---

### 11. `aiMetrics`
```typescript
{
  id: string
  date: string (YYYY-MM-DD)
  requests: number
  tokens: number
}
```

**Indexes Required:**
- `date` DESC
- Auto-created for unique date queries

---

### 12. `plans`
```typescript
{
  id: string
  name: string
  price: number
  status: 'active' | 'inactive'
}
```

**Indexes Required:**
- `status` ASC, `price` ASC

---

## Security Rules (firestore.rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isManager() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'manager'];
    }
    
    // Users - Admin only
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Error Codes - Manager+
    match /errorCodes/{docId} {
      allow read: if isAuthenticated();
      allow write: if isManager();
    }
    
    // Transactions - Manager+
    match /transactions/{docId} {
      allow read: if isAuthenticated();
      allow write: if isManager();
    }
    
    // Claims - Manager+
    match /claims/{docId} {
      allow read: if isAuthenticated();
      allow write: if isManager();
    }
    
    // Claim Rules - Admin only
    match /claimRules/{docId} {
      allow read: if isManager();
      allow write: if isAdmin();
    }
    
    // Workflows - Admin only
    match /workflows/{docId} {
      allow read: if isManager();
      allow write: if isAdmin();
    }
    
    // Approval Chains - Manager+
    match /approvalChains/{docId} {
      allow read: if isManager();
      allow write: if isManager();
    }
    
    // Fraud Alerts - Manager+
    match /fraudAlerts/{docId} {
      allow read: if isManager();
      allow write: if isManager();
    }
    
    // Videos - All authenticated
    match /videos/{docId} {
      allow read: if isAuthenticated();
      allow write: if isManager();
    }
    
    // Activity Log - Read only for managers
    match /activityLog/{docId} {
      allow read: if isManager();
      allow write: if false; // System only
    }
    
    // AI Metrics - Manager+
    match /aiMetrics/{docId} {
      allow read: if isManager();
      allow write: if isAdmin();
    }
    
    // Plans - All authenticated read
    match /plans/{docId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

---

## Required Firestore Indexes (firestore.indexes.json)

```json
{
  "indexes": [
    {
      "collectionGroup": "errorCodes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "brand", "order": "ASCENDING" },
        { "fieldPath": "model", "order": "ASCENDING" },
        { "fieldPath": "code", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "claims",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "fraudAlerts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "detectedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "videos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "uploadedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "activityLog",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## Setup Commands

### 1. Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

### 2. Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

### 3. Create Indexes via Firebase Console
1. Go to Firebase Console → Firestore Database
2. Click "Indexes" tab
3. Add composite indexes as listed above
4. Wait for index creation (can take several minutes)

---

## Performance Optimization Tips

1. **Limit Query Results**: Always use `limit()` for large collections
2. **Use Pagination**: Implement cursor-based pagination for lists
3. **Cache Data**: Use React state to cache frequently accessed data
4. **Batch Writes**: Use `writeBatch()` for multiple updates
5. **Offline Persistence**: Enable offline caching for better UX

```typescript
// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    // Multiple tabs open
  } else if (err.code == 'unimplemented') {
    // Browser doesn't support
  }
});
```
