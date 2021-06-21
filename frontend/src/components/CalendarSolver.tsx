import React from 'react'
import Loader from '../components/Loader';
import { Async, AsyncProps } from 'react-async';

import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import CalendarCard from '../components/CalendarCard';
import { ApiKey } from '@innexgo/frontend-auth-api';
import { goalDataView, goalDataNew, timeUtilityFunctionNew, INT_MAX, } from '../utils/utils';

import {isErr} from '@innexgo/frontend-common';


import { assert, findLastIndex } from '@innexgo/frontend-common';

type SolverDataPoint = {
  startTime: number,
  utils: number
}

type SolverGoalData = {
  data: GoalData,
  tuf: SolverDataPoint[],
  startTime: number,
  endTime: number,
}

type CalendarSolverProps = {
  apiKey: ApiKey;
  onHide: () => void;
}

type ICalendarSolverProps = CalendarSolverProps & {
  data: SolverGoalData[];
}

const lerp = (a: SolverDataPoint, b: SolverDataPoint, startTime: number) => {
  const t = (startTime - a.startTime) / (b.startTime - a.startTime);
  return a.utils * (1 - t) + b.utils * t;
}

// this procedure uses the trapezoidal rule to integrate utility over the span
const sgdValue = (sgd: SolverGoalData) => {
  let sum = 0;
  // TODO use binary search for finding beginning index
  assert(sgd.startTime > Math.min(...sgd.tuf.map(p => p.startTime)),
    "sgd's start time must be greater than at least one point in tuf")

  assert(sgd.endTime < Math.max(...sgd.tuf.map(p => p.startTime)),
    "sgd's end time must be less than at least one point in tuf")

  // here, we interpolate a point we can begin integrating at
  const fi = sgd.tuf.findIndex(p => p.startTime > sgd.startTime)
  const ftr = {
    startTime: sgd.startTime,
    utils: lerp(sgd.tuf[fi - 1], sgd.tuf[fi], sgd.startTime)
  };

  // here, we interpolate the last point to integrate at
  const li = findLastIndex(sgd.tuf, p => p.startTime < sgd.endTime);
  const ltr = {
    startTime: sgd.endTime,
    utils: lerp(sgd.tuf[li], sgd.tuf[li + 1], sgd.endTime)
  };

  // create a new array with all of our points.
  // This will be simple to apply the trapezoidal rule to
  const tuf = [ftr, ...sgd.tuf.slice(fi, li + 1), ltr];

  // apply non-uniform trapezoidal rule
  for (let i = 1; i < tuf.length; i++) {
    const delta = tuf[i].startTime - tuf[i - 1].startTime;
    const avg = (tuf[i].utils + tuf[i - 1].utils) / 2;
    sum += avg * delta;
  }

  return sum;
}

// sum of all the sgd values
const expectedValue = (sgds: SolverGoalData[]) =>
  sgds
    .map(s => { console.log(s); return sgdValue(s) })
    .reduce((accumulator, currentValue) => accumulator + currentValue, 0)

const neighbor = (sgds: SolverGoalData[]) => {
  const index = Math.floor(Math.random() * sgds.length);
  return sgds.map((gd, i) => ({
    data: gd.data,
    tuf: gd.tuf,
    endTime: gd.endTime,
    startTime: i === index
      ? gd.startTime + (Math.random() - 0.5) * 10000000
      : gd.startTime
  }))
}

// our probability acceptance function
const pAccept = (ev: number, ev_new: number) => {
  return ev_new >= ev
}

