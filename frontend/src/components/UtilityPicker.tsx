import React from 'react'
import Select from 'react-select'
import { Row } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import TimePicker from '../components/TimePicker';
import moment from 'moment';
import 'chartjs-plugin-dragdata'

type UtilityPickerProps = {
  startTime: number,
  duration: number,
  points: { x: number, y: number }[],
  setPoints: (points: { x: number, y: number }[]) => void
}

function noTimePrefTUF(start: number, end: number) {
  return [{
    x: (start + end) / 2,
    y: 1
  }]
}

function UtilityPicker(props: UtilityPickerProps) {
  const [start, setStart] = React.useState(props.startTime);
  const [end, setEnd] = React.useState(props.startTime + props.duration);

  // Had problems with stale closures
  const pointsRef = React.useRef(props.points);
  pointsRef.current = props.points;

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
      props.setPoints(pointsRef.current
        .sort((a, b) => moment(a.x).valueOf() - moment(b.x).valueOf())
        .map(a => ({ x: a.x.valueOf(), y: a.y })));
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
            y: props.points.length === 0 ? 0 : props.points[0].y
          },
          ...props.points,
          {
            x: end,
            y: props.points.length === 0 ? 0 : props.points[props.points.length - 1].y
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
        defaultValue={{ value: "", label: "Select" }}
        options={[
          { value: "constant", label: "No Time Preference" },
          { value: "deadline", label: "Deadline" },
          { value: "interval", label: "Interval" },
        ]}
        onChange={o => {
          const t = (start + end) / 2;
          switch (o!.value) {
            case "constant": {
              props.setPoints(noTimePrefTUF(start, end));
              break;
            }
            case "deadline": {
              props.setPoints([{
                x: t - 1,
                y: 1
              }, {
                x: t + 1,
                y: 0
              }])
              break;
            }
            case "interval": {
              props.setPoints([{
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
