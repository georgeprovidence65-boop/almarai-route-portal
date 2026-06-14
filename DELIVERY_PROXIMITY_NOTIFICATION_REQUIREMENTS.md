# Delivery Proximity Notification Requirement

## Feature Request

The system should notify the customer when the delivery salesman is close to the customer's location.

Required alerts:

1. When the salesman is within 50 meters of the customer:
   - Send/show a message notification to the customer.
   - Example message:
     "Your Almarai delivery salesman is nearby and should arrive shortly."

2. When the salesman is within 100 feet of the customer:
   - Play a voice note/audio alert for the customer.
   - Example voice note:
     "Your Almarai delivery salesman has arrived nearby. Please be ready to receive your order."

## Important Practical Rules

For zero-cost usage, this should be built first as an in-app/browser notification system.

This means:

- The customer must have the customer portal open, or the app must later be installed as a PWA.
- The customer must allow notification permission.
- The customer's phone/browser may block automatic voice playback unless the customer has already interacted with the page.
- The salesman must allow location access while using the salesman dashboard.
- The customer's location must be saved accurately.
- The system must compare salesman GPS location against customer GPS location.

## Distance Rules

- 50 meters should trigger the text notification.
- 100 feet is about 30.48 meters and should trigger the voice note.
- Each alert should trigger once per delivery/order, not repeat every few seconds.

## Recommended Zero-Cost Version

Use browser-based features first:

- Salesman dashboard sends current GPS location while on duty.
- Backend checks distance between salesman and active delivery customer.
- Customer portal receives the alert if open.
- Browser notification appears if permission is allowed.
- Voice note plays only after the customer has opened/interacted with the customer portal.

## Paid/External Option Later

If alerts must reach customers even when the portal is closed, the system will need an external service such as:

- WhatsApp Business API
- SMS gateway
- Push notification service

Those may require payment or business approval, so they are not part of the zero-cost first version.

## Data Needed

To make this work, the system needs:

- Salesman live latitude and longitude
- Customer latitude and longitude
- Active delivery/order assigned to that salesman
- Alert status for each delivery:
  - 50 meter message sent
  - 100 foot voice note played

## Implementation Plan

1. Add customer latitude and longitude fields.
2. Add salesman live location endpoint.
3. Add delivery proximity check on the backend.
4. Add notification banner and browser notification on customer portal.
5. Add voice note/audio alert on customer portal.
6. Add alert tracking so each alert fires only once per delivery.
7. Test on phone with location permission enabled.

