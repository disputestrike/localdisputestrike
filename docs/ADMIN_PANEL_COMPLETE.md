# Admin Panel - Complete Implementation

## Admin Authentication System

The admin panel now uses a **completely separate authentication system** from regular users:

- Admins login with **email and password** (not OAuth)
- Separate `admin_accounts` database table
- Session-based authentication with secure cookies

## Default Master Admin Account

- **Email:** admin@disputestrike.com
- **Password:** DisputeStrike2024!
- **Role:** Master Admin

**IMPORTANT:** Change this password after first login!

## Access URLs

- **Admin Login:** /admin/login
- **Admin Panel:** /admin
- **Footer Link:** "Admin" link in the Legal section of the homepage footer

## Admin Roles & Privileges

| Role | Privileges |
|------|------------|
| **Master Admin** | Full system access, create/delete admins, all permissions |
| **Super Admin** | Manage users, view all data, export data |
| **Admin** | View users, view letters, basic access |

## Admin Panel Features

### Dashboard Tab
- Total Users count
- Total Letters count
- Admin Team count
- Activity Today count
- Quick Actions: Manage Users, Add Admin, Export Users, Export Letters

### Users Tab
- View all platform users
- Search by name/email
- Filter by role, status, state, city
- Export to CSV
- View user details

### Admins Tab
- View all admin accounts
- Add new admin (Master Admin only)
- Edit admin (name, role, status, password)
- Block/unblock admins
- Delete admins
- Role privileges info card

### Letters Tab
- View all generated dispute letters
- Export to CSV

### Activity Tab
- Admin activity log
- Audit trail of all admin actions

### Export Tab
- Export Users to CSV
- Export Letters to CSV

## Menu Options
- Main Site - Return to main website
- Refresh Data - Reload all data
- Change Password - Update your password
- Logout - End admin session

## Security Features

1. **Password Hashing:** bcrypt with 12 rounds
2. **Session Tokens:** Cryptographically secure random tokens
3. **Account Lockout:** 5 failed attempts = 15 minute lockout
4. **Activity Logging:** All admin actions are logged
5. **Role-Based Access:** Only Master Admin can manage other admins

## Scripts for Admin Management

```bash
# List all users
node scripts/list-users.mjs

# Promote user to admin (for regular users)
node scripts/make-admin.mjs <email>
```

## Database Tables

### admin_accounts
- id, email, passwordHash, name, role, status
- lastLogin, loginAttempts, lockedUntil
- createdBy, createdAt, updatedAt

### admin_activity_log
- id, adminId, action, targetType, targetId
- details, ipAddress, createdAt
