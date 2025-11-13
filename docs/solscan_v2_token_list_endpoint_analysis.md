# Solscan Pro API v2.0 - Token List Endpoint Analysis

## Overview
**Endpoint:** `GET https://pro-api.solscan.io/v2.0/token/list`  
**Description:** Retrieve a paginated list of tokens with sorting and filtering options.  
**API Version:** v2.0 Pro API  

## Access Requirements

### Authentication
- **Type:** API Key required
- **Header:** Authorization (specific format not detailed in documentation)
- **Status:** Authentication failure returns HTTP 401
- **Access Level:** Pro API (subscription required)

### Rate Limits
- **Limit Type:** Request throttling implemented
- **Error Response:** HTTP 429 (Too Many Requests) when limit exceeded
- **Specific Limits:** Not explicitly stated in documentation
- **Maximum Items:** Up to 50,000 items per query through pagination

## Parameters

### Query Parameters
| Parameter | Type | Required | Allowed Values | Default | Description |
|-----------|------|----------|----------------|---------|-------------|
| `sort_by` | string | No | `holder`, `market_cap`, `created_time` | - | Field to sort tokens by |
| `sort_order` | string | No | `asc`, `desc` | - | Sort order direction |
| `page` | number | No | - | 1 | Page number for pagination |
| `page_size` | number | No | 10, 20, 30, 40, 60, 100 | - | Items per page (6 options only) |

## Response Format

### Success Response (HTTP 200)
```json
{
  "success": true,
  "data": [
    {
      "address": "string",          // Token address
      "decimals": number,           // Token decimal places
      "name": "string",             // Token name
      "symbol": "string",           // Token symbol
      "market_cap": number,         // Current market cap
      "price": number,              // Current price
      "price_24h_change": number,   // 24h price change percentage
      "holder": number,             // Number of holders
      "created_time": number        // Unix epoch creation time
    }
  ]
}
```

### Error Responses

#### HTTP 400 - Bad Request
```json
{
  "success": false,
  "errors": {
    "code": 1100,
    "message": "Validation Error: \"sort_order\" must be one of [asc, desc]"
  }
}
```

#### HTTP 401 - Authentication Failed
- Authentication required or invalid credentials

#### HTTP 429 - Too Many Requests
- Rate limit exceeded

#### HTTP 500 - Internal Server Error
- Unexpected server error

## Code Examples

### JavaScript (Fetch API)
```javascript
const requestOptions = {
  method: "get",
};

fetch("https://pro-api.solscan.io/v2.0/token/list?page=1")
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));
```

### Other Languages
- Python
- Shell
- Go  
- C#

## Limitations and Restrictions

### Query Limits
- **Maximum Items per Query:** 50,000 (through pagination)
- **Page Size Options:** Limited to 6 predefined values (10, 20, 30, 40, 60, 100 items)
- **Pagination:** Requires both `page` and `page_size` parameters for large datasets

### Data Constraints
- **Sort Fields:** Limited to 3 predefined fields (holder, market_cap, created_time)
- **Sort Order:** Only ascending/descending options available

### API Access
- **Subscription Required:** This is a Pro API endpoint
- **Authentication Mandatory:** All requests require valid API key
- **Rate Limiting:** Implemented but specific limits not disclosed

## Use Cases

### Recommended Usage
- Token market analysis and research
- Portfolio tracking and management
- DeFi protocol token discovery
- Market cap ranking and trending analysis

### Best Practices
1. **Pagination:** Use appropriate `page_size` values to avoid hitting rate limits
2. **Sorting:** Choose relevant `sort_by` fields for your use case
3. **Caching:** Implement client-side caching for frequently accessed data
4. **Error Handling:** Implement proper error handling for all HTTP status codes

## Related Endpoints
- `v2-token-holders` - Get token holder information
- `v2-token-top` - Get top performing tokens
- `v2-token-price` - Get token price data
- `v2-token-markets` - Get token market information

## Technical Notes
- **Response Time:** Not specified in documentation
- **Data Freshness:** Real-time data implied but exact update frequency not stated
- **Geographic Restrictions:** Not mentioned
- **Data Retention:** Not specified
- **SLA/Uptime:** Not provided in documentation

---

*Documentation extracted on: 2025-11-14*  
*Source: https://pro-api.solscan.io/pro-api-docs/v2.0/reference/v2-token-list*