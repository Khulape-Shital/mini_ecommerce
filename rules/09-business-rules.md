# Business Rules

Define the actual e-commerce rules.

**Products:**
- name required
- price >= 0
- quantity >= 0
- unavailable/deleted products cannot be ordered

**Customers:**
- valid email
- unique email
- required name

**Orders:**
- at least one item
- positive item quantities
- server calculates total
- client cannot dictate final total
- product price captured at order time

**Inventory:**
- verify availability
- deduct inventory atomically
- reject insufficient inventory
- restore inventory when an eligible order is cancelled

**Order statuses:**
PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
Do not invent complex status-transition rules without documenting them as project assumptions.

**Discounts:**
- server-side calculation
- coupon existence
- active state
- expiration
- usage restrictions
- minimum order value where applicable

**Payments:**
- payment state controlled by server
- client cannot simply mark payment successful

**Shipping:**
- server-controlled shipping state

**Reviews:**
- authenticated users
- define purchase eligibility
- prevent unauthorized reviews

**Categories:**
- proper database relationships
