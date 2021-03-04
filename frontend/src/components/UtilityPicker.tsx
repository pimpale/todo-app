import React from 'react'
import { Line } from 'react-chartjs-2';
import 'chartjs-plugin-dragdata'

const data = {
  labels: ['1', '2', '3', '4', '5', '6'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 19, 3, 5, 2, 3],
      fill: false,
      backgroundColor: 'rgb(255, 99, 132)',
      borderColor: 'rgba(255, 99, 132, 0.2)',
    },
  ],
}

const options = {
  tooltips: { enabled: true },
  scales: {
    xAxes: [{
      gridLines: { display: false, color: 'grey', },
      ticks: { fontColor: '#3C3C3C', fontSize: 14, },
    }],
    yAxes: [{
      scaleLabel: { display: true, labelString: 'Color Strength', fontSize: 14, },
      ticks: {
        display: true,
        min: -5,
        max: 100,
        scaleSteps: 50,
        scaleStartValue: -50,
        maxTicksLimit: 4,
        fontColor: '#9B9B9B',
        padding: 30,
      },
      gridLines: {
        display: false,
        offsetGridLines: true,
        color: '3C3C3C',
        tickMarkLength: 4,
      },
    }],
  },
  legend: {
    display: false
  },
  dragData: true,
};
function UtilityPicker() {
  return <>
    <Line data={data} options={options} />
  </>
}

export default UtilityPicker;
