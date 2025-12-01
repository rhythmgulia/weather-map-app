import React from 'react';

const LineChart = ({ data, width = 300, height = 100, color = "#3b82f6" }) => {
  // Filter out any data points with null temperatures
  const validData = data ? data.filter(item => item.temp !== null) : [];
  
  if (!validData || validData.length === 0) return null;

  // Extract temperatures and create points
  const temperatures = validData.map(item => item.temp);
  const times = validData.map((item, index) => index);
  
  // Calculate min and max values for scaling
  const minTemp = Math.min(...temperatures);
  const maxTemp = Math.max(...temperatures);
  const tempRange = maxTemp - minTemp || 1; // Avoid division by zero
  
  // Scale functions
  const scaleX = (index) => (index / (validData.length - 1)) * width;
  const scaleY = (temp) => height - ((temp - minTemp) / tempRange) * height;
  
  // Create points for the line
  const points = validData.map((item, index) => 
    `${scaleX(index)},${scaleY(item.temp)}`
  ).join(' ');
  
  // Create point markers
  const markers = validData.map((item, index) => (
    <circle
      key={index}
      cx={scaleX(index)}
      cy={scaleY(item.temp)}
      r="2"
      fill={color}
    />
  ));
  
  return (
    <div className="line-chart">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
        {/* Markers */}
        {markers}
      </svg>
      <div className="chart-labels">
        <span>Low: {Math.round(minTemp)}°</span>
        <span>High: {Math.round(maxTemp)}°</span>
      </div>
    </div>
  );
};

export default LineChart;