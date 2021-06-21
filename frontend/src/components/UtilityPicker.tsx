import React from 'react'
import Select from 'react-select'
import { Col, Row } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import TimePicker from '../components/TimePicker';
import { setHrMin } from '../utils/utils';
import getHours from 'date-fns/getHours'
import getMinutes from 'date-fns/getMinutes'
import addHours from "date-fns/addHours";
import format from 'date-fns/format';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import 'chartjs-plugin-dragdata';

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
  const [points, setPointsRaw] = React.useState(props.points);
  const setPoints = (x:Point[]) => {
      setPointsRaw(x);
      props.setPoints(x);
  };


  const lineOptions = {
    line: 'scatter',
    responsive: true,
    plugins: {
      dragData: {
        round: 0,
        dragX: true,
        showTooltip: true,
        onDragStart: function(_: React.MouseEvent, datasetIndex:number, index:number, value:Point) {
          if (index === 0) {
            return false
          }
          if (index === points.length) {
            return false
          }
          return true;
        },
        onDrag:(e: React.MouseEvent, datasetIndex:number, index:number, value:Point) => {
          console.log(points.length)
          if (value.y > 100) {
            return false
          }
          return true;
        },
        onDragEnd: () => {
          props.setPoints(
            .map(a => ({ x: a.x.valueOf(), y: a.y })));

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
        type: 'linear',
        min: start,
        max: end,
        ticks: {
          callback: (v: number) => format(v, "yyyy mm do hh:mm a")
        }
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
        data: [
          {
            x: start,
            y: points.length === 0 ? 0 : points[0].y
          },
          ...points,
          {
            x: end,
            y: points.length === 0 ? 0 : points[points.length - 1].y
          }]
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
          defaultValue={{ value: "", label: "Select" }}
          options={[
            { value: "constant", label: "No Time Preference" },
            { value: "deadline", label: "Deadline" },
            { value: "interval", label: "Interval" },
          ]}
          onChange={o => {
            const t = (start.valueOf() + end.valueOf()) / 2;
            switch (o!.value) {
              case "constant": {
                setPoints(noTimePrefTUF(start, end));
                break;
              }
              case "deadline": {
                setPoints([{
                  x: t - 1,
                  y: scale
                }, {
                  x: t + 1,
                  y: 0
                }])
                break;
              }
              case "interval": {
                setPoints([{
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
      type="scatter"
      options={lineOptions}
      data={lineData} />
  </>
}

export default UtilityPicker;
