import React, { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { ThemedText, ThemedView } from './ThemeWrapper';
import { useTheme } from '../contexts/ThemeContext';

// Types
export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface LinearChartProps {
  // Chart type
  type: 'line' | 'progress';
  
  // Data
  data?: ChartDataPoint[];
  currentValue?: number;
  targetValue?: number;
  
  // Styling
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  
  // Chart configuration
  height?: number;
  showTooltips?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  
  // Progress bar specific
  progressPercentage?: number;
  
  // Labels
  title?: string;
  subtitle?: string;
  
  // Callbacks
  onDataPointPress?: (dataPoint: ChartDataPoint) => void;
}

/**
 * LinearChart Component
 * 
 * A modular chart component that supports both line charts and progress bars.
 * Uses react-native-svg for better rendering and dark theme support.
 * 
 * @example
 * // Line Chart
 * <LinearChart
 *   type="line"
 *   data={[
 *     { label: 'Jan', value: 1000 },
 *     { label: 'Feb', value: 1500 },
 *     { label: 'Mar', value: 2000 }
 *   ]}
 *   primaryColor="#0ea5e9"
 *   title="Savings Progress"
 *   onDataPointPress={(point) => console.log(point)}
 * />
 * 
 * @example
 * // Progress Bar
 * <LinearChart
 *   type="progress"
 *   currentValue={3200}
 *   targetValue={5000}
 *   primaryColor="#0ea5e9"
 *   secondaryColor="#bae6fd"
 *   title="Savings Goal"
 * />
 */
const LinearChart: React.FC<LinearChartProps> = ({
  type = 'line',
  data = [],
  currentValue = 0,
  targetValue = 0,
  primaryColor,
  secondaryColor,
  backgroundColor,
  height = 240,
  showTooltips = true,
  showGrid = true,
  showLabels = true,
  progressPercentage,
  title,
  subtitle,
  onDataPointPress,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const { colors } = useTheme();
  
  // Use theme colors if not provided
  const chartPrimaryColor = primaryColor || colors.primary;
  const chartSecondaryColor = secondaryColor || colors.textSecondary;
  const chartBackgroundColor = backgroundColor || colors.card;
  
  const chartWidth = windowWidth - 120; // Account for padding
  const chartHeight = height;
  const padding = 40;
  const chartAreaWidth = chartWidth - (padding * 2);
  const chartAreaHeight = chartHeight - (padding * 2);
  
  const [tooltipPos, setTooltipPos] = useState<{
    x: number;
    y: number;
    value: string;
    label: string;
  } | null>(null);

  // Format currency helper
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate chart dimensions and scales
  const getChartDimensions = () => {
    if (data.length === 0) return { xScale: 0, yScale: 0, minY: 0, maxY: 0 };
    
    const values = data.map(point => point.value);
    const minY = Math.min(...values, 0);
    const maxY = Math.max(...values, 0);
    const yRange = maxY - minY || 1;
    
    const xScale = chartAreaWidth / (data.length - 1);
    const yScale = chartAreaHeight / yRange;
    
    return { xScale, yScale, minY, maxY };
  };

  // Generate line chart path
  const generateLinePath = () => {
    if (data.length === 0) return '';
    
    const { xScale, yScale, minY } = getChartDimensions();
    
    return data.map((point, index) => {
      const x = padding + (index * xScale);
      const y = padding + chartAreaHeight - ((point.value - minY) * yScale);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // Generate grid lines
  const generateGridLines = () => {
    if (!showGrid || data.length === 0) return null;
    
    const { yScale, minY, maxY } = getChartDimensions();
    const yRange = maxY - minY;
    const gridLines = [];
    
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i * chartAreaHeight / 4);
      const value = maxY - (i * yRange / 4);
      
      gridLines.push(
        <Line
          key={`grid-${i}`}
          x1={padding}
          y1={y}
          x2={padding + chartAreaWidth}
          y2={y}
          stroke={colors.border}
          strokeWidth={0.5}
          strokeDasharray="5,5"
          opacity={0.3}
        />
      );
    }
    
    return gridLines;
  };

  // Generate data points
  const generateDataPoints = () => {
    if (data.length === 0) return null;
    
    const { xScale, yScale, minY } = getChartDimensions();
    
    return data.map((point, index) => {
      const x = padding + (index * xScale);
      const y = padding + chartAreaHeight - ((point.value - minY) * yScale);
      
      return (
        <Circle
          key={`point-${index}`}
          cx={x}
          cy={y}
          r={6}
          fill={chartBackgroundColor}
          stroke={chartPrimaryColor}
          strokeWidth={3}
          onPress={() => {
            if (onDataPointPress) {
              onDataPointPress(point);
            }
            if (showTooltips) {
              setTooltipPos({
                x,
                y,
                value: formatCurrency(point.value),
                label: point.label,
              });
            }
          }}
        />
      );
    });
  };

  // Generate Y-axis labels
  const generateYLabels = () => {
    if (!showLabels || data.length === 0) return null;
    
    const { minY, maxY } = getChartDimensions();
    const yRange = maxY - minY;
    const labels = [];
    
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i * chartAreaHeight / 4);
      const value = maxY - (i * yRange / 4);
      
      labels.push(
        <SvgText
          key={`y-label-${i}`}
          x={padding - 10}
          y={y + 4}
          fontSize={10}
          fill={colors.textSecondary}
          textAnchor="end"
        >
          {formatCurrency(value)}
        </SvgText>
      );
    }
    
    return labels;
  };

  // Generate X-axis labels
  const generateXLabels = () => {
    if (!showLabels || data.length === 0) return null;
    
    const { xScale } = getChartDimensions();
    
    return data.map((point, index) => {
      const x = padding + (index * xScale);
      
      return (
        <SvgText
          key={`x-label-${index}`}
          x={x}
          y={chartHeight - 10}
          fontSize={10}
          fill={colors.textSecondary}
          textAnchor="middle"
        >
          {point.label}
        </SvgText>
      );
    });
  };

  // Render line chart
  const renderLineChart = () => (
    <View className="w-full">
      {(title || subtitle) && (
        <View className="mb-4">
          {title && <ThemedText className="text-lg font-semibold text-center">{title}</ThemedText>}
          {subtitle && <ThemedText className="text-sm text-center mt-1" variant="secondary">{subtitle}</ThemedText>}
        </View>
      )}
      
      <ThemedView className="rounded-2xl p-4 items-center relative shadow-lg shadow-black/5" variant="card">
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={chartPrimaryColor} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={chartPrimaryColor} stopOpacity="0.1" />
            </LinearGradient>
          </Defs>
          
          {/* Background */}
          <Rect
            x={padding}
            y={padding}
            width={chartAreaWidth}
            height={chartAreaHeight}
            fill={chartBackgroundColor}
            rx={8}
          />
          
          {/* Grid lines */}
          {generateGridLines()}
          
          {/* Y-axis labels */}
          {generateYLabels()}
          
          {/* X-axis labels */}
          {generateXLabels()}
          
          {/* Line path */}
          <Path
            d={generateLinePath()}
            stroke={chartPrimaryColor}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Area fill */}
          <Path
            d={`${generateLinePath()} L ${padding + chartAreaWidth} ${padding + chartAreaHeight} L ${padding} ${padding + chartAreaHeight} Z`}
            fill="url(#lineGradient)"
          />
          
          {/* Data points */}
          {generateDataPoints()}
          
          {/* Tooltip indicator */}
          {tooltipPos && showTooltips && (
            <>
              <Line
                x1={tooltipPos.x}
                y1={padding}
                x2={tooltipPos.x}
                y2={padding + chartAreaHeight}
                stroke={colors.primary}
                strokeWidth={1}
                strokeDasharray="3,3"
              />
              <Circle
                cx={tooltipPos.x}
                cy={tooltipPos.y}
                r={4}
                fill={colors.primary}
              />
            </>
          )}
        </Svg>
        
        {/* Tooltip */}
        {tooltipPos && showTooltips && (
          <View
            className="absolute bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg"
            style={{
              left: tooltipPos.x - 50,
              top: tooltipPos.y - 60,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <ThemedText className="text-sm font-bold text-center" style={{ color: colors.textPrimary }}>
              {tooltipPos.value}
            </ThemedText>
            <ThemedText className="text-xs text-center" style={{ color: colors.textSecondary }}>
              {tooltipPos.label}
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </View>
  );

  // Render progress bar
  const renderProgressBar = () => {
    const percentage = progressPercentage ?? (targetValue > 0 ? (currentValue / targetValue) * 100 : 0);
    
    return (
      <View className="w-full">
        {(title || subtitle) && (
          <View className="mb-4">
            {title && <ThemedText className="text-lg font-semibold text-center">{title}</ThemedText>}
            {subtitle && <ThemedText className="text-sm text-center mt-1" variant="secondary">{subtitle}</ThemedText>}
          </View>
        )}
        
        <View className="mb-4">
          <View 
            className="w-full h-3 rounded-full overflow-hidden mb-2"
            style={{ backgroundColor: chartSecondaryColor }}
          >
            <View 
              className="h-full rounded-full"
              style={{ 
                backgroundColor: chartPrimaryColor,
                width: `${Math.min(percentage, 100)}%` 
              }}
            />
          </View>
          <ThemedText className="text-sm text-center font-medium" variant="secondary">
            {percentage.toFixed(1)}% completado
          </ThemedText>
        </View>
        
        {targetValue > 0 && (
          <View className="flex-row justify-between items-center">
            <View className="items-center flex-1">
              <ThemedText className="text-xs font-medium mb-1" variant="secondary">Objetivo:</ThemedText>
              <ThemedText className="text-base font-bold">{formatCurrency(targetValue)}</ThemedText>
            </View>
            <View className="items-center flex-1">
              <ThemedText className="text-xs font-medium mb-1" variant="secondary">Actual:</ThemedText>
              <ThemedText className="text-base font-bold">{formatCurrency(currentValue)}</ThemedText>
            </View>
            <View className="items-center flex-1">
              <ThemedText className="text-xs font-medium mb-1" variant="secondary">Faltante:</ThemedText>
              <ThemedText className="text-base font-bold">{formatCurrency(targetValue - currentValue)}</ThemedText>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="w-full">
      {type === 'line' ? renderLineChart() : renderProgressBar()}
    </View>
  );
};

export default LinearChart; 