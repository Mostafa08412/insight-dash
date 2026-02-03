
# Implementation Plan: Full CRUD Pages and Enhanced Features

## Overview
This plan covers three major feature areas:
1. **Categories**: Complete CRUD functionality with Add, Edit, View Details, and Delete modals
2. **Low Stock Alerts**: Alert Details page with click-to-navigate from the list
3. **User Management**: Complete CRUD flow with Add, Edit, View, Delete, and role management

---

## 1. Categories - Complete CRUD

### Current State
- Categories page exists with listing, search, filtering, and pagination
- Edit and Delete buttons are present but non-functional
- Add Category button exists but does nothing

### Changes Required

**New Files:**
- `src/components/categories/AddCategoryModal.tsx` - Modal for creating new categories
- `src/components/categories/EditCategoryModal.tsx` - Modal for editing existing categories  
- `src/components/categories/DeleteCategoryDialog.tsx` - Confirmation dialog for deletion
- `src/pages/CategoryDetails.tsx` - Details page showing category info and associated products

**Modified Files:**
- `src/pages/Categories.tsx` - Wire up modals and navigation
- `src/pages/Index.tsx` - Add CategoryDetails route handling

### Category Modal Features
- Name input with validation
- Description textarea
- Form validation with error messages
- Submit/Cancel actions

### Category Details Page Features
- Category information card (name, description, product count)
- List of products in this category
- Quick stats (total value, average price)
- Edit and Delete actions

---

## 2. Low Stock Alerts - Details Page and Navigation

### Current State
- Alerts page has comprehensive filtering and pagination
- Alert items display in a list with Order Stock and Dismiss buttons
- No click-to-navigate or details view

### Changes Required

**New Files:**
- `src/pages/AlertDetails.tsx` - Detailed view of a single alert

**Modified Files:**
- `src/pages/Alerts.tsx` - Add click handlers to navigate to details
- `src/pages/Index.tsx` - Add AlertDetails state handling (similar to Transactions)

### Alert Details Page Features
- Alert severity and status display
- Product information card (with link to product details)
- Stock level visualization (progress bar)
- Alert history/timeline
- Quick actions: Order Stock, Dismiss, View Product
- Related transactions for this product

---

## 3. User Management - Complete CRUD Flow

### Current State
- Users page displays a table with mock users
- Add User button exists but is non-functional
- Edit and Delete buttons exist but do nothing
- Role permissions info cards displayed

### Changes Required

**New Files:**
- `src/components/users/AddUserModal.tsx` - Modal for creating new users
- `src/components/users/EditUserModal.tsx` - Modal for editing user information and roles
- `src/components/users/DeleteUserDialog.tsx` - Confirmation dialog with warnings
- `src/components/users/UserDetailsModal.tsx` - View user details in a modal
- `src/components/users/ChangeRoleModal.tsx` - Quick role change modal

**Modified Files:**
- `src/pages/Users.tsx` - Complete refactor with modals, search, filtering, pagination, and mobile responsiveness
- `src/types/inventory.ts` - Extend User type with additional fields (status, createdAt, lastLogin)

### User Management Features

#### Add User Modal
- Name, Email, Role selection
- Initial password generation note (for demo purposes)
- Form validation

#### Edit User Modal
- Edit name, email
- Change role with confirmation
- Cannot edit own role if admin (safety)

#### Delete User Dialog
- Confirmation with user name
- Warning about associated data
- Cannot delete self

#### Users Page Enhancements
- Search by name or email
- Filter by role (Admin, Manager, Staff)
- Filter by status (Active, Inactive)
- Pagination footer (matching other pages)
- Mobile-responsive card view
- Click row to view details

---

## Technical Details

### Component Patterns (Following Existing Code)
All modals will follow the pattern established in `EditProductModal.tsx`:
- Fixed overlay with blur backdrop
- Form validation with errors object
- Loading state during submission
- Clean close handlers

### State Management
Using local component state with `useState` hooks, consistent with existing patterns

### Styling
- Consistent use of Tailwind classes from existing components
- Using shadcn/ui components (Button, Input, Label, Select, Dialog)
- Animation classes (`animate-fade-in`)

### Type Extensions

```text
User interface additions:
- status: 'active' | 'inactive'
- createdAt: Date
- lastLogin?: Date
```

---

## File Creation Order

1. **User Types Update** - Extend User interface
2. **Category Modals** - AddCategoryModal, EditCategoryModal, DeleteCategoryDialog
3. **CategoryDetails Page** - New details page
4. **Categories Page Update** - Wire up all modals
5. **AlertDetails Page** - New details page
6. **Alerts Page Update** - Add click navigation
7. **User Modals** - All user management modals
8. **Users Page Refactor** - Complete CRUD integration

---

## Summary of Deliverables

| Feature | New Files | Modified Files |
|---------|-----------|----------------|
| Categories CRUD | 4 | 2 |
| Alert Details | 1 | 2 |
| User Management | 5 | 2 |
| **Total** | **10** | **6** |
