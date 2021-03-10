import React from 'react'
import Loader from '../components/Loader';
import { Async, AsyncProps } from 'react-async';

import FullCalendar, { EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import CalendarCard from '../components/CalendarCard';
import { viewTimeUtilityFunctionPoint, viewGoalData, isApiErrorCode, INT_MAX, findLastIndex } from '../utils/utils';


type SolverDataPoint = {
  startTime: number,
  utils: number
}

type SolverGoalData = {
  data: GoalDataScheduled,
  tuf: SolverDataPoint[],
  startTime: number,
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

  // here, we interpolate a point we can begin integrating at
  const fi = sgd.tuf.findIndex(p => p.startTime > sgd.startTime)
  const ftr = {
    startTime: sgd.startTime,
    utils: lerp(sgd.tuf[fi - 1], sgd.tuf[fi], sgd.startTime)
  };

  // here, we interpolate the last point to integrate at
  const sgdEnd = sgd.startTime + sgd.data.duration;
  const li = findLastIndex(sgd.tuf, p => p.startTime < sgdEnd);
  const ltr = {
    startTime: sgdEnd,
    utils: lerp(sgd.tuf[li], sgd.tuf[li + 1], sgdEnd)
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
    .map(sgdValue)
    .reduce((accumulator, currentValue) => accumulator + currentValue)

const neighbor = (sgds: SolverGoalData[]) => {
  const index = Math.floor(Math.random() * sgds.length);
  return sgds.map((gd, i) => ({
    data: gd.data,
    tuf: gd.tuf,
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
  const calendarRef = React.useRef<FullCalendar | null>(null);
  // the current iteration we're on
  const [iteration, setIteration] = React.useState(0);
  // is true as long as we're iterating
  const [iterating, setIterating] = React.useState(false);
  // our calendar data
  const [data, setData] = React.useState<SolverGoalData[]>(props.data);


  const data_new = neighbor(data);
  if (pAccept(expectedValue(data), expectedValue(data_new))) {
    setData(data_new);
  }

  React.useEffect(
    () => {
      let timer = setTimeout(() => {
        // only callback if iterating
        if (iterating) {
          setIteration(iteration => iteration + 1)
        }
      }, 100);

      // this will clear Timeout
      // when component unmount like in willComponentUnmount
      // and show will not change to true
      return () => {
        clearTimeout(timer);
      };
    },
    // useEffect will run only one time with empty []
    // if you pass a value to array,
    // like this - [data]
    // than clearTimeout will run every time
    // this value changes (useEffect re-run)
    [iteration, iterating]
  );

  return <>
    {iteration}
    <FullCalendar
      ref={calendarRef}
      plugins={[timeGridPlugin, interactionPlugin]}
      customButtons={{
        stop: {
          text: iterating ? 'Stop' : 'Start',
          click: () => setIterating(iterating => !iterating)
        },
        commit: {
          text: 'Commit Changes',
          click: () => setIterating(false)
        },
        cancel: {
          text: 'Cancel Changes',
          click: props.onHide
        }
      }}
      headerToolbar={{
        left: 'prev,next today',
        center: iterating ? 'stop' : 'stop commit cancel',
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
      events={data.map(gd => ({
        id: `GoalData:${gd.data.goal.goalId}`,
        start: new Date(gd.startTime),
        end: new Date(gd.startTime + gd.data.duration),
        color: "#00000000",
        borderColor: "#00000000",
        goalData: gd.data
      }))}
      eventContent={CalendarCard}
      unselectCancel=".modal-content"
    />
  </>
}



const loadSolverData = async (props: AsyncProps<SolverGoalData[]>) => {
  const maybeGoalData = await viewGoalData({
    creatorUserId: props.apiKey.creator.userId,
    onlyRecent: true,
    status: "PENDING",
    apiKey: props.apiKey.key
  });

  if (isApiErrorCode(maybeGoalData)) {
    throw Error;
  }

  return (
    await Promise.all(
      maybeGoalData
        .filter((gd): gd is GoalDataScheduled => gd.scheduled)
        .map(async goal => {
          // load tuf
          const maybeTuf = await viewTimeUtilityFunctionPoint({
            timeUtilityFunctionId: goal.timeUtilityFunction.timeUtilityFunctionId,
            apiKey: props.apiKey.key
          });
          // if there's an error return empty list (this will be filtered out)
          if (isApiErrorCode(maybeTuf)) {
            return []
          }

          // then return sgd
          const tuf = maybeTuf === []
            ? [{ startTime: 1, utils: 0 }]
            : maybeTuf
              .map(tufp => ({
                startTime: tufp.startTime,
                utils: tufp.utils
              }))
              .sort((a, b) => a.startTime - b.startTime);

          return {
            data: goal,
            startTime: goal.startTime,
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
        })
    )
  ).flat();
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
      <Async.Fulfilled<SolverGoalData[]>>
        {sgds => <ICalendarSolver data={sgds} {...props} />}
      </Async.Fulfilled>
    </>
    }
  </Async>
}

export default CalendarSolver;
