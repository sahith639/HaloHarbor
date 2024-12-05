import React from 'react';
import * as echarts from 'echarts';

const EChartComponent = ({ option }) => {
  const chartRef = React.useRef(null);

  React.useEffect(() => {
    const chart = echarts.init(chartRef.current);
    chart.setOption(option);

    return () => {
      chart.dispose();
    };
  }, [option]);

  return (
    <div ref={chartRef} style={{ width: '100%', height: '100%' }}>
    </div>
  );
};

export default EChartComponent;
