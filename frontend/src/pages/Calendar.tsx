import React from 'react'
import FullCalendar, { EventApi, DateSelectArg, EventClickArg } from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import DashboardLayout from '../components/DashboardLayout';
import CalendarSolver from '../components/CalendarSolver';
import CalendarCard, { pastEventDataToEvent, goalDataToEvent } from '../components/CalendarCard';

import { Tab, Tabs, Popover, Container, } from 'react-bootstrap';
import { newPastEventData, newGoalData, viewPastEventData, viewGoalData, isApiErrorCode } from '../utils/utils';

import UtilityWrapper from '../components/UtilityWrapper';

import CreatePastEvent from '../components/CreatePastEvent';
import CreateGoal from '../components/CreateGoal';
import ManagePastEvent from '../components/ManagePastEvent';
import ManageGoal from '../components/ManageGoal';
import DisplayModal from '../components/DisplayModal';

type EventCalendarProps = {
  apiKey: ApiKey,
}

// TODO make it so that selected data and selected modals are equivalent
// Look at AdminManageAdminships for examples

function EventCalendar(props: EventCalendarProps) {

  // whether we're currently in optimize mode or not
  const [optimizing, setOptimizing] = React.useState(false);

  // Closing it should also unselect anything using it
  const [selectedSpan, setSelectedSpanRaw] = React.useState<{ start: number, duration: number } | null>(null);
  const setSelectedSpan = (a: { start: number, duration: number } | null) => {
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
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      onlyRecent: true,
      active: true,
      apiKey: props.apiKey.key
    });

    const maybeGoalData = await viewGoalData({
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

  const changeHandler = async (event: EventApi, oldEvent: EventApi, revert: () => void) => {
    switch (event.id.split(':')[0]) {
      case "PastEventData": {
        const oped = oldEvent.extendedProps.pastEventData;
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
        const ogd = oldEvent.extendedProps.goalData;
        const maybeGoalData = await newGoalData({
          goalId: ogd.goal.goalId,
          name: ogd.name,
          description: ogd.description,
          durationEstimate: ogd.durationEstimate,
          timeUtilityFunctionId: ogd.timeUtilityFunction.timeUtilityFunctionId,
          scheduled: true,
          startTime: event.start!.valueOf(),
          duration: event.end!.valueOf() - event.start!.valueOf(),
          status: ogd.status,
          apiKey: props.apiKey.key
        })
        if (isApiErrorCode(maybeGoalData)) {
          revert();
        }
        event.setExtendedProp("goalData", maybeGoalData);
      }
    }
  }

  if(optimizing) {
    return <CalendarSolver
      apiKey={props.apiKey}
      onHide={() => setOptimizing(false)}
    />
  }

  return <>
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
      eventResize={(era) => changeHandler(era.event, era.oldEvent, era.revert)}
      eventDrop={(eda) => changeHandler(eda.event, eda.oldEvent, eda.revert)}
      unselect={() => {
        setSelectedSpan(null);
      }}
      select={(dsa: DateSelectArg) => {
        // only open modal if this date is in the future
        if (dsa.start.valueOf() > Date.now()) {
          setSelectedSpan({
            start: dsa.start.valueOf(),
            duration: dsa.end.valueOf() - dsa.start.valueOf()
          });
        } else {
          if (calendarRef.current != null) {
            calendarRef.current.getApi().unselect();
          }
        }
      }}
    />


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
              startTime={selectedSpan.start}
              duration={selectedSpan.duration}
              postSubmit={() => setSelectedSpan(null)}
            />
          </Tab>
          <Tab eventKey="event" title="Create Event">
            <CreatePastEvent
              apiKey={props.apiKey}
              startTime={selectedSpan.start}
              duration={selectedSpan.duration}
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
        <ManageGoal goalId={selectedManageGoalData.goal.goalId} apiKey={props.apiKey} />
      </DisplayModal>
    }
  </>
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