function ICalendarSolver(props: ICalendarSolverProps) {
  const [iteration, setIteration] = React.useState(0);
  const [iterating, setIterating] = React.useState(false);

  React.useEffect(() => {
    if (iterating) {
      setTimeout(() => setIteration(iteration + 1), 100);
    }
  }, [iteration, iterating]);

  // had problems with react going into infinite loops when using state
  // therefore we're using ref again. later we might want to look into this.
  // it works for now though
  const dataRef = React.useRef<SolverGoalData[]>(props.data);

  const data_new = neighbor(dataRef.current);
  if (pAccept(expectedValue(dataRef.current), expectedValue(data_new))) {
    dataRef.current = data_new;
  }

  return <>
    <FullCalendar
      plugins={[timeGridPlugin, interactionPlugin]}
      customButtons={{
        stop: {
          text: "Stop",
          click: () => setIterating(false)
        },
        start: {
          text: "Start",
          click: () => setIterating(true)
        },
        commit: {
          text: 'Commit Changes',
          click: async () => {
            // for each element in the middle of the array:
            for (const sgd of dataRef.current.slice(1, -1)) {
              const maybeTimeUtilFunction = await timeUtilityFunctionNew({
                startTimes: sgd.tuf.map(p => Math.floor(p.startTime)),
                utils: sgd.tuf.map(p => p.utils),
                apiKey: props.apiKey.key,
              })

              // do better error handling later
              if (isErr(maybeTimeUtilFunction)) {
                console.log(maybeTimeUtilFunction);
                continue;
              }

              const maybeGoalData = await goalDataNew({
                goalId: sgd.data.goal.goalId,
                name: sgd.data.name,
                tags: sgd.data.tags,
                durationEstimate: Math.floor(sgd.data.durationEstimate),
                timeUtilityFunctionId: maybeTimeUtilFunction.Ok.timeUtilityFunctionId,
                timeSpan: [Math.floor(sgd.startTime), Math.floor(sgd.endTime)],
                status: "PENDING",
                apiKey: props.apiKey.key,
              });

              // TODO report errors
            }
            props.onHide();
          }
        },
        cancel: {
          text: 'Cancel Changes',
          click: props.onHide
        }
      }}
      headerToolbar={{
        left: 'title prev,next today',
        center: iterating ? 'stop' : 'start commit cancel',
        right: 'timeGridDay,timeGridWeek',
      }}
      initialView='timeGridWeek'
      height={"auto"}
      datesSet={({ view }) => /* Keeps window size in sync */view.calendar.updateSize()}
      allDaySlot={false}
      slotDuration="00:30:00"
      nowIndicator={true}
      editable={false}
      selectable={false}
      events={dataRef.current.map(gd => ({
        id: `GoalData:${gd.data.goal.goalId}`,
        start: new Date(gd.startTime),
        end: new Date(gd.endTime),
        color: "#00000000",
        borderColor: "#00000000",
        goalData: gd.data
      }))}
      eventContent={CalendarCard}
    />
  </>
}



const loadSolverData = async (props: AsyncProps<SolverGoalData[]>) => {
  const maybeGoalData = await goalDataView({
    creatorUserId: props.apiKey.creator.userId,
    onlyRecent: true,
    scheduled: true,
    status: "PENDING",
    apiKey: props.apiKey.key
  });

  if (isErr(maybeGoalData)) {
    throw Error(maybeGoalData.Err);
  }

  let x: SolverGoalData[] = maybeGoalData.Ok
    .map(goal => {
      const startTimes = goal.timeUtilityFunction.startTimes;
      const utils = goal.timeUtilityFunction.utils;

      const tuf = startTimes
        // zip with utils
        .map((t, i) => ({ startTime: t, utils: utils[i] }))
        // sort by startTime
        .sort((a, b) => a.startTime - b.startTime);

      return {
        data: goal,
        startTime: goal.timeSpan![0],
        endTime: goal.timeSpan![1],
        duration: goal.durationEstimate,
        tuf: [
          {
            startTime: 0,
            utils: tuf[0].utils
          },
          ...tuf,
          {
            startTime: INT_MAX,
            utils: tuf[tuf.length - 1].utils
          }
        ]
      }
    });

  return x;
}

function CalendarSolver(props: CalendarSolverProps) {
  return <Async
    promiseFn={loadSolverData}
    apiKey={props.apiKey} >
    {({ reload }) => <>
      <Async.Pending><Loader /></Async.Pending>
      <Async.Rejected>
        <span className="text-danger">An unknown error has occured.</span>
      </Async.Rejected>
      <Async.Fulfilled<SolverGoalData[]>>{sgds =>
        <ICalendarSolver data={sgds} {...props} />
      }</Async.Fulfilled>
    </>
    }
  </Async>
}

export default CalendarSolver;
