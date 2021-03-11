import React from 'react'
import Loader from '../components/Loader';
import FullCalendar, { EventApi, EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import DashboardLayout from '../components/DashboardLayout';
import CalendarSolver from '../components/CalendarSolver';
import CalendarCard, { pastEventDataToEvent, goalDataToEvent } from '../components/CalendarCard';

import { Async, AsyncProps } from 'react-async';
import { Row, Col, Tab, Tabs, Popover, Container, } from 'react-bootstrap';
import { newPastEventData, newScheduledGoalData, viewPastEventData, viewGoalData, isApiErrorCode } from '../utils/utils';

import UtilityWrapper from '../components/UtilityWrapper';

import CreatePastEvent from '../components/CreatePastEvent';
import CreateGoal from '../components/CreateGoal';
import ManagePastEvent from '../components/ManagePastEvent';
import ManageGoalTable from '../components/ManageGoalTable';
import DisplayModal from '../components/DisplayModal';


type UnscheduledGoalCardProps = {
  onChange: () => void;
  goalData: GoalDataUnscheduled;
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
  }, []);

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


const loadUnscheduledGoalData = async (props: AsyncProps<GoalDataUnscheduled[]>) => {
  const maybeGoalData = await viewGoalData({
    creatorUserId: props.apiKey.creator.userId,
    onlyRecent: true,
    scheduled: false,
    status: "PENDING",
    apiKey: props.apiKey.key,
  });

  if (isApiErrorCode(maybeGoalData)) {
    throw Error;
  }

  return maybeGoalData
    .filter((x): x is GoalDataUnscheduled => !x.scheduled);
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
  const [selectedManageGoalData, setSelectedManageGoalData] = React.useState<GoalData | null>(null);
  const [selectedManagePastEventData, setSelectedManagePastEventData] = React.useState<PastEventData | null>(null);

  const calendarRef = React.useRef<FullCalendar | null>(null);

  const eventSource = async (
    args: {
      start: Date;
      end: Date;
      startStr: string;
      endStr: string;
      timeZone: string;
    }) => {

    const maybePastEventData = await viewPastEventData({
      creatorUserId: props.apiKey.creator.userId,
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      onlyRecent: true,
      active: true,
      apiKey: props.apiKey.key
    });

    const maybeGoalData = await viewGoalData({
      creatorUserId: props.apiKey.creator.userId,
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      onlyRecent: true,
      scheduled: true,
      status: "PENDING",
      apiKey: props.apiKey.key
    });

    const pastEventData = isApiErrorCode(maybePastEventData)
      ? []
      : maybePastEventData.map(pastEventDataToEvent)

    const task = isApiErrorCode(maybeGoalData)
      ? []
      : maybeGoalData
        // this asserts that x is scheduled if x's scheduled is true
        .filter((x): x is GoalDataScheduled => x.scheduled)
        .map(goalDataToEvent);
    return [...pastEventData, ...task];
  }

  //this handler runs any time we recieve a click on an event
  const clickHandler = (eca: EventClickArg) => {
    const props = eca.event.extendedProps;
    // we switch on what type it is
    switch (eca.event.id.split(':')[0]) {
      case "PastEventData": {
        setSelectedManagePastEventData(props.pastEventData);
        break;
      }
      case "GoalData": {
        setSelectedManageGoalData(props.goalData);
        break;
      }
    }
  }

  const changeHandler = async (event: EventApi, oldEventProps: Record<string, any>, revert: () => void) => {
    switch (event.id.split(':')[0]) {
      case "PastEventData": {
        const oped = oldEventProps.pastEventData;
        const maybePastEventData = await newPastEventData({
          pastEventId: oped.pastEvent.pastEventId,
          name: oped.name,
          description: oped.description,
          startTime: event.start!.valueOf(),
          duration: event.end!.valueOf() - event.start!.valueOf(),
          active: oped.active,
          apiKey: props.apiKey.key,
        });
        if (isApiErrorCode(maybePastEventData)) {
          revert();
        }
        event.setExtendedProp("pastEventData", maybePastEventData);
        break;
      }
      case "GoalData": {
        const ogd = oldEventProps.goalData;
        const maybeGoalData = await newScheduledGoalData({
          goalId: ogd.goal.goalId,
          name: ogd.name,
          description: ogd.description,
          durationEstimate: ogd.durationEstimate,
          timeUtilityFunctionId: ogd.timeUtilityFunction.timeUtilityFunctionId,
          startTime: event.start!.valueOf(),
          duration: event.end!.valueOf() - event.start!.valueOf(),
          status: ogd.status,
          apiKey: props.apiKey.key
        })
        if (isApiErrorCode(maybeGoalData)) {
          revert();
        }
        event.setExtendedProp("goalData", maybeGoalData);
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
            <span className="text-danger">An unknown error has occured.</span>
          </Async.Rejected>
          <Async.Fulfilled<GoalDataUnscheduled[]>>{gdus =>
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
          left: 'prev,next today',
          center: 'optimize',
          right: 'timeGridDay,timeGridWeek',
        }}
        initialView='timeGridWeek'
        height={"auto"}
        datesSet={({ view }) => /* Keeps window size in sync */view.calendar.updateSize()}
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
          <Tab eventKey="task" title="Create Task">
            <CreateGoal
              apiKey={props.apiKey}
              span={selectedSpan}
              postSubmit={() => setSelectedSpan(null)}
            />
          </Tab>
          <Tab eventKey="event" title="Create Event">
            <CreatePastEvent
              apiKey={props.apiKey}
              startTime={selectedSpan[0]}
              duration={selectedSpan[1] - selectedSpan[0]}
              postSubmit={() => setSelectedSpan(null)}
            />
          </Tab>
        </Tabs>
      </DisplayModal>
    }
    {selectedManagePastEventData === null ? <> </> :
      <DisplayModal
        title="Manage Event"
        show={selectedManagePastEventData !== null}
        onClose={() => setSelectedManagePastEventData(null)}
      >
        <ManagePastEvent pastEventId={selectedManagePastEventData.pastEvent.pastEventId} apiKey={props.apiKey} />
      </DisplayModal>
    }
    {selectedManageGoalData === null ? <> </> :
      <DisplayModal
        title="Manage Event"
        show={selectedManageGoalData !== null}
        onClose={() => setSelectedManageGoalData(null)}
      >
        <ManageGoalTable
          goalIds={[selectedManageGoalData.goal.goalId]}
          apiKey={props.apiKey}
          reload={() => setSelectedManageGoalData(null)}
          mutable
          addable={false}
        />
      </DisplayModal>
    }
  </Row>
}

function CalendarWidget(props: AuthenticatedComponentProps) {
  return <UtilityWrapper title="Upcoming Appointments">
    <Popover id="information-tooltip">
      This screen shows all future appointments.
      You can click any date to add an appointment on that date,
      or click an existing appointment to delete it.
    </Popover>
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
