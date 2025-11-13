// Create transaction_charts table
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ifkdvtrhpvavgmkwlcxm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlma2R2dHJocHZhdmdta3dsY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkyODExNSwiZXhwIjoyMDc4NTA0MTE1fQ.Y9CXrjlMrw_gimJ6pYjn_AhhHdkOf2SfYHQXzMcraoY'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTransactionChartsTable() {
  try {
    // Execute the SQL to create transaction_charts table
    const sql = `
      -- Create transaction charts table for barchart data
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

    // Note: For Supabase, we'll need to use the SQL editor or execute this through the Management API
    console.log('✅ SQL prepared for transaction_charts table creation');
    console.log('SQL to execute:', sql);
    
    return {
      success: true,
      message: 'SQL prepared successfully. Table creation requires Supabase SQL execution.',
      sql: sql
    };
  } catch (error) {
    console.error('❌ Error preparing transaction_charts table:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

createTransactionChartsTable().then(result => {
  console.log('Result:', JSON.stringify(result, null, 2));
  process.exit(0);
});
