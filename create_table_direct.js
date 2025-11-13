const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://ifkdvtrhpvavgmkwlcxm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlma2R2dHJocHZhdmdta3dsY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkyODExNSwiZXhwIjoyMDc4NTA0MTE1fQ.Y9CXrjlMrw_gimJ6pYjn_AhhHdkOf2SfYHQXzMcraoY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTransactionChartsTable() {
  try {
    console.log('🔄 Creating transaction_charts table...');
    
    // SQL for creating the table
    const sql = `
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
      
      CREATE INDEX IF NOT EXISTS idx_transaction_charts_interval ON transaction_charts(interval_start, interval_end);
      CREATE INDEX IF NOT EXISTS idx_transaction_charts_created ON transaction_charts(created_at);
      
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      DROP TRIGGER IF EXISTS update_transaction_charts_updated_at ON transaction_charts;
      CREATE TRIGGER update_transaction_charts_updated_at
          BEFORE UPDATE ON transaction_charts
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `;
    
    // Try to execute using raw SQL query
    const { data, error } = await supabase.rpc('query', { query: sql });
    
    if (error) {
      console.log('❌ Direct RPC failed, trying alternative method...');
      
      // Alternative: Try to insert a test record to create table if it doesn't exist
      try {
        const { error: insertError } = await supabase
          .from('transaction_charts')
          .insert({
            interval_start: new Date(),
            interval_end: new Date(),
            total_transactions: 0,
            total_volume: 0,
            unique_wallets: 0,
            data_source: 'test-creation'
          });
        
        if (insertError && insertError.message.includes('does not exist')) {
          console.log('❌ Table does not exist and cannot be created automatically');
          console.log('Please create the table manually in Supabase Dashboard SQL Editor with:');
          console.log(sql);
        } else if (!insertError) {
          console.log('✅ Table created successfully by test insertion!');
          // Clean up the test record
          await supabase.from('transaction_charts').delete().eq('data_source', 'test-creation');
          console.log('🧹 Cleaned up test record');
        }
      } catch (e) {
        console.log('❌ Alternative method failed:', e.message);
      }
    } else {
      console.log('✅ Table created successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
  }
}

// Run the function
createTransactionChartsTable();