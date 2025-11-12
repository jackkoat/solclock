Deno.serve(async (_req) => {
    try {
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        console.log(`[${new Date().toISOString()}] Cron job triggered - updating Solana data`);

        // Call the fetch-solana-data function
        const fetchUrl = `${supabaseUrl}/functions/v1/fetch-solana-data`;
        const response = await fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Data fetch failed: ${errorText}`);
        }

        const result = await response.json();
        
        console.log(`[${new Date().toISOString()}] Cron job completed successfully`);
        console.log('Result:', JSON.stringify(result));

        return new Response(JSON.stringify({
            success: true,
            timestamp: new Date().toISOString(),
            result
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Cron job failed:`, error);

        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});
