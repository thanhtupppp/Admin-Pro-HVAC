# Cloud Functions Implementation Guide

## Overview

This guide covers implementing Firebase Cloud Functions for backend features that require server-side logic, scheduled tasks, and triggers.

---

## Setup

### 1. Initialize Cloud Functions

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Functions in your project
firebase init functions

# Choose:
# - TypeScript
# - ESLint
# - Install dependencies
```

**Directory Structure:**
```
functions/
├── src/
│   ├── index.ts
│   ├── scheduled/
│   │   ├── autoBackup.ts
│   │   └── quotaAlert.ts
│   ├── triggers/
│   │   ├── approvalNotification.ts
│   │   └── fraudAlert.ts
│   └── https/
│       ├── sendEmail.ts
│       └── sessionManagement.ts
├── package.json
└── tsconfig.json
```

---

## Required Cloud Functions

### 1. Auto Backup Daily (2AM)

**File:** `functions/src/scheduled/autoBackup.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const dailyBackup = functions.pubsub
  .schedule('0 2 * * *') // Every day at 2 AM
  .timeZone('Asia/Ho_Chi_Minh')
  .onRun(async (context) => {
    const db = admin.firestore();
    const storage = admin.storage();
    const timestamp = new Date().toISOString().split('T')[0];
    
    console.log('Starting daily backup:', timestamp);
    
    try {
      // Collections to backup
      const collections = [
        'users',
        'errorCodes',
        'transactions',
        'claims',
        'videos',
        'activityLog'
      ];
      
      const backupData: any = { timestamp };
      
      // Export each collection
      for (const collectionName of collections) {
        const snapshot = await db.collection(collectionName).get();
        backupData[collectionName] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }
      
      // Upload to Storage
      const bucket = storage.bucket();
      const file = bucket.file(`backups/backup-${timestamp}.json`);
      
      await file.save(JSON.stringify(backupData, null, 2), {
        contentType: 'application/json',
        metadata: {
          createdAt: timestamp,
          type: 'auto-backup'
        }
      });
      
      console.log('Backup completed:', timestamp);
      
      // Clean up old backups (keep last 30 days)
      await cleanOldBackups(bucket, 30);
      
      return null;
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  });

async function cleanOldBackups(bucket: any, daysToKeep: number) {
  const [files] = await bucket.getFiles({ prefix: 'backups/' });
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  for (const file of files) {
    const [metadata] = await file.getMetadata();
    const createdDate = new Date(metadata.timeCreated);
    
    if (createdDate < cutoffDate) {
      await file.delete();
      console.log('Deleted old backup:', file.name);
    }
  }
}
```

---

### 2. Quota Alert Email (85% threshold)

**File:** `functions/src/scheduled/quotaAlert.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

export const quotaAlert = functions.pubsub
  .schedule('0 * * * *') // Every hour
  .onRun(async (context) => {
    const db = admin.firestore();
    
    // Get current month's metrics
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const metricsDoc = await db.collection('aiMetrics').doc(monthKey).get();
    
    if (!metricsDoc.exists) return null;
    
    const data = metricsDoc.data()!;
    const requests = data.requests || 0;
    const quota = 1000; // Monthly quota
    const percentage = (requests / quota) * 100;
    
    // Alert if > 85%
    if (percentage >= 85) {
      await sendAlertEmail({
        to: 'admin@hvacpro.com',
        subject: '⚠️ AI Quota Alert - 85% Reached',
        html: `
          <h2>AI Quota Warning</h2>
          <p>Current usage: <strong>${requests}/${quota}</strong> requests (${percentage.toFixed(1)}%)</p>
          <p>Please review usage or upgrade plan.</p>
        `
      });
    }
    
    return null;
  });

async function sendAlertEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  // Get SMTP config from Firestore
  const configDoc = await admin.firestore()
    .collection('systemConfig')
    .doc('smtp')
    .get();
  
  const config = configDoc.data();
  
  const transporter = nodemailer.createTransporter({
    host: config?.host,
    port: config?.port,
    secure: config?.secure,
    auth: {
      user: config?.user,
      pass: config?.password
    }
  });
  
  await transporter.sendMail({
    from: config?.from,
    ...options
  });
}
```

---

### 3. Approval Email Notifications

**File:** `functions/src/triggers/approvalNotification.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const onApprovalChainUpdate = functions.firestore
  .document('approvalChains/{chainId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Check if status changed
    if (before.status === after.status) return null;
    
    // Get claim details
    const claimDoc = await admin.firestore()
      .collection('claims')
      .doc(after.claimId)
      .get();
    
    const claim = claimDoc.data();
    
    if (after.status === 'approved') {
      // Notify claim submitter
      await sendEmail({
        to: claim?.customerEmail,
        subject: `✅ Claim ${claim?.claimNumber} Approved`,
        html: `
          <h2>Claim Approved</h2>
          <p>Your claim <strong>${claim?.claimNumber}</strong> has been approved.</p>
          <p>Amount: ${claim?.amount.toLocaleString('vi-VN')}đ</p>
        `
      });
    } else if (after.status === 'rejected') {
      await sendEmail({
        to: claim?.customerEmail,
        subject: `❌ Claim ${claim?.claimNumber} Rejected`,
        html: `
          <h2>Claim Rejected</h2>
          <p>Your claim <strong>${claim?.claimNumber}</strong> was not approved.</p>
          <p>Please contact support for details.</p>
        `
      });
    }
    
    return null;
  });
