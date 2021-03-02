import React from 'react'
import { Async, AsyncProps } from 'react-async';
import Loader from '../components/Loader';
import FullCalendar, { EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import DashboardLayout from '../components/DashboardLayout';
import CalendarCard from '../components/CalendarCard';

import { Tab, Tabs, Form, Popover, Container, Row, Col, Card } from 'react-bootstrap';
import { viewTask, viewPastEventData, viewGoal, viewGoalData, isApiErrorCode } from '../utils/utils';

import UtilityWrapper from '../components/UtilityWrapper';

import CreatePastEvent from '../components/CreatePastEvent';
import CreateTask from '../components/CreateTask';
import ManagePastEvent from '../components/ManagePastEvent';
import ManageTask from '../components/ManageTask';
import DisplayModal from '../components/DisplayModal';

type EventCalendarProps = {
  apiKey: ApiKey,
}

// TODO make it so that selected data and selected modals are equivalent
// Look at AdminManageAdminships for examples

function EventCalendar(props: EventCalendarProps) {

  // Closing it should also unselect anything using it
  const [selectedSpan, setSelectedSpanRaw] = React.useState<{ start: number, duration: number } | null>(null);
  const setSelectedSpan = (a: { start: number, duration: number } | null) => {
    setSelectedSpanRaw(a)
    if (!a && calendarRef.current != null) {
      calendarRef.current.getApi().unselect();
    }
  }

  // the currently selected data
  const [selectedManageTask, setSelectedManageTask] = React.useState<Task | null>(null);
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
      active:true,
      apiKey: props.apiKey.key
    });

    const maybeTasks = await viewTask({
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
      status: "VALID",
      apiKey: props.apiKey.key
    });

    const pastEventData = isApiErrorCode(maybePastEventData)
      ? []
      : maybePastEventData.map(ped => ({
        id: `PastEventData:${ped.pastEventDataId}`,
        start: new Date(ped.startTime),
        end: new Date(ped.startTime + ped.duration),
        color: "#00000000",
        borderColor: "#00000000",
        pastEventData: ped
      }))

    const task = isApiErrorCode(maybeTasks)
      ? []
      : await Promise.all(
        maybeTasks.flatMap(async t => {
          const maybeGoalData = await viewGoalData({
            goalId: t.goal.goalId,
            onlyRecent: true,
            apiKey: props.apiKey.key
          });
          
          if (isApiErrorCode(maybeGoalData)) {
            return {};
          }
          
          // we have an invariant that any session must have at least one session data, so its ok
          return {
            id: `Task:${t.taskId}`,
            start: new Date(t.startTime),
            end: new Date(t.startTime + t.duration),
            color: "#00000000",
            borderColor: "#00000000",
            task: t,
            goalData: maybeGoalData[0]
          }
        })
        
      );
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
      case "Task": {
        setSelectedManageTask(props.task);
        break;
      }
    }
  }

  return <>
    <FullCalendar
      ref={calendarRef}
      plugins={[timeGridPlugin, interactionPlugin]}
      headerToolbar={{
        left: 'prev,next today',
        center: '',
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
            <CreateTask
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
    {selectedManageTask === null ? <> </> :
      <DisplayModal
        title="Manage Event"
        show={selectedManageTask !== null}
        onClose={() => setSelectedManageTask(null)}
      >
        <ManageTask taskId={selectedManageTask.taskId} apiKey={props.apiKey} />
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
