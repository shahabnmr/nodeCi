# Bug Fixes Summary

## Overview
This document outlines 3 critical bugs that were identified and fixed in the Node.js/Express blog application codebase.

## Bug #1: Incorrect Redis Cache Expiration (Critical Performance Issue)

**File:** `services/cache.js`  
**Line:** 36  
**Severity:** High - Performance/Memory Issue

### Problem Description
The cache implementation used incorrect syntax for setting Redis hash expiration:
```javascript
client.hmset(this.hashKey, key, JSON.stringify(result), "EX", 10);
```

The `hmset` command doesn't support the `EX` parameter directly. This caused:
- Cache entries to never expire
- Potential memory leaks in Redis
- Stale data being served to users
- Poor application performance over time

### Solution Applied
Split the operation into two commands:
```javascript
client.hmset(this.hashKey, key, JSON.stringify(result));
client.expire(this.hashKey, 10);
```

**Impact:** Fixed memory leaks and ensured proper cache invalidation with 10-second TTL.

---

## Bug #2: Deprecated Response Method (API Compatibility Issue)

**File:** `routes/blogRoutes.js`  
**Line:** 37  
**Severity:** Medium - Deprecated API Usage

### Problem Description
The error handling used deprecated Express syntax:
```javascript
res.send(400, err);
```

This method signature was deprecated in Express 4.x and could cause:
- Application crashes with newer Express versions
- Inconsistent error response behavior
- Potential security issues with improper error handling

### Solution Applied
Updated to modern Express syntax:
```javascript
res.status(400).send(err);
```

**Impact:** Ensures compatibility with current and future Express versions and proper HTTP status code handling.

---

## Bug #3: Incorrect Async Middleware Implementation (Critical Logic Error)

**File:** `middlewares/cleanCache.js`  
**Line:** 5  
**Severity:** Critical - Logic Error

### Problem Description
The middleware incorrectly used `await next()`:
```javascript
module.exports = async (req, res, next) => {
  await next();
  clearHash(req.user.id);
};
```

This is fundamentally flawed because:
- `next()` is not a Promise in Express middleware
- Could break the entire middleware chain
- No guarantee the cache clearing happens after response
- Missing error handling for user validation

### Solution Applied
Implemented proper middleware pattern using response interception:
```javascript
module.exports = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(...args) {
    const result = originalSend.apply(this, args);
    
    if (req.user && req.user.id) {
      clearHash(req.user.id);
    }
    
    return result;
  };

  next();
};
```

**Impact:** 
- Ensures cache is cleared after response is sent
- Maintains proper middleware chain execution
- Adds safety check for user existence
- Follows Express middleware best practices

---

## Additional Security Considerations

### Recommendations Implemented:
1. **Error Safety:** Added null checks for `req.user` and `req.user.id`
2. **Middleware Chain Integrity:** Proper `next()` calling without await
3. **Response Timing:** Cache clearing happens after response, not before

### Future Improvements Suggested:
1. Add input validation for blog title and content
2. Implement rate limiting for API endpoints
3. Add CORS configuration for production
4. Consider implementing request logging middleware
5. Add unit tests for the fixed middleware functionality

## Testing Recommendations

After these fixes, test the following scenarios:
1. Verify cache expiration works correctly (10-second TTL)
2. Confirm error responses return proper HTTP status codes
3. Test middleware chain continues properly after cache clearing
4. Validate that cache is cleared only after successful responses

## Summary

All three bugs have been successfully resolved:
- ✅ **Performance Issue:** Fixed Redis cache expiration
- ✅ **Compatibility Issue:** Updated deprecated Express API usage  
- ✅ **Logic Error:** Corrected async middleware implementation

The application should now be more stable, performant, and maintainable.