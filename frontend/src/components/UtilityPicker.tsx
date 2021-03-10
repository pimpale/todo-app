import React from 'react'
import Select from 'react-select'
import { Col, Row } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import TimePicker from '../components/TimePicker';
import { setHrMin} from '../utils/utils';
import getHours from 'date-fns/getHours'
import getMinutes from 'date-fns/getMinutes'
import addHours from "date-fns/addHours";
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import 'chartjs-plugin-dragdata';

const scale = 100;

type UtilityPickerProps = {
  span?: [startTime:number, endTime:number];
  mutable: boolean,
  points: { x: number, y: number }[],
  setPoints: (points: { x: number, y: number }[]) => void,
}

function noTimePrefTUF(start: number, end: number) {
  return [{
    x: (start + end) / 2,
    y: scale
  }]
}

function UtilityPicker(props: UtilityPickerProps) {
  const [start, setStart] = React.useState(props.span?.[0] ?? Date.now());
  const [end, setEnd] = React.useState(props.span?.[1] ?? addHours(new Date(), 3).valueOf());

  // Had problems with stale closures
  const pointsRef = React.useRef(props.points);
  pointsRef.current = props.points;

  const lineOptions = {
    type: 'scatter',
    dragData: props.mutable,
    dragX: props.mutable,
    dragDataRound: 0,
    tooltips: { enabled: true },
    scales: {
      xAxes: [{
        type: 'time',
        position: 'bottom',
        ticks: {
          min: start,
          max: end,
          maxTicksLimit: 10
        }
      }],
      yAxes: [{
        ticks: {
          max: scale,
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
      <Col>
        <div> Date: </div>
        <DayPickerInput value={new Date(start)} onDayChange={day => {
          setStart(setHrMin(day, getHours(start), getMinutes(start)).valueOf());
          setEnd(setHrMin(day, getHours(end), getMinutes(end)).valueOf());
        }} />
      </Col>
      <Col sm={3}>
        <div>From:</div>
        <TimePicker time={start} setTime={(t: number) => setStart(t)} maxTime={end} />
      </Col>
      <Col sm={3}>
        <div>To:</div>
        <TimePicker time={end} setTime={(t: number) => setEnd(t)} minTime={start} />
      </Col>
      <Col hidden={!props.mutable}>
        <div>Utility Distribution</div>
        <Select
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
                  y: scale
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
                  y: scale
                }, {
                  x: t + 1000000,
                  y: scale
                }, {
                  x: t + 1000001,
                  y: 0
                }])
                break;
              }
            }
          }}
        />
      </Col>
    </Row>
    <Line
      options={lineOptions}
      data={lineData} />
  </>
}

export default UtilityPicker;
