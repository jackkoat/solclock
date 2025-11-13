-- Create edge function to execute SQL for table creation
-- Edge function to create transaction_charts table

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = 'https://ifkdvtrhpvavgmkwlcxm.supabase.co';

    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not found');
    }

    // SQL to create transaction_charts table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS transaction_charts (
        id SERIAL PRIMARY KEY,
        interval_start TIMESTAMP NOT NULL,
        interval_end TIMESTAMP NOT NULL,
        total_transactions INTEGER DEFAULT 0,
        total_volume DECIMAL(20,2) DEFAULT 0,
        avg_transaction_size DECIMAL(20,2) DEFAULT 0,
        unique_wallets INTEGER DEFAULT 0,
        data_source VARCHAR(50) DEFAULT 'solscan-api',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Create indexes for efficient querying
      CREATE INDEX IF NOT EXISTS idx_transaction_charts_interval ON transaction_charts(interval_start, interval_end);
      CREATE INDEX IF NOT EXISTS idx_transaction_charts_created ON transaction_charts(created_at);

      -- Function to automatically update updated_at timestamp
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create trigger for updated_at
      DROP TRIGGER IF EXISTS update_transaction_charts_updated_at ON transaction_charts;
      CREATE TRIGGER update_transaction_charts_updated_at
          BEFORE UPDATE ON transaction_charts
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `;

    // Execute the SQL using Supabase Management API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: createTableSQL
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create table: ${errorText}`);
    }

    const result = await response.json();

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'transaction_charts table created successfully',
      result: result 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating table:', error);
    
    return new Response(JSON.stringify({
      error: {
        code: 'TABLE_CREATION_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
