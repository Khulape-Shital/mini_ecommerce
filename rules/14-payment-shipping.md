# Payment and Shipping

Payment and shipping are domain features.

Do NOT integrate real external payment or courier providers unless explicitly approved.

Payment should support domain state such as:
PENDING, SUCCESS, FAILED, REFUNDED

Shipping should support appropriate domain states.

Payment and shipping operations must maintain order consistency.

Never perform external provider calls inside a database transaction.
