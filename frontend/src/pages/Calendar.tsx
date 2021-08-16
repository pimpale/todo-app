import React from 'react'
import Loader from '../components/Loader';
import FullCalendar, { EventApi, DateSelectArg, EventClickArg } from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import DashboardLayout from '../components/DashboardLayout';
import CalendarSolver from '../components/CalendarSolver';
import CalendarCard, { goalDataToEvent, externalEventDataToEvent } from '../components/CalendarCard';
import ErrorMessage from '../components/ErrorMessage';

import { Async, AsyncProps } from 'react-async';
import { Row, Col, Tab, Tabs, Container, } from 'react-bootstrap';
import { goalEventNew, goalEventView, GoalData, ExternalEventData, externalEventDataNew, goalDataNew, externalEventView, externalEventDataView, goalDataView } from '../utils/utils';
import { ApiKey, } from '@innexgo/frontend-auth-api';
import {AuthenticatedComponentProps} from '@innexgo/frontend-auth';

import { unwrap, isErr } from '@innexgo/frontend-common';

import UtilityWrapper from '../components/UtilityWrapper';

import CreateExternalEvent from '../components/CreateExternalEvent';
import CreateGoal from '../components/CreateGoal';
import ManageExternalEvent from '../components/ManageExternalEvent';
import {ManageGoalData} from '../components/ManageGoal';
import ManageGoalTable from '../components/ManageGoalTable';
import DisplayModal from '../components/DisplayModal';


type UnscheduledGoalCardProps = {
  onChange: () => void;
  goalData: GoalData;
}

function UnscheduledGoalCard(props: UnscheduledGoalCardProps) {
  let elRef = React.useRef<HTMLDivElement>(null);

  const event = {
    id: `GoalData:${props.goalData.goalDataId}`,
    duration: props.goalData.durationEstimate,
    color: "#00000000",
    borderColor: "#00000000",
    goalData: props.goalData
  };

  React.useEffect(() => {
    let draggable = new Draggable(elRef.current!, {
      eventData: event
    });

    // a cleanup function
    return () => draggable.destroy();
  });

  return (
    <div
      ref={elRef}
      className="fc-event fc-h-event mb-1 fc-daygrid-event fc-daygrid-block-event p-2"
      data-custom={JSON.stringify({ goalData: props.goalData })}
      title={props.goalData.name}
      style={{
        cursor: "pointer"
      }}
    >
      <div className="fc-event-main">
        <div>
          {props.goalData.name}
        </div>
      </div>
    </div>
  );
}


const loadUnscheduledGoalData = async (props: AsyncProps<GoalData[]>) => {
  const goalData = await goalDataView({
    creatorUserId: [props.apiKey.creatorUserId],
    status: ["PENDING"],
    scheduled: false,
    onlyRecent: true,
    apiKey: props.apiKey.key,
  })
    .then(unwrap);

  return goalData;
}



type EventCalendarProps = {
  apiKey: ApiKey,
}

// TODO make it so that selected data and selected modals are equivalent
// Look at AdminManageAdminships for examples

