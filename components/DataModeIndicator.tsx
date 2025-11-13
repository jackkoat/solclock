'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Database, Wifi, Clock } from 'lucide-react';

interface DataModeIndicatorProps {
  className?: string;
}

interface DataMode {
  mode: 'real' | 'mock' | 'hybrid';
  source: string;
  lastUpdate: string;
  description: string;
  action: {
    text: string;
    onClick: () => void;
  } | undefined;
}

export default function DataModeIndicator({ className = '' }: DataModeIndicatorProps) {
  const [dataMode, setDataMode] = useState<DataMode | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check data source and mode every time component mounts
    checkDataMode();
  }, []);

  const checkDataMode = async () => {
    try {
      // Test multiple data sources to determine real vs mock data
      const tests = await Promise.allSettled([
        testRealTimeData(),
        testDatabaseData(),
        testAPIData()
      ]);

      const [realTimeTest, databaseTest, apiTest] = tests;

      let mode: 'real' | 'mock' | 'hybrid' = 'mock';
      let source = 'Mock Data (Initialization Required)';
      let description = 'The dashboard is currently showing simulated data for demonstration.';
      let action: {
        text: string;
        onClick: () => void;
      } | undefined = {
        text: 'Initialize Real Data',
        onClick: initializeRealData
      };

      // Determine if we have real data
      const hasRealTimeData = realTimeTest.status === 'fulfilled' && realTimeTest.value;
      const hasDatabaseData = databaseTest.status === 'fulfilled' && databaseTest.value;
      const hasAPIData = apiTest.status === 'fulfilled' && apiTest.value;

      if (hasRealTimeData || hasDatabaseData || hasAPIData) {
        if (hasRealTimeData && (hasDatabaseData || hasAPIData)) {
          mode = 'hybrid';
          source = 'Real-Time + Database (Optimal)';
          description = 'Mix of live blockchain data and cached database records.';
          action = undefined; // No action needed
        } else if (hasRealTimeData) {
          mode = 'real';
          source = 'Live Blockchain Data';
          description = 'Real-time Solana network data from RPC endpoints.';
          action = undefined;
        } else {
          mode = 'hybrid';
          source = 'Cached Database Records';
          description = 'Recent data from database with fallback APIs.';
          action = {
            text: 'Enable Live Data',
            onClick: enableLiveData
          };
        }
      }

      setDataMode({
        mode,
        source,
        lastUpdate: new Date().toISOString(),
        description,
        action
      });

      // Show indicator if not in optimal mode
      setIsVisible(mode === 'mock' || mode === 'hybrid');

    } catch (error) {
      console.error('Error checking data mode:', error);
      setDataMode({
        mode: 'mock',
        source: 'Error State',
        lastUpdate: new Date().toISOString(),
        description: 'Unable to determine data source. Please refresh or initialize data.',
        action: {
          text: 'Refresh Data',
          onClick: () => window.location.reload()
        }
      });
      setIsVisible(true);
    }
  };

  const testRealTimeData = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/network/stats');
      const data = await response.json();
      
      // Check if data looks realistic (not generated/fallback)
      if (data.success && data.data?.estimated_tps > 100) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const testDatabaseData = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/top-meme');
      const data = await response.json();
      
      // Check if we have real tokens (not just mock data)
      if (data.success && data.data?.rankings?.length > 0) {
        const realTokens = data.data.rankings.filter((token: any) => 
          token.token_address && !token.token_address.includes('generated')
        );
        return realTokens.length > 5;
      }
      return false;
    } catch {
      return false;
    }
  };

  const testAPIData = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/charts/network-activity');
      const data = await response.json();
      
      // Check if API is returning real data
      if (data.success && data.data?.points?.length > 0) {
        return !data.data.points[0].is_fallback;
      }
      return false;
    } catch {
      return false;
    }
  };

  const initializeRealData = async () => {
    try {
      const response = await fetch('/api/init', { method: 'POST' });
      if (response.ok) {
        await checkDataMode();
      }
    } catch (error) {
      console.error('Failed to initialize real data:', error);
    }
  };

  const enableLiveData = async () => {
    // This would trigger real API calls
    window.location.reload();
  };

  if (!isVisible || !dataMode) {
    return null;
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'real': return 'text-green-600 bg-green-100';
      case 'hybrid': return 'text-yellow-600 bg-yellow-100';
      case 'mock': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'real': return <Wifi className="w-4 h-4" />;
      case 'hybrid': return <Database className="w-4 h-4" />;
      case 'mock': return <Clock className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className={`max-w-sm rounded-lg border border-border-light p-4 shadow-lg ${
        dataMode.mode === 'mock' ? 'bg-red-50 border-red-200' : 
        dataMode.mode === 'hybrid' ? 'bg-yellow-50 border-yellow-200' : 
        'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-1.5 rounded-full ${getModeColor(dataMode.mode)}`}>
            {getModeIcon(dataMode.mode)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-semibold text-text-primary truncate">
                Data Mode: {dataMode.mode.toUpperCase()}
              </h4>
              <button 
                onClick={() => setIsVisible(false)}
                className="text-text-secondary hover:text-text-primary ml-2"
              >
                ×
              </button>
            </div>
            
            <p className="text-xs text-text-secondary mb-2">
              {dataMode.description}
            </p>
            
            <div className="text-xs text-text-tertiary mb-3">
              <div>Source: {dataMode.source}</div>
              <div>Last check: {new Date(dataMode.lastUpdate).toLocaleTimeString()}</div>
            </div>

            {dataMode.action && (
              <button
                onClick={dataMode.action.onClick}
                className="w-full px-3 py-2 text-xs font-medium rounded-md transition-colors bg-primary-teal text-white hover:bg-primary-teal/90"
              >
                {dataMode.action.text}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}