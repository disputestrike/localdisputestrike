# DisputeStrike Admin Panel - Complete Documentation

## Overview
The admin panel is a comprehensive Fortune 500-level management system with full CRUD operations, analytics, sales tracking, and export capabilities.

## Access
- **Admin Login URL:** `/admin/login`
- **Admin Panel URL:** `/admin`
- **Footer Link:** "Admin" link in the Legal section of homepage footer

## Default Master Admin Account
- **Email:** admin@disputestrike.com
- **Password:** DisputeStrike2024!
- **Role:** Master Admin (full access)

**IMPORTANT:** Change this password after first login!

---

## Features

### 1. Dashboard Tab
- **Total Revenue** - Green card showing all-time revenue with monthly breakdown
- **Total Users** - User count with new users this month
- **Total Letters** - Letter count with monthly generation stats
- **Success Rate** - Deletion rate percentage
- **Admin Team** - Number of admin accounts
- **Payments Today** - Today's payment count
- **Activity Today** - Today's admin activity count
- **Quick Actions:**
  - Manage Users
  - View Sales
  - Add Admin
  - Export Users
  - Export Payments

### 2. Analytics Tab
- **Letter Performance by Bureau**
  - Equifax, TransUnion, Experian deletion rates
  - Progress bars showing success percentages
  - Letter counts per bureau
- **Account Status Distribution**
  - Deleted accounts count
  - Verified (Round 2) accounts
  - Pending accounts
- **User Growth**
  - This month's new users
  - Total active users
  - Paid users count
- **Recent Success Stories**
  - Users with significant score improvements

### 3. Sales Tab
- **Revenue Overview Cards:**
  - Total Revenue (green highlighted)
  - This Month revenue
  - Completed payments count
  - Pending payments count
- **Payment Status Breakdown**
  - Completed, Pending, Failed counts
- **Revenue by Tier**
  - DIY Quick
  - DIY Complete
  - White Glove
  - Subscription Monthly
  - Subscription Annual
- **Recent Payments Table**
  - User name/email
  - Amount
  - Tier
  - Status (badge)
  - Stripe ID
  - Date
  - Export CSV button

### 4. Users Tab
- **Search & Filter:**
  - Search by name/email
  - Filter by role
  - Filter by status (Active/Blocked)
  - Filter by state
  - Filter by city
- **User Table:**
  - User avatar, name, email
  - Status badge
  - Location
  - Letter count
  - Join date
- **Actions per user:**
  - View Dashboard (opens user's back office)
  - Block/Unblock User
  - Delete User
- **Export CSV** button

### 5. Admins Tab
- **Admin Table:**
  - Admin avatar, name, email
  - Role badge (Master Admin/Super Admin/Admin)
  - Status badge
  - Last login timestamp
  - Actions (Edit/Delete)
- **Add New Admin** button
  - Name field
  - Email field
  - Password field
  - Role dropdown (Admin/Super Admin/Master Admin)
- **Edit Admin** dialog
  - Update name
  - Change role
  - Change status (Active/Blocked)
  - Reset password
- **Delete Admin** confirmation
- **Role Privileges Info:**
  - Master Admin privileges
  - Super Admin privileges
  - Admin privileges

### 6. Letters Tab
- **Letters Table:**
  - User name
  - Bureau
  - Round badge
  - Status badge
  - Created date
- **Export CSV** button

### 7. Activity Tab
- **Activity Log:**
  - Action description
  - Details
  - Timestamp
- Shows all admin actions for audit trail

### 8. Export Tab
- **Export Users** - Download all users as CSV
- **Export Letters** - Download all letters as CSV
- **Export Payments** - Download all payments as CSV

---

## Role Hierarchy

| Role | Privileges |
|------|------------|
| **Master Admin** | Full system access, create/delete admins, change admin roles, view all data, export all data, delete users |
| **Super Admin** | View all users, block/unblock users, view all letters, view payments, export data, cannot manage admins |
| **Admin** | View users, view letters, view basic stats, cannot export data, cannot manage users, cannot view payments |

---

## Menu Options
- **Main Site** - Return to main website
- **Refresh Data** - Reload all data
- **Change Password** - Update admin password
- **Logout** - End admin session

---

## Security Features
- Password hashing with bcrypt (12 rounds)
- Session-based authentication with secure cookies
- Account lockout after 5 failed attempts (15 min)
- Activity logging for all admin actions
- Separate admin authentication system (not connected to user accounts)

---

## API Endpoints

### Admin Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/session` - Check session
- `POST /api/admin/change-password` - Change password

### Admin Management
- `GET /api/admin/admins` - List all admins
- `POST /api/admin/admins` - Create new admin
- `PUT /api/admin/admins/:id` - Update admin
- `DELETE /api/admin/admins/:id` - Delete admin

### Activity Log
- `GET /api/admin/activity` - Get activity log

### Data Endpoints (via tRPC)
- `admin.getStats` - Dashboard statistics
- `admin.getUserList` - Users with filters
- `admin.getLetterList` - Letters with filters
- `admin.getPaymentList` - Payments with filters
- `admin.exportUsers` - Export users CSV
- `admin.exportLetters` - Export letters CSV

---

## Testing Checklist

- [x] Admin login works
- [x] Dashboard displays all stats
- [x] Analytics tab shows all metrics
- [x] Sales tab shows revenue and payments
- [x] Users tab with search/filter works
- [x] Admins tab shows admin list
- [x] Add New Admin dialog works
- [x] Role privileges displayed correctly
- [x] Letters tab shows all letters
- [x] Activity tab shows logs
- [x] Export tab has all export buttons
- [x] Menu dropdown works
- [x] Logout functionality works
- [x] Footer admin link works
