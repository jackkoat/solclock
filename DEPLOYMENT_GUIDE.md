# Deployment and Testing Guide

## Quick Start

### Step 1: Deploy the Updated Code

Since this is a Vercel deployment, you have several options:

#### Option A: Git Push (Recommended)
```bash
git push origin main
```
Vercel will automatically detect the changes and redeploy.

#### Option B: Vercel CLI
```bash
vercel --prod
```

#### Option C: Vercel Dashboard
- Go to your Vercel project dashboard
- Click "Redeploy" on the latest deployment

### Step 2: Initialize the Database with Data

Once deployed, make a POST request to the init endpoint:

```bash
curl -X POST https://qiuyt5ll07n7.space.minimax.io/api/init \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "message": "Mock data generated successfully"
}
```

This will generate:
- 50 tokens (10 real meme coins + 40 generated tokens)
- 24 hours of network statistics
- 24 hours of token-specific statistics
- Whale activity for top 20 tokens
- Populated token_details_cache

### Step 3: Verify the Integration

Test each endpoint to ensure data is being fetched correctly:

#### 1. Test Top Meme Coins
```bash
curl https://qiuyt5ll07n7.space.minimax.io/api/top-meme | jq .
```

Expected: List of 50 tokens with rankings and scores

#### 2. Test Network Stats
```bash
curl https://qiuyt5ll07n7.space.minimax.io/api/network/stats | jq .
```

Expected: Current network statistics (transactions, blocks, wallets)

#### 3. Test Network Pulse
```bash
curl https://qiuyt5ll07n7.space.minimax.io/api/network/pulse | jq .
```

Expected: 24-hour network activity data

#### 4. Test Token Details
```bash
curl "https://qiuyt5ll07n7.space.minimax.io/api/token/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/details" | jq .
```

Expected: Token details including whale activity

#### 5. Test Whale Activity
The whale activity should now be real data from the database, not mock:
```bash
curl "https://qiuyt5ll07n7.space.minimax.io/api/token/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/details" | jq '.data.whale_activity'
```

#### 6. Test Watchlist
```bash
# GET watchlist
curl "https://qiuyt5ll07n7.space.minimax.io/api/watchlist?user_id=demo-user" | jq .

# POST to watchlist
curl -X POST https://qiuyt5ll07n7.space.minimax.io/api/watchlist \
  -H "Content-Type: application/json" \
  -d '{"user_id":"demo-user","token_address":"DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"}' | jq .
```

### Step 4: Test the UI

Visit the deployed website and verify:

1. **Homepage**: Token rankings should load and display
2. **Token Details**: Click on a token to see its details
3. **Whale Activity**: Should show real transactions, not random data
4. **Network Stats**: Should display current network metrics
5. **Alerts**: Should show dynamic alerts based on network activity

## Troubleshooting

### Issue: Empty Data Responses

**Symptom**: API returns `{ "success": false, "error": "No data available" }`

**Solution**: 
1. Ensure `/api/init` was called successfully
2. Check Supabase dashboard to verify data was inserted
3. Check the logs: In Vercel dashboard, go to Functions > Logs

### Issue: 404 on Watchlist Endpoint

**Symptom**: Watchlist operations fail with table not found

**Solution**: 
- Verify the database schema was applied correctly
- Check that the table is named `watchlists` (plural) not `watchlist`

### Issue: Whale Activity Not Showing

**Symptom**: Token details page shows empty whale activity

**Solution**:
1. Call `/api/init` again to regenerate whale activity
2. Check that whale_activity table exists in Supabase
3. Verify the token address is correct

### Issue: Performance Issues

**Symptom**: Top meme endpoint is slow

**Solution**:
- Ensure token_details_cache is populated
- Check that database indexes are created
- Consider running a cache refresh periodically

## Maintenance

### Refreshing Data

To keep data fresh, you can set up a cron job to call the refresh endpoint:

```bash
# Manual refresh
curl -X POST https://qiuyt5ll07n7.space.minimax.io/api/refresh
```

This will trigger the edge function to fetch new Solana data.

### Monitoring

Monitor your application:
1. Vercel Dashboard > Analytics
2. Supabase Dashboard > Database > Usage
3. Check error rates and response times

### Cache Updates

The token_details_cache should be refreshed regularly. Consider:
1. Creating a Supabase cron job to call `updateTokenDetailsCache()`
2. Using Vercel Cron Jobs to trigger updates
3. Implementing a background job

## Success Criteria

You'll know the integration is successful when:

- [ ] All API endpoints return real data (not mock)
- [ ] Token rankings update based on actual statistics
- [ ] Whale activity shows different transactions for each token
- [ ] Watchlist operations work without errors
- [ ] Network stats reflect database values
- [ ] No console errors in browser
- [ ] All loading states work correctly
- [ ] Error states handle empty data gracefully

## Next Steps

After successful deployment and testing:

1. **Add Real-Time Updates**: Consider implementing Supabase real-time subscriptions
2. **Optimize Queries**: Add more indexes if queries are slow
3. **Implement Authentication**: Currently using demo user for watchlist
4. **Add More Features**: Use the token_rankings table for historical data
5. **Set Up Monitoring**: Implement error tracking and performance monitoring

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase logs (Dashboard > Logs)
3. Verify environment variables are set correctly
4. Ensure database schema matches the expected structure
