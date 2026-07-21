# GearUp API — Full Endpoint Testing Guide (Postman)

Base URL (live): `https://gearup-backend-nine-psi.vercel.app/api`
Base URL (local): `http://localhost:5000/api`

Import `postman/GearUp.postman_collection.json` into Postman first — it already has every request below organized into folders (Auth, Gear, Rentals, Payments, Provider, Reviews, Admin) with a `{{baseUrl}}` variable and placeholder variables for tokens/ids. Just set `baseUrl` to the live URL and fill in variables as you go.

Record your video walking through the steps in this exact order — it mirrors a real user journey (Customer → Provider → Admin) and demonstrates every role.

---

## 0. Setup in Postman

1. Open the imported collection → click the collection name → **Variables** tab.
2. Set `baseUrl` = `https://gearup-backend-nine-psi.vercel.app/api`
3. Leave `token`, `providerToken`, `adminToken`, `gearItemId`, `categoryId`, `rentalOrderId`, `paymentId` empty — you'll fill them in as responses come back.
4. For every authenticated request, go to the **Authorization** tab → type **Bearer Token** → paste `{{token}}` (or `{{providerToken}}` / `{{adminToken}}` depending on role), OR just add header `Authorization: Bearer {{token}}` manually — the collection already has this wired in.

---

## 1. Auth — Public

### 1.1 Register Customer
`POST {{baseUrl}}/auth/register`
Body (JSON):
```json
{
  "name": "John Customer",
  "email": "john@example.com",
  "password": "password123",
  "role": "CUSTOMER"
}
```
Expected: `201`, returns `{ user, token }`. **Copy the `token` into the `token` variable.**

### 1.2 Register Provider
`POST {{baseUrl}}/auth/register`
```json
{
  "name": "Jane Provider",
  "email": "jane@example.com",
  "password": "password123",
  "role": "PROVIDER"
}
```
Expected: `201`. **Copy token into `providerToken`.**

### 1.3 Login (Customer)
`POST {{baseUrl}}/auth/login`
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
Expected: `200`, same shape as register.

### 1.4 Login (Admin — seeded account)
`POST {{baseUrl}}/auth/login`
```json
{
  "email": "admin@gearup.com",
  "password": "Admin@12345"
}
```
Expected: `200`. **Copy token into `adminToken`.**

### 1.5 Get Current User (`/me`)
`GET {{baseUrl}}/auth/me`
Header: `Authorization: Bearer {{token}}`
Expected: `200`, returns the logged-in user's profile.

### 1.6 Validation error demo (for video)
`POST {{baseUrl}}/auth/register`
```json
{
  "name": "A",
  "email": "not-an-email",
  "password": "123"
}
```
Expected: `400` with `{ success: false, message: "Validation Error", errorDetails: [...] }` — good moment to show off structured error handling.

---

## 2. Gear & Categories — Public (no token needed)

### 2.1 Get All Categories
`GET {{baseUrl}}/categories`
Expected: `200`, array of categories (Cycling, Camping, Fitness, Water Sports from seed). **Copy one `id` into `categoryId`.**

### 2.2 Get All Gear (with filters)
`GET {{baseUrl}}/gear`
Try with query params too:
`GET {{baseUrl}}/gear?category=Cycling&minPrice=5&maxPrice=50&searchTerm=bike`
Expected: `200`, array of gear items. **Copy one `id` into `gearItemId`** (seed has `seed-gear-mountain-bike`).

### 2.3 Get Gear By Id
`GET {{baseUrl}}/gear/{{gearItemId}}`
Expected: `200`, full gear detail including provider info and reviews array.

### 2.4 404 demo (for video)
`GET {{baseUrl}}/gear/does-not-exist`
Expected: `404` with structured error body — shows your 404 handling.

---

## 3. Provider — Manage Gear (needs `providerToken`)

### 3.1 Add Gear
`POST {{baseUrl}}/provider/gear`
Header: `Authorization: Bearer {{providerToken}}`
```json
{
  "name": "Coleman Camping Tent",
  "description": "4-person waterproof tent, easy setup",
  "brand": "Coleman",
  "pricePerDay": 12,
  "stock": 3,
  "images": [],
  "categoryId": "{{categoryId}}"
}
```
Expected: `201`. Copy the new gear's `id` — you can reuse this as `gearItemId` going forward, or keep the seeded one.

### 3.2 Update Gear
`PUT {{baseUrl}}/provider/gear/{{gearItemId}}`
Header: `Authorization: Bearer {{providerToken}}`
```json
{
  "pricePerDay": 14,
  "stock": 4
}
```
Expected: `200`. Note: this only works if `{{gearItemId}}` belongs to the provider whose token you're using — use the gear id from 3.1, not the seeded one (that belongs to the seeded provider, not `jane@example.com`).

### 3.3 Get Provider's Incoming Orders
`GET {{baseUrl}}/provider/orders`
Header: `Authorization: Bearer {{providerToken}}`
Expected: `200`, empty array until a customer rents this provider's gear (see step 4).

### 3.4 Delete Gear (demo only — do this LAST so you still have gear to rent in the video)
`DELETE {{baseUrl}}/provider/gear/{{gearItemId}}`
Header: `Authorization: Bearer {{providerToken}}`
Expected: `200`.

### 3.5 Forbidden-role demo (for video)
Try `POST {{baseUrl}}/provider/gear` using `{{token}}` (customer) instead of `{{providerToken}}`.
Expected: `403 Forbidden` — shows role-based access control working.

---

## 4. Rentals — Customer (needs `token`)

> Use the gear you added as Provider in step 3.1 (copy its id into `gearItemId`) so the full flow (rent → provider sees order → provider updates status) is demonstrable on camera.

### 4.1 Create Rental Order
`POST {{baseUrl}}/rentals`
Header: `Authorization: Bearer {{token}}`
```json
{
  "startDate": "2026-08-01",
  "endDate": "2026-08-05",
  "items": [
    { "gearItemId": "{{gearItemId}}", "quantity": 1 }
  ]
}
```
Expected: `201`, returns rental order with `status: "PLACED"` and calculated `totalAmount`. **Copy the `id` into `rentalOrderId`.**

### 4.2 Get My Rentals
`GET {{baseUrl}}/rentals`
Header: `Authorization: Bearer {{token}}`
Expected: `200`, array including the order you just created.

### 4.3 Get Rental By Id
`GET {{baseUrl}}/rentals/{{rentalOrderId}}`
Header: `Authorization: Bearer {{token}}`
Expected: `200`, full order detail.

### 4.4 Insufficient stock / bad dates demo (for video)
`POST {{baseUrl}}/rentals`
```json
{
  "startDate": "2026-08-05",
  "endDate": "2026-08-01",
  "items": [{ "gearItemId": "{{gearItemId}}", "quantity": 1 }]
}
```
Expected: `400` — "End date must be after start date." Shows business-rule validation.

---

## 5. Payments — SSLCommerz Sandbox (needs `token`)

### 5.1 Create Payment Session
`POST {{baseUrl}}/payments/create`
Header: `Authorization: Bearer {{token}}`
```json
{
  "rentalOrderId": "{{rentalOrderId}}"
}
```
Expected: `201`, returns `{ paymentUrl, transactionId, payment }`. **Copy `paymentUrl`.**

### 5.2 Complete payment on SSLCommerz sandbox page (do this in a browser, not Postman)
1. Paste the `paymentUrl` into your browser.
2. SSLCommerz's sandbox checkout page loads — pick any test payment method they offer (e.g. test card, or mobile banking simulation) and complete it with the sandbox test credentials SSLCommerz provides on that page (dummy card numbers, e.g. `4111111111111111`).
3. SSLCommerz redirects to your `success_url`, which hits your `GET /api/payments/confirm` — this updates payment status to `COMPLETED` and rental status to `PAID` automatically. Record this browser redirect in your video — it's the visual proof payment integration works.

### 5.3 Get My Payment History
`GET {{baseUrl}}/payments`
Header: `Authorization: Bearer {{token}}`
Expected: `200`, shows the payment with `status: "COMPLETED"` (after 5.2) or `"PENDING"` (before). **Copy the payment `id` into `paymentId`.**

### 5.4 Get Payment By Id
`GET {{baseUrl}}/payments/{{paymentId}}`
Header: `Authorization: Bearer {{token}}`
Expected: `200`.

### 5.5 Duplicate payment demo (for video)
Repeat 5.1 for the same `rentalOrderId` after it's already `COMPLETED`.
Expected: `409 Conflict` — "This rental order has already been paid for."

---