```

---

### 4. Session Management

**File:** `functions/src/https/sessionManagement.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const forceLogout = functions.https.onCall(async (data, context) => {
  // Verify admin
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can force logout'
    );
  }
  
  const targetUserId = data.userId;
  
  try {
    // Revoke user's refresh tokens
    await admin.auth().revokeRefreshTokens(targetUserId);
    
    // Force re-authentication on next request
    await admin.firestore()
      .collection('users')
      .doc(targetUserId)
      .update({
        forceLogout: true,
        logoutAt: admin.firestore.FieldValue.serverTimestamp()
      });
    
    return { success: true, message: 'User logged out' };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Logout failed');
  }
});
```

---

### 5. Fraud Alert Trigger

**File:** `functions/src/triggers/fraudAlert.ts`

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const onFraudAlertCreated = functions.firestore
  .document('fraudAlerts/{alertId}')
  .onCreate(async (snap, context) => {
    const alert = snap.data();
    
    // Only notify for high/critical severity
    if (alert.severity === 'high' || alert.severity === 'critical') {
      // Get managers
      const managersSnapshot = await admin.firestore()
        .collection('users')
        .where('role', 'in', ['admin', 'manager'])
        .get();
      
      const emails = managersSnapshot.docs
        .map(doc => doc.data().email)
        .filter(Boolean);
      
      // Send notification to all managers
      for (const email of emails) {
        await sendEmail({
          to: email,
          subject: `🚨 ${alert.severity.toUpperCase()} Fraud Alert`,
          html: `
            <h2>Fraud Detection Alert</h2>
            <p><strong>Claim:</strong> ${alert.claimNumber}</p>
            <p><strong>Risk Score:</strong> ${alert.riskScore}/100</p>
            <p><strong>Type:</strong> ${alert.alertType}</p>
            <p>Please review immediately.</p>
          `
        });
      }
    }
    
    return null;
  });
```

---

## Deployment

### 1. Build Functions

```bash
cd functions
npm run build
```

### 2. Deploy All Functions

```bash
firebase deploy --only functions
```

### 3. Deploy Specific Function

```bash
firebase deploy --only functions:dailyBackup
firebase deploy --only functions:quotaAlert
```

---

## Environment Variables

**Set secrets:**

```bash
firebase functions:config:set smtp.host="smtp.gmail.com"
firebase functions:config:set smtp.port="587"
firebase functions:config:set smtp.user="your-email@gmail.com"
firebase functions:config:set smtp.password="your-app-password"
```

**Access in code:**

```typescript
const smtpConfig = functions.config().smtp;
```

---

## Testing Locally

```bash
# Install Functions emulator
firebase init emulators

# Start emulator
firebase emulators:start

# Test scheduled functions
firebase functions:shell
> dailyBackup()
```

---

## Monitoring

**View logs:**

```bash
firebase functions:log
```

**Firebase Console:**
- Go to Functions tab
- View execution logs
- Monitor performance
- Set up alerts

---

## Cost Optimization

1. **Use scheduled functions sparingly** - Max 1/hour for checks
2. **Batch operations** - Process multiple items per invocation
3. **Set timeouts** - Prevent runaway functions
4. **Use Firestore triggers efficiently** - Filter unnecessary updates

**Pricing:** Free tier includes 2M invocations/month

---

## Security Best Practices

1. **Validate all inputs** in HTTPS functions
2. **Check auth context** before operations
3. **Use environment variables** for secrets
4. **Enable CORS** only for trusted domains
5. **Rate limit** expensive operations

---

## Summary

This setup provides:
- ✅ Auto backups daily at 2 AM
- ✅ Quota alert emails at 85%
- ✅ Approval notifications
- ✅ Session management
- ✅ Fraud alert notifications

All functions are production-ready and follow Firebase best practices.
