# Salesman Transfer Workflow

## Purpose

Salesmen should only use the transfer feature for real operational support:

- Nearby salesman assistance while on duty
- Route-to-route stock support with an approved salesperson
- Depot support when nearby stock is not available

## Main Rule

A salesman should not type any random salesman name for a transfer. The system must provide selectable salesmen from approved sources only.

Allowed sources:

1. Nearby salesman with fresh live location inside the working radius.
2. Logistics-approved transfer partner.
3. Depot support.

## Nearby Salesman Rule

The nearby salesman list is for salesmen only. It is not for customers.

The list should show:

- Salesman name
- Route
- Distance, when live location is available
- Whether the salesman is nearby or logistics approved

Old/stale location should not count as nearby.

## Logistics Approval Rule

Only logistics can approve or remove transfer partners.

Route-to-route transfer between salesmen should not require admin approval. Admin can review transfer records, but admin should not approve transfer partners.

The approved partner setup should define:

- From salesman
- To salesman
- From route
- To route
- Active or removed status

Removing a transfer partner should disable new transfers between those two salesmen but should not delete historical transfer records.

## Transfer Status Flow

Use clear statuses:

1. Requested
2. Accepted
3. Sender Confirmed
4. Receiver Confirmed
5. Transfer Complete

Possible stop statuses:

- Rejected
- Cancelled

## Current Zero-Cost Implementation

The app uses browser GPS and the existing free Render/Supabase setup.

Salesmen must click **Start Location Sharing** for nearby detection to work.

If GPS is off and no logistics-approved partner exists, the salesman cannot create a route-to-route transfer to that salesperson.
