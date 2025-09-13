import React, { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient, Stop, Rect, G } from 'react-native-svg';
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
  /**
   * If true, the chart will render a horizontal reference line at 0 €.
   * Defaults to true.
   */
  showZeroLine?: boolean;
  /**
   * Stroke colours for the line segments when the values are:
   *  - above the goal (✔︎)
   *  - between the goal and 0 (⚠︎)
   *  - below 0 (✖︎)
   */
  segmentColors?: {
    aboveGoal: string;
    betweenGoalAndZero: string;
    belowZero: string;
  };
  
  // Styling
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  
  // Chart configuration
  height?: number;
  showTooltips?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  /**
   * If true, the y-axis will be adjusted to fit the data range (min to max of data).
   * If false, the y-axis will always include 0 and use nice rounded numbers.
   * Defaults to false.
   */
  fitDataRange?: boolean;
  
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
  showZeroLine = true,
  fitDataRange = false,
  segmentColors = {
    aboveGoal: '#22c55e',     // Tailwind green-500
    betweenGoalAndZero: '#eab308', // Tailwind yellow-500
    belowZero: '#ef4444',     // Tailwind red-500
  },
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
  const leftPadding = 60; // More space for Y-axis labels
  const chartAreaWidth = chartWidth - (leftPadding + padding);
  const chartAreaHeight = chartHeight - (padding * 2);
  
  const [tooltipPos, setTooltipPos] = useState<{
    x: number;
    y: number;
    value: string;
    label: string;
    color: string;
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
    const dataMinY = Math.min(...values);
    const dataMaxY = Math.max(...values);
    
    let minY, maxY;
    
    if (fitDataRange) {
      // Fit the data range exactly
      minY = dataMinY;
      maxY = dataMaxY;
      
      // Add some padding (10% of range)
      const padding = (dataMaxY - dataMinY) * 0.1;
      minY = dataMinY - padding;
      maxY = dataMaxY + padding;
    } else {
      // Always include 0 in the range
      minY = Math.min(dataMinY, 0);
      maxY = Math.max(dataMaxY, 0);
      
      // Round up to nice numbers for better Y-axis labels
      const yRange = maxY - minY;
      const niceRange = Math.ceil(yRange / 1000) * 1000; // Round up to nearest 1000
      const niceMinY = Math.floor(minY / 1000) * 1000; // Round down to nearest 1000
      const niceMaxY = niceMinY + niceRange;
      
      // Ensure 0 is always included
      minY = Math.min(niceMinY, 0);
      maxY = Math.max(niceMaxY, 0);
    }
    
    const finalRange = maxY - minY || 1;
    
    const xScale = chartAreaWidth / (data.length - 1);
    const yScale = chartAreaHeight / finalRange;
    
    return { xScale, yScale, minY, maxY };
  };

  /**
   * Generates one small SVG path per segment so we can colour them independently
   * depending on whether the segment is above the goal, between goal and 0 or below 0.
   */
  const generateSegmentPaths = () => {
    if (data.length < 2) return [] as { path: string; colour: string }[];
    const { xScale, yScale, minY } = getChartDimensions();
    
    // Theme-aware line color: white for dark theme, light grey for light theme
    const lineColor = colors.textPrimary === '#ffffff' ? '#ffffff' : '#9ca3af';
    
    return data.slice(0, -1).map((curr, idx) => {
      const next = data[idx + 1];
      const x1 = leftPadding + idx * xScale;
      const y1 = padding + chartAreaHeight - ((curr.value - minY) * yScale);
      const x2 = leftPadding + (idx + 1) * xScale;
      const y2 = padding + chartAreaHeight - ((next.value - minY) * yScale);

      return {
        path: `M ${x1} ${y1} L ${x2} ${y2}`,
        colour: lineColor,
      };
    });
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
          x1={leftPadding}
          y1={y}
          x2={leftPadding + chartAreaWidth}
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
      const x = leftPadding + (index * xScale);
      const y = padding + chartAreaHeight - ((point.value - minY) * yScale);
      
      // Determine point colour based on thresholds
      const goalRef = typeof targetValue === 'number' ? targetValue : 0;
      let pointColour: string;
      if (point.value >= goalRef) {
        pointColour = segmentColors.aboveGoal; // green
      } else if (point.value >= 0) {
        pointColour = segmentColors.betweenGoalAndZero; // yellow
      } else {
        pointColour = segmentColors.belowZero; // red
      }

      return (
        <G key={`point-group-${index}`}>
          {/* Invisible larger hitbox for better touch interaction */}
          <Circle
            cx={x}
            cy={y}
            r={20}
            fill="transparent"
            onPressIn={() => {
              if (onDataPointPress) {
                onDataPointPress(point);
              }
              if (showTooltips) {
                setTooltipPos({
                  x,
                  y,
                  value: formatCurrency(point.value),
                  label: point.label,
                  color: pointColour,
                });
              }
            }}
          />
          {/* Visual data point */}
          <Circle
            cx={x}
            cy={y}
            r={6}
            fill={chartBackgroundColor}
            stroke={pointColour}
            strokeWidth={3}
          />
        </G>
      );
    });
  };

  /** Horizontal reference lines (0 €, goal) */
  const generateReferenceLines = () => {
    const refs: React.ReactElement[] = [];
    const { yScale, minY, maxY } = getChartDimensions();
    
    // Always show zero line when showZeroLine is true, regardless of data range
    if (showZeroLine) {
      const y0 = padding + chartAreaHeight - ((0 - minY) * yScale);
      refs.push(
        <Line
          key="zero-line"
          x1={leftPadding}
          y1={y0}
          x2={leftPadding + chartAreaWidth}
          y2={y0}
          stroke="#ef4444" // Tailwind red-500
          strokeWidth={0.8}
          strokeDasharray="6,4"
        />
      );
    }
    
    if (typeof targetValue === 'number') {
      const goalY = padding + chartAreaHeight - ((targetValue - minY) * yScale);
      refs.push(
        <Line
          key="goal-line"
          x1={leftPadding}
          y1={goalY}
          x2={leftPadding + chartAreaWidth}
          y2={goalY}
          stroke="#22c55e" // Tailwind green-500
          strokeWidth={0.8}
          strokeDasharray="4,2"
        />
      );
    }
    return refs;
  };

  // Generate Y-axis labels
  const generateYLabels = () => {
    if (!showLabels || data.length === 0) return null;
    
    const { minY, maxY } = getChartDimensions();
    const yRange = maxY - minY;
    const labels = [];
    
    // Generate labels that include 0 and are evenly distributed
    const numLabels = 5; // Number of labels to show
    const step = yRange / (numLabels - 1);
    
    for (let i = 0; i < numLabels; i++) {
      const value = minY + (i * step);
      const y = padding + chartAreaHeight - ((value - minY) * (chartAreaHeight / yRange));
      
      // Round to nearest 100 for cleaner labels
      const roundedValue = Math.round(value / 100) * 100;
      
      labels.push(
        <SvgText
          key={`y-label-${i}`}
          x={leftPadding - 10}
          y={y + 4}
          fontSize={10}
          fill={colors.textSecondary}
          textAnchor="end"
        >
          {formatCurrency(roundedValue)}
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
      const x = leftPadding + (index * xScale);
      
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
          
          {/* Background */}
          <Rect
            x={leftPadding}
            y={padding}
            width={chartAreaWidth}
            height={chartAreaHeight}
            fill={chartBackgroundColor}
            rx={8}
          />
          
          {/* Grid lines */}
          {generateGridLines()}
          {/* Reference lines */}
          {generateReferenceLines()}
          
          {/* Y-axis labels */}
          {generateYLabels()}
          
          {/* X-axis labels */}
          {generateXLabels()}
          
          {/* Line path */}
          {generateSegmentPaths().map(({ path, colour }, idx) => (
            <Path
              key={`segment-${idx}`}
              d={path}
              stroke={colour}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          
          
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
                stroke={tooltipPos.color}
                strokeWidth={1}
                strokeDasharray="3,3"
              />
              <Circle
                cx={tooltipPos.x}
                cy={tooltipPos.y}
                r={4}
                fill={tooltipPos.color}
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