Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Fetch Solana network stats from public RPC
        const rpcUrl = 'https://api.mainnet-beta.solana.com';
        
        // Get recent performance samples
        const perfResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getRecentPerformanceSamples',
                params: [1]
            })
        });

        const perfData = await perfResponse.json();
        const sample = perfData.result?.[0];

        // Get slot info
        const slotResponse = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 2,
                method: 'getSlot',
                params: []
            })
        });

        const slotData = await slotResponse.json();
        const currentSlot = slotData.result;

        // Fetch popular Solana meme coins from DexScreener
        const dexResponse = await fetch('https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        const dexData = await dexResponse.json();

        // Process network stats
        const networkStats = {
            hour: new Date().toISOString(),
            total_transactions: sample?.numTransactions || 0,
            blocks: Math.floor(currentSlot / 432000) || 0, // Approximate blocks
            wallets: 0, // Not available from public RPC
            avg_cu: 0 // Not available from public RPC
        };

        // Insert network stats
        const networkInsertResponse = await fetch(`${supabaseUrl}/rest/v1/network_hourly_stats`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(networkStats)
        });

        if (!networkInsertResponse.ok) {
            const errorText = await networkInsertResponse.text();
            console.error('Network stats insert failed:', errorText);
        }

        // Process top pairs from DexScreener
        const pairs = dexData.pairs?.slice(0, 50) || [];
        const tokens = [];
        const tokenStats = [];

        for (const pair of pairs) {
            const baseToken = pair.baseToken;
            if (!baseToken?.address) continue;

            // Token metadata
            tokens.push({
                token_address: baseToken.address,
                symbol: baseToken.symbol || 'UNKNOWN',
                name: baseToken.name || 'Unknown Token',
                logo_url: pair.info?.imageUrl || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            // Token stats
            tokenStats.push({
                token_address: baseToken.address,
                hour: new Date().toISOString(),
                tx_count: pair.txns?.h24?.buys + pair.txns?.h24?.sells || 0,
                volume: parseFloat(pair.volume?.h24 || '0'),
                buyers: pair.txns?.h24?.buys || 0,
                holders: 0, // Not available from DexScreener
                liquidity: parseFloat(pair.liquidity?.usd || '0')
            });
        }

        // Batch insert tokens (upsert)
        if (tokens.length > 0) {
            const tokensInsertResponse = await fetch(`${supabaseUrl}/rest/v1/tokens`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify(tokens)
            });

            if (!tokensInsertResponse.ok) {
                const errorText = await tokensInsertResponse.text();
                console.error('Tokens insert failed:', errorText);
            }
        }

        // Batch insert token stats
        if (tokenStats.length > 0) {
            const statsInsertResponse = await fetch(`${supabaseUrl}/rest/v1/token_hourly_stats`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify(tokenStats)
            });

            if (!statsInsertResponse.ok) {
                const errorText = await statsInsertResponse.text();
                console.error('Token stats insert failed:', errorText);
            }
        }

        return new Response(JSON.stringify({
            data: {
                message: 'Data fetched and stored successfully',
                tokens_processed: tokens.length,
                network_stats: networkStats
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Data fetch error:', error);

        const errorResponse = {
            error: {
                code: 'DATA_FETCH_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
