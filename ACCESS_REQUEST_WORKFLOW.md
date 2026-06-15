# Access Request Workflow

## Purpose

The company QR portal should allow a person to request a user login instead of requiring the manager to type every new user manually.

## How It Works

1. Person scans the company QR.
2. Person opens the login page.
3. If they do not have a login, they tap **Request Access**.
4. They submit:
   - Full name
   - Phone
   - Password/PIN they want to use
   - Requested role: customer or salesman
   - Route
   - Area
   - Customer ID, if customer
   - Notes
5. Manager/admin reviews the request in the manager portal.
6. Manager/admin approves the request.
7. The system creates the user login using the submitted phone and password/PIN.

## Safety Rule

Requesting access does not immediately create an active user. Approval is required.

Public requests can only ask for:

- Customer
- Salesman

Manager, admin, and logistics users must still be created by an existing manager/admin.

