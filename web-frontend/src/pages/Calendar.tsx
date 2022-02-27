import React from 'react'
import update from 'immutability-helper';
import { Loader, DisplayModal } from '@innexgo/common-react-components';
import FullCalendar, { EventApi, DateSelectArg, EventClickArg } from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import DashboardLayout from '../components/DashboardLayout';
import CalendarSolver from '../components/CalendarSolver';
import CalendarCard, { goalDataToEvent, externalEventDataToEvent } from '../components/CalendarCard';
import ErrorMessage from '../components/ErrorMessage';

import { Async, AsyncProps } from 'react-async';
import { Card, Row, Col, Tab, Tabs, Container, } from 'react-bootstrap';
import { GoalEvent, ExternalEvent, goalEventNew, goalEventView, GoalData, ExternalEventData, externalEventDataNew, goalDataNew, externalEventView, externalEventDataView, goalDataView } from '@innexgo/frontend-todo-app-api';
import { ApiKey, } from '@innexgo/frontend-auth-api';
import { AuthenticatedComponentProps } from '@innexgo/auth-react-components';
import { TemplateData } from '../components/ManageGoalTemplate';
import { TagData } from '../components/ManageNamedEntity';

import { unwrap, isErr } from '@innexgo/frontend-common';

import {WidgetWrapper} from '@innexgo/common-react-components';

import CreateExternalEvent from '../components/CreateExternalEvent';
import CreateGoal from '../components/CreateGoal';
import ManageExternalEvent from '../components/ManageExternalEvent';
import ManageGoal, { ManageGoalData } from '../components/ManageGoal';
import { namedEntityDataView, namedEntityPatternView, goalTemplateDataView, goalTemplatePatternView, } from '@innexgo/frontend-todo-app-api';


type UnscheduledGoalCardProps = {
  setGoalData: (gd: GoalData) => void;
  goalData: GoalData;
}

function UnscheduledGoalCard(props: UnscheduledGoalCardProps) {
  let elRef = React.useRef<HTMLDivElement>(null);

  const event = {
    id: `GoalData:${props.goalData.goal.goalId}`,
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
    <Card
      ref={elRef}
      className="px-1 py-1 mb-3 bg-primary text-light overflow-hidden"
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
    </Card>
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
  tags: TagData[],
  templates: TemplateData[],
  apiKey: ApiKey,
}

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
  const [selectedManageGoalData, setSelectedManageGoalData] = React.useState<ManageGoalData | null>(null);
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
        setSelectedManageGoalData({ gd: props.goalData, ge: props.goalEvent });
        break;
      }
    }
  }

  const changeHandler = async (event: EventApi, oldEventProps: Record<string, any>, revert: () => void) => {
    switch (event.id.split(':')[0]) {
      case "ExternalEventData": {
        const oped:ExternalEventData = oldEventProps.externalEventData;
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
        const ode:GoalData = oldEventProps.goalData;
        const maybeGoalEvent = await goalEventNew({
          goalId: ode.goal.goalId,
          startTime: event.start!.valueOf(),
          endTime: event.end!.valueOf(),
          active: true,
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
        {({ setData }) => <>
          <Async.Pending><Loader /></Async.Pending>
          <Async.Rejected>
            {e => <ErrorMessage error={e} />}
          </Async.Rejected>
          <Async.Fulfilled<GoalData[]>>{gdus =>
            gdus.map((gdu, i) =>
              <UnscheduledGoalCard
                key={i}
                goalData={gdu}
                setGoalData={d => setData(update(gdus, { [i]: { $set: d } }))}
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
        <Tabs>
          <Tab eventKey="goal" title="Create Goal" className="mt-3">
            <CreateGoal
              apiKey={props.apiKey}
              span={selectedSpan}
              postSubmit={() => setSelectedSpan(null)}
            />
          </Tab>
          <Tab eventKey="event" title="Create Event" className="mt-3">
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
        <ManageGoal
          data={selectedManageGoalData}
          setData={() => setSelectedManageGoalData(null)}
          apiKey={props.apiKey}
          mutable
        />
      </DisplayModal>
    }
  </Row>
}


type CalendarData = {
  tags: TagData[],
  templates: TemplateData[],
}

const loadCalendarData = async (props: AsyncProps<CalendarData>) => {
  const goalTemplateData = await goalTemplateDataView({
    creatorUserId: [props.apiKey.creatorUserId],
    active: true,
    onlyRecent: true,
    apiKey: props.apiKey.key,
  })
    .then(unwrap)

  const namedEntityData = await namedEntityDataView({
    creatorUserId: [props.apiKey.creatorUserId],
    active: true,
    onlyRecent: true,
    apiKey: props.apiKey.key,
  })
    .then(unwrap)

  const namedEntityPatterns = await namedEntityPatternView({
    namedEntityId: namedEntityData.map(gtd => gtd.namedEntity.namedEntityId),
    active: true,
    onlyRecent: true,
    apiKey: props.apiKey.key
  })
    .then(unwrap);

  // group patterns by tag
  const tags = namedEntityData.map(ned => ({
    ned,
    nep: namedEntityPatterns.filter(nep => nep.namedEntity.namedEntityId === ned.namedEntity.namedEntityId)
  }));

  const goalTemplatePatterns = await goalTemplatePatternView({
    goalTemplateId: goalTemplateData.map(gtd => gtd.goalTemplate.goalTemplateId),
    active: true,
    onlyRecent: true,
    apiKey: props.apiKey.key
  })
    .then(unwrap);

  // group patterns by template
  const templates = goalTemplateData.map(gtd => ({
    gtd,
    gtp: goalTemplatePatterns.filter(gtp => gtp.goalTemplate.goalTemplateId === gtd.goalTemplate.goalTemplateId)
  }));

  return {
    tags,
    templates,
  }
}

function CalendarWidget(props: AuthenticatedComponentProps) {
  return <WidgetWrapper title="Upcoming Appointments">
    <span>
      This screen shows all future appointments.
      You can click any date to add an appointment on that date,
      or click an existing appointment to delete it.
    </span>
    <Async promiseFn={loadCalendarData} apiKey={props.apiKey}>
      <Async.Pending><Loader /></Async.Pending>
      <Async.Rejected>
        {e => <ErrorMessage error={e} />}
      </Async.Rejected>
      <Async.Fulfilled<CalendarData>>{cd =>
        <EventCalendar apiKey={props.apiKey} tags={cd.tags} templates={cd.templates} />
      }</Async.Fulfilled>
    </Async>
  </WidgetWrapper>
};

function Calendar(props: AuthenticatedComponentProps) {
  return <DashboardLayout {...props} >
    <Container fluid className="py-3 px-3">
      <CalendarWidget {...props} />
    </Container>
  </DashboardLayout>
}

export default Calendar;
