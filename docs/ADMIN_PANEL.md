# DisputeStrike Admin Panel Documentation

## Overview

The DisputeStrike Admin Panel is a comprehensive Fortune 500-level administration system that provides full control over users, letters, and system management.

## Access

- **URL:** `/admin`
- **Footer Link:** Available in the website footer under "Legal" section
- **Authentication:** Requires login with an admin account

## Role Hierarchy

| Role | Level | Permissions |
|------|-------|-------------|
| **Master Admin** | Highest | Full access to all features, can manage all admins |
| **Super Admin** | High | Can manage users and admins (except master admins) |
| **Admin** | Standard | Can manage users, view reports |
| **User** | Basic | Regular user access only |

## Features

### 1. Dashboard Overview
- Total users count
- Total letters generated
- Active users this month
- Revenue tracking
- Quick statistics

### 2. User Management
- **View all users** with search and filtering
- **Filter by:** Role, Status, State, City
- **Search:** By name, email
- **Actions:**
  - View user details
  - Edit user profile
  - Change user role
  - Block/Unblock users
  - Delete users
  - View user's back office

### 3. Admin Management
- View all admins
- Add new admins (promote users)
- Edit admin roles
- Block/Unblock admins
- Remove admin privileges

### 4. Letters Management
- View all generated letters
- Filter by bureau, status, user
- View letter details
- Export to Excel

### 5. Activity Log
- Track all admin actions
- View who did what and when
- Audit trail for compliance

### 6. Export Features
- **Export Users to Excel:** Download complete user list
- **Export Letters to Excel:** Download all letters data
- **Query Results:** Export filtered results

## Admin Scripts

### Promote User to Admin
```bash
cd /home/ubuntu/DisputeStrike
node scripts/make-admin.mjs <email>
```

### List All Users
```bash
cd /home/ubuntu/DisputeStrike
node scripts/list-users.mjs
```

### Update User Role Directly
```bash
cd /home/ubuntu/DisputeStrike
node update-admin.mjs
```

## Current Admin Users

| Name | Email | Role |
|------|-------|------|
| Benjamin Peter | benxpeter@gmail.com | Master Admin |

## Security

- Role-based access control (RBAC)
- Activity logging for all admin actions
- Session management
- Protected API endpoints

## API Endpoints

All admin endpoints are under `trpc.admin.*`:

- `getDashboardStats` - Get dashboard statistics
- `getUserList` - Get paginated user list with filters
- `getUserDetails` - Get detailed user information
- `updateUserRole` - Change user role
- `updateUserStatus` - Block/unblock user
- `deleteUser` - Delete user and all data
- `updateUserProfile` - Edit user profile
- `getAdmins` - Get all admin users
- `getLetterList` - Get all letters
- `getActivityLog` - Get admin activity log
- `exportUsersToExcel` - Export users data
- `exportLettersToExcel` - Export letters data

## Troubleshooting

### Cannot access admin panel
1. Ensure you're logged in
2. Verify your account has admin role
3. Check browser console for errors

### Export not working
1. Check if data exists
2. Verify filters are not too restrictive
3. Check network tab for API errors

## Support

For technical support, contact the development team.