## 6. Provider — Fulfill the Order (needs `providerToken`)

> Now that the order is paid, walk it through the rental lifecycle as the provider.

### 6.1 Get Provider's Orders (should now show the paid order)
`GET {{baseUrl}}/provider/orders`
Header: `Authorization: Bearer {{providerToken}}`

### 6.2 Confirm the Order
`PATCH {{baseUrl}}/provider/orders/{{rentalOrderId}}`
Header: `Authorization: Bearer {{providerToken}}`
```json
{ "status": "CONFIRMED" }
```

### 6.3 Mark Picked Up
`PATCH {{baseUrl}}/provider/orders/{{rentalOrderId}}`
```json
{ "status": "PICKED_UP" }
```

### 6.4 Mark Returned
`PATCH {{baseUrl}}/provider/orders/{{rentalOrderId}}`
```json
{ "status": "RETURNED" }
```
Expected for each: `200`, rental status updates accordingly. Note reviews can only be created after status is `RETURNED` — do this before step 7.

---

## 7. Reviews — Customer (needs `token`, order must be `RETURNED`)

### 7.1 Create Review
`POST {{baseUrl}}/reviews`
Header: `Authorization: Bearer {{token}}`
```json
{
  "gearItemId": "{{gearItemId}}",
  "rentalOrderId": "{{rentalOrderId}}",
  "rating": 5,
  "comment": "Great gear, worked perfectly!"
}
```
Expected: `201`.

### 7.2 Business-rule demo (for video)
Try creating the same review again.
Expected: `409` — "You have already reviewed this gear item for this rental order."

Try reviewing before `RETURNED` status (use a different fresh rental order still in `PLACED`).
Expected: `400` — "You can only leave a review after the gear has been returned."

---

## 8. Admin — Platform Oversight (needs `adminToken` from step 1.4)

### 8.1 Get All Users
`GET {{baseUrl}}/admin/users`
Header: `Authorization: Bearer {{adminToken}}`
Expected: `200`, array of all users (customer, provider, admin).

### 8.2 Suspend a User
`PATCH {{baseUrl}}/admin/users/:id` — replace `:id` in the URL with the customer's user id (from step 1.1's response, or from 8.1's list)
Header: `Authorization: Bearer {{adminToken}}`
```json
{ "status": "SUSPENDED" }
```
Expected: `200`.

### 8.3 Demonstrate suspension takes effect (for video)
Now try `GET {{baseUrl}}/auth/me` using `{{token}}` (the suspended customer).
Expected: `403 Forbidden` — "Your account has been suspended." Great moment to show middleware enforcing account status.

### 8.4 Reactivate the user
`PATCH {{baseUrl}}/admin/users/:id`
```json
{ "status": "ACTIVE" }
```

### 8.5 Get All Gear Listings
`GET {{baseUrl}}/admin/gear`
Header: `Authorization: Bearer {{adminToken}}`

### 8.6 Get All Rental Orders
`GET {{baseUrl}}/admin/rentals`
Header: `Authorization: Bearer {{adminToken}}`

### 8.7 Create a Category
`POST {{baseUrl}}/admin/categories`
Header: `Authorization: Bearer {{adminToken}}`
```json
{ "name": "Winter Sports" }
```
Expected: `201`.

---

## 9. Unauthorized / Not Found demos (quick wrap-up for video)

### 9.1 No token at all
`GET {{baseUrl}}/rentals` with no Authorization header.
Expected: `401` — "You are not authorized."

### 9.2 Wrong role
`GET {{baseUrl}}/admin/users` using `{{token}}` (customer).
Expected: `403` — "You do not have permission to perform this action."

### 9.3 Unknown route
`GET {{baseUrl}}/api/does-not-exist`
Expected: `404` — "API Not Found" with `{ path, method }` in `errorDetails`.

---

## Recording tips for the demo video

- Narrate the role you're acting as before each block ("Now testing as Customer...", "Switching to Provider token...").
- Show at least one success (2xx) and one intentional failure (4xx) per module — validation error, 403, 404, 409 — to prove the structured error format `{ success, message, errorDetails }` everywhere.
- For payments, actually open the `paymentUrl` in a real browser tab and complete the SSLCommerz sandbox checkout live — this is the part graders scrutinize most since it's the mandatory requirement.
- Keep responses visible on screen for a couple seconds so it's readable when scrubbing the video later.
