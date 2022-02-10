/*
import React from 'react'
import Select from 'react-select'
import { Col, Row } from 'react-bootstrap';
import TimePicker from '../components/TimePicker';
import { setHrMin } from '../utils/utils';
import getHours from 'date-fns/getHours'
import getMinutes from 'date-fns/getMinutes'
import addHours from "date-fns/addHours";
import format from 'date-fns/format';

const scale = 100;

type Point = { x: number, y: number };


type UtilityPickerProps = {
  span?: [startTime: number, endTime: number];
  mutable: boolean,
  points: Point[],
  setPoints: (points: Point[]) => void,
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

  const pointsRef = React.useRef([] as Point[]);
  pointsRef.current = [
    {
      x: start,
      y: props.points.length === 0 ? 0 : props.points[0].y
    },
    ...props.points,
    {
      x: end,
      y: props.points.length === 0 ? 0 : props.points[props.points.length - 1].y
    }
  ];

  React.useEffect(() => {
    props.setPoints(noTimePrefTUF(start, end));
  }, []);

  const lineOptions = {
    responsive: true,
    animation: {
      duration: 0
    },
    plugins: {
      dragData: {
        round: 0,
        dragX: true,
        showTooltip: true,
        onDragStart: function(_: React.MouseEvent, datasetIndex: number, index: number, value: Point) {
          if(!props.mutable) {
              return false;
          }
          if (index === 0) {
            return false
          }
          if (index === pointsRef.current.length-1) {
            return false
          }
          return true;
        },
        onDrag: (_: React.MouseEvent, datasetIndex: number, index: number, value: Point) => {
          if (value.y > 100) {
            return false
          }
          return true;
        },
        onDragEnd: (_: React.MouseEvent, datasetIndex: number, index: number, value: Point) => {
          if(value.y > 100) {
              value.y = 100;
          }
          pointsRef.current[index] = value;
          props.setPoints(pointsRef.current.slice(1, pointsRef.current.length - 1));
        },
      },
      tooltip: {
        callbacks: {
          title: (context: any) => format(context[0].parsed.x, "hh:mm a")
        }
      },
    },
    scales: {
      x: {
        min: start,
        max: end,
      },
      y: {
        beginAtZero: true,
        steps: 1,
        stepValue: 1,
        max: 120
      },
    },
    legend: {
      display: false
    },
  };


  const lineData = {
    datasets: [
      {
        lineTension: 0,
        label: 'Utility',
        fill: false,
        borderColor: 'rgba(255, 99, 132, 0.8)',
        data: pointsRef.current
      },
    ],
  }


  return <>
    <Row>
      <Col>
        <div>Date:</div>
        <DayPickerInput value={new Date(start)} onDayChange={day => {
          setStart(setHrMin(day, getHours(start), getMinutes(start)).valueOf());
          setEnd(setHrMin(day, getHours(end), getMinutes(end)).valueOf());
        }} />
      </Col>
      <Col sm={3}>
        <div>From:</div>
        <TimePicker time={new Date(start)} setTime={t => setStart(t.valueOf())} maxTime={new Date(end)} />
      </Col>
      <Col sm={3}>
        <div>To:</div>
        <TimePicker time={new Date(end)} setTime={t => setEnd(t.valueOf())} minTime={new Date(start)} />
      </Col>
      <Col hidden={!props.mutable}>
        <div>Utility Distribution</div>
        <Select
          isClearable={false}
          defaultValue={{ value: "constant", label: "No Time Preference" }}
          options={[
            { value: "constant", label: "No Time Preference" },
            { value: "deadline", label: "Deadline" },
            { value: "interval", label: "Interval" },
          ]}
          onChange={o => {
            const t = (start.valueOf() + end.valueOf()) / 2;
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
      data={lineData}
    />
  </>
}

export default UtilityPicker;
*/

type Point = { x: number, y: number };

type UtilityPickerProps = {
  span?: [startTime: number, endTime: number];
  mutable: boolean,
  points: Point[],
  setPoints: (points: Point[]) => void,
}

function UtilityPicker(props:UtilityPickerProps) {
    return <div>TODO</div>
}

export default UtilityPicker;

