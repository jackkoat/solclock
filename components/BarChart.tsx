'use client';

import { useEffect, useRef } from 'react';

interface BarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
      borderWidth?: number;
    }[];
  };
  title?: string;
  height?: number;
  maxValue?: number;
  horizontal?: boolean;
  showGrid?: boolean;
}

export default function BarChart({ 
  data, 
  title, 
  height = 300, 
  maxValue,
  horizontal = false,
  showGrid = true 
}: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const initChart = async () => {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);

      const ctx = canvasRef.current!.getContext('2d');
      if (!ctx) return;

      // Destroy existing chart
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: horizontal ? 'y' as const : 'x' as const,
        plugins: {
          legend: {
            display: data.datasets.length > 1,
            position: 'top' as const,
          },
          title: {
            display: !!title,
            text: title,
            font: {
              size: 16,
              weight: 'bold' as const,
            },
            color: '#1a202c'
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: maxValue,
            grid: {
              display: showGrid,
              color: '#f8fafc'
            },
            ticks: {
              color: '#64748b',
              font: {
                size: 12
              }
            }
          },
          y: {
            beginAtZero: true,
            max: maxValue,
            grid: {
              display: showGrid,
              color: '#f8fafc'
            },
            ticks: {
              color: '#64748b',
              font: {
                size: 12
              },
              callback: function(value: any) {
                if (value >= 1000000) {
                  return (value / 1000000).toFixed(1) + 'M';
                } else if (value >= 1000) {
                  return (value / 1000).toFixed(1) + 'K';
                }
                return value;
              }
            }
          }
        },
        animation: {
          duration: 750,
          easing: 'easeInOutQuart' as const,
        },
      };

      // Default colors if not provided
      const datasets = data.datasets.map((dataset, index) => ({
        ...dataset,
        backgroundColor: dataset.backgroundColor || `hsl(${220 + index * 30}, 70%, 50%)`,
        borderColor: dataset.borderColor || `hsl(${220 + index * 30}, 70%, 40%)`,
        borderWidth: dataset.borderWidth || 1,
      }));

      chartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets,
        },
        options,
      });
    };

    initChart();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, title, height, maxValue, horizontal, showGrid]);

  return (
    <div style={{ height: `${height}px`, position: 'relative' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

// Loading state component
export function BarChartSkeleton({ height = 300, title = 'Loading...' }: { height?: number; title?: string }) {
  return (
    <div className="bg-bg-secondary rounded-lg p-4" style={{ height: `${height + 80}px` }}>
      <h3 className="text-lg font-semibold mb-4 text-text-primary">{title}</h3>
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-teal border-t-transparent"></div>
      </div>
    </div>
  );
}