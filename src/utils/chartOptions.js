export const generateChartOption = (chartType, chartData, chartTitle, additionalOptions = {}) => {
  const { selectedMode = 'single', selectedOffset = 20, showLabel = true, labelFormatter = '{c}' } = additionalOptions;

  const baseOption = {
    tooltip: { trigger: chartType === 'pie' || chartType === 'doughnut' ? 'item' : 'axis' },
    legend: {
      top: 'top',
      orient: 'horizontal',
      itemWidth: 10,
      itemHeight: 10,
      itemStyle: {
        borderRadius: 5,
        borderColor: '#fff',
      },
      data: chartData.map(d => d.name),
    },
  };

  if (chartType === 'pie') {
    return {
      ...baseOption,
      series: [
        {
          name: chartTitle,
          type: 'pie',
          radius: '55%',
          data: chartData,
          selectedMode,
          selectedOffset,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            show: showLabel,
            formatter: labelFormatter,
          },
        },
      ],
    };
  }

  if (chartType === 'doughnut') {
    return {
      ...baseOption,
      series: [
        {
          name: chartTitle,
          type: 'pie',
          radius: ['40%', '70%'],
          data: chartData,
          selectedMode,
          selectedOffset,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            show: showLabel,
            formatter: labelFormatter,
          },
        },
      ],
    };
  }

  if (chartType === 'bar' || chartType === 'line') {
    return {
      ...baseOption,
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: chartData.map(d => d.name),
        axisLabel: {
          rotate: chartData.length > 5 ? 45 : 0,
          interval: 0,
        },
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: chartTitle,
          type: chartType,
          data: chartData.map(d => ({
            value: d.value,
            itemStyle: d.itemStyle,
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            show: showLabel,
            position: chartType === 'bar' ? 'top' : 'top',
          },
        },
      ],
    };
  }

  return baseOption;
};

export const getClickedItemName = (params, chartType) => {
  if (params.componentType !== 'series') return null;

  if (chartType === 'pie' || chartType === 'doughnut') return params.data?.name;

  if (chartType === 'bar' || chartType === 'line') return params.name;

  return null;
};