function EventCalendar(props: EventCalendarProps) {

  // whether we're currently in optimize mode or not
  const [optimizing, setOptimizing] = React.useState(false);

  // Closing it should also unselect anything using it
  const [selectedSpan, setSelectedSpanRaw] = React.useState<[number, number] | null>(null);
  const setSelectedSpan = (a: [number, number] | null) => {
    setSelectedSpanRaw(a)
    if (!a && calendarRef.current != null) {
      calendarRef.current.getApi().unselect();
    }
  }

  // the currently selected data
  const [selectedManageGoalData, setSelectedManageGoalData] = React.useState<ManageGoalData| null>(null);
  const [selectedManageExternalEventData, setSelectedManageExternalEventData] = React.useState<ExternalEventData | null>(null);

  const calendarRef = React.useRef<FullCalendar | null>(null);

  const eventSource = async (
    args: {
      start: Date;
      end: Date;
      startStr: string;
      endStr: string;
      timeZone: string;
    }) => {

    const externalEventData = await externalEventDataView({
      creatorUserId: [props.apiKey.creatorUserId],
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      active: true,
      onlyRecent: true,
      apiKey: props.apiKey.key
    })
      .then(unwrap);

    // TODO fetch goalEvent and unite
    const goalEvents = await goalEventView({
      creatorUserId: [props.apiKey.creatorUserId],
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      onlyRecent: true,
      apiKey: props.apiKey.key
    })
      .then(unwrap);

    const goalData = await goalDataView({
      goalId: goalEvents.map(x => x.goal.goalId),
      status: ["PENDING"],
      onlyRecent: true,
      apiKey: props.apiKey.key
    })
      .then(unwrap);


    return [
      ...externalEventData.map(externalEventDataToEvent),
      ...goalData
        // join goalevents
        .map(gd => ({ gd, ge: goalEvents.find(ge => ge.goal.goalId === gd.goal.goalId)! }))
        // convert to event
        .map(({ gd, ge }) => goalDataToEvent(gd, ge))
    ];
  }

  //this handler runs any time we recieve a click on an event
  const clickHandler = (eca: EventClickArg) => {
    const props = eca.event.extendedProps;
    // we switch on what type it is
    switch (eca.event.id.split(':')[0]) {
      case "ExternalEventData": {
        setSelectedManageExternalEventData(props.externalEventData);
        break;
      }
      case "GoalData": {
        setSelectedManageGoalData({gd:props.goalData, ge: props.goalEvent});
        break;
      }
    }
  }

  const changeHandler = async (event: EventApi, oldEventProps: Record<string, any>, revert: () => void) => {
    switch (event.id.split(':')[0]) {
      case "ExternalEventData": {
        const oped = oldEventProps.externalEventData;
        const maybeExternalEventData = await externalEventDataNew({
          externalEventId: oped.externalEvent.externalEventId,
          name: oped.name,
          startTime: event.start!.valueOf(),
          endTime: event.end!.valueOf(),
          active: oped.active,
          apiKey: props.apiKey.key,
        });
        if (isErr(maybeExternalEventData)) {
          revert();
        } else {
          event.setExtendedProp("externalEventData", maybeExternalEventData.Ok);
        }
        break;
      }
      case "GoalData": {
        const oge = oldEventProps.goalEvent;
        const maybeGoalEvent = await goalEventNew({
          goalId: oge.goalId,
          startTime: event.start!.valueOf(),
          endTime: event.end!.valueOf(),
          active: oge.active,
          apiKey: props.apiKey.key,
        });
        if (isErr(maybeGoalEvent)) {
          revert();
        } else {
          event.setExtendedProp("goalEvent", maybeGoalEvent.Ok);
        }
        break;
      }
      default: {
        revert();
        break;
      }
    }
  }

  if (optimizing) {
    return <CalendarSolver
      apiKey={props.apiKey}
      onHide={() => setOptimizing(false)}
    />
  }

  return <Row>
    <Col lg={2}>
      <Async
        promiseFn={loadUnscheduledGoalData}
        apiKey={props.apiKey} >
        {({ reload }) => <>
          <Async.Pending><Loader /></Async.Pending>
          <Async.Rejected>
            {e => <ErrorMessage error={e} />}
          </Async.Rejected>
          <Async.Fulfilled<GoalData[]>>{gdus =>
            gdus.map(gdu =>
              <UnscheduledGoalCard
                key={gdu.goalDataId}
                goalData={gdu}
                onChange={reload}
              />
            )
          }
          </Async.Fulfilled>
        </>}
      </Async>
    </Col>
    <Col xl={10}>
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, interactionPlugin]}
        customButtons={{
          optimize: {
            text: 'Optimize',
            click: () => setOptimizing(true)
          }
        }}
        headerToolbar={{
          left: 'title prev,next today',
          center: 'optimize',
          right: 'timeGridDay,timeGridWeek',
        }}
        initialView='timeGridWeek'
        height={"auto"}
        datesSet={({ view }) => /* Keeps window size in sync */ view.calendar.updateSize()}
        allDaySlot={false}
        slotDuration="00:30:00"
        nowIndicator={true}
        editable={true}
        selectable={true}
        selectMirror={true}
        events={eventSource}
        eventContent={CalendarCard}
        unselectCancel=".modal-content"
        eventClick={clickHandler}
        eventOverlap={false}
        eventResize={(era) => changeHandler(era.event, era.oldEvent.extendedProps, era.revert)}
        eventDrop={(eda) => changeHandler(eda.event, eda.oldEvent.extendedProps, eda.revert)}
        eventReceive={(era) => {
          // hide event
          era.draggedEl.hidden = true;
          changeHandler(
            era.event,
            JSON.parse(era.draggedEl.getAttribute("data-custom")!),
            era.revert
          )
          // delete the current event (it'll be reloaded when we fetch scheduled events)
          era.event.remove();
          // force reload to get the new scheduled event
          if (calendarRef.current != null) {
            calendarRef.current.getApi().refetchEvents();
          }
        }}
        unselect={() => {
          setSelectedSpan(null);
        }}
        select={(dsa: DateSelectArg) => {
          // only open modal if this date is in the future
          if (dsa.start.valueOf() > Date.now()) {
            setSelectedSpan([
              dsa.start.valueOf(),
              dsa.end.valueOf()
            ]);
          } else {
            if (calendarRef.current != null) {
              calendarRef.current.getApi().unselect();
            }
          }
        }}
      />
    </Col>


    {selectedSpan === null ? <> </> :
      <DisplayModal
        title="New Event"
        show={selectedSpan !== null}
        onClose={() => setSelectedSpan(null)}
      >
        <Tabs className="py-3">
          <Tab eventKey="external" title="Create External">
            <CreateGoal
              apiKey={props.apiKey}
              span={selectedSpan}
              postSubmit={() => setSelectedSpan(null)}
            />
          </Tab>
          <Tab eventKey="event" title="Create Event">
            <CreateExternalEvent
              apiKey={props.apiKey}
              startTime={selectedSpan[0]}
              endTime={selectedSpan[1]}
              postSubmit={() => setSelectedSpan(null)}
            />
          </Tab>
        </Tabs>
      </DisplayModal>
    }
    {selectedManageExternalEventData === null ? <> </> :
      <DisplayModal
        title="Manage Event"
        show={selectedManageExternalEventData !== null}
        onClose={() => setSelectedManageExternalEventData(null)}
      >
        <ManageExternalEvent externalEventId={selectedManageExternalEventData.externalEvent.externalEventId} apiKey={props.apiKey} />
      </DisplayModal>
    }
    {selectedManageGoalData === null ? <> </> :
      <DisplayModal
        title="Manage Event"
        show={selectedManageGoalData !== null}
        onClose={() => setSelectedManageGoalData(null)}
      >
        <ManageGoalTable
          data={[selectedManageGoalData]}
          setData={() => setSelectedManageGoalData(null)}
          apiKey={props.apiKey}
          mutable
          addable={false}
          showInactive={false}
        />
      </DisplayModal>
    }
  </Row>
}

function CalendarWidget(props: AuthenticatedComponentProps) {
  return <UtilityWrapper title="Upcoming Appointments">
    <span>
      This screen shows all future appointments.
      You can click any date to add an appointment on that date,
      or click an existing appointment to delete it.
    </span>
    <EventCalendar apiKey={props.apiKey} />
  </UtilityWrapper>
};

function Calendar(props: AuthenticatedComponentProps) {
  return <DashboardLayout {...props} >
    <Container fluid className="py-3 px-3">
      <CalendarWidget {...props} />
    </Container>
  </DashboardLayout>
}

export default Calendar;
