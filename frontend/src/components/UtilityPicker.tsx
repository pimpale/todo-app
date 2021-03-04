import React from 'react'
import Select from 'react-select'
import { Row } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import TimePicker from '../components/TimePicker';
import moment from 'moment';
import 'chartjs-plugin-dragdata'

type UtilityPickerProps = {
  start: number,
  duration: number,
}

function noTimePrefTUF(start: number, end: number) {
  return [{
    x: (start + end) / 2,
    y: 1
  }]
}

function UtilityPicker(props: UtilityPickerProps) {
  const [start, setStart] = React.useState(props.start);
  const [end, setEnd] = React.useState(props.start + props.duration);
  // the state of the
  const [data, setData] = React.useState<{ x: number, y: number }[]>(noTimePrefTUF(start, end));

  const lineOptions = {
    type: 'scatter',
    dragData: true,
    dragX: true,
    tooltips: { enabled: true },
    scales: {
      xAxes: [{
        type: 'time',
        position: 'bottom',
        ticks: {
          min: start,
          max: end,
        }
      }],
      yAxes: [{
        ticks: {
          max: 1,
          min: 0
        }
      }]
    },
    legend: {
      display: false
    },
    onDragEnd: () => {
      // sort points such that the points with lower x come first
      setData(data => {
        return data
          .sort((a, b) => moment(a.x).valueOf() - moment(b.x).valueOf())
          .map(a => ({ x: a.x.valueOf(), y: a.y }))
      });
    },
  };


  const lineData = {
    datasets: [
      {
        lineTension: 0,
        label: 'Utility',
        fill: false,
        borderColor: 'rgba(255, 99, 132, 0.8)',
        data: [
          {
            x: start,
            y: data[0].y ?? 0,
          },
          ...data,
          {
            x: end,
            y: data[data.length - 1].y ?? 0,
          }],
      },
    ],
  }

  return <>
    <Row>
      <TimePicker time={start} setTime={setStart} maxTime={end} className="col-sm" />
      <Select
        className="col-sm"
        isClearable={false}
        defaultValue={{ value: "constant", label: "No Time Preference" }}
        options={[
          { value: "constant", label: "No Time Preference" },
          { value: "deadline", label: "Deadline" },
          { value: "interval", label: "Interval" },
        ]}
        onChange={o => {
          const t = (start + end) / 2;
          switch (o!.value) {
            case "constant": {
              setData(noTimePrefTUF(start, end));
              break;
            }
            case "deadline": {
              setData([{
                x: t - 1,
                y: 1
              }, {
                x: t + 1,
                y: 0
              }])
              break;
            }
            case "interval": {
              setData([{
                x: t - 1000001,
                y: 0
              }, {
                x: t - 1000000,
                y: 1
              }, {
                x: t + 1000000,
                y: 1
              }, {
                x: t + 1000001,
                y: 0
              }])
              break;
            }
          }
        }}
      />
      <TimePicker time={end} setTime={setEnd} minTime={start} className="col-sm" />
    </Row>
    <Line
      options={lineOptions}
      data={lineData} />
  </>
}

export default UtilityPicker;
