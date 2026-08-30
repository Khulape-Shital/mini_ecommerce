# API Design

Define REST API standards.

Examples:
- `GET    /api/v1/products`
- `POST   /api/v1/products`
- `GET    /api/v1/products/:id`
- `PATCH  /api/v1/products/:id`
- `DELETE /api/v1/products/:id`

## Consistent Responses

Success:
```json
{
  "success": true,
  "data": {}
}
```

Error:
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found"
  }
}
```

Define appropriate HTTP status codes.

## Pagination
- page
- limit
- maximum limit
- server-side pagination

## Search
- server-side
- never load entire tables into application memory

## Filtering
- database-level filtering

## Sorting
- whitelist supported fields
- never concatenate arbitrary client input into SQL

Do not expose internal database errors to clients.
