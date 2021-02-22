import React from 'react'
import { Async, AsyncProps } from 'react-async';
import Loader from '../components/Loader';
import FullCalendar, { EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import DashboardLayout from '../components/DashboardLayout';
import CalendarCard from '../components/CalendarCard';

import { Tab, Tabs, Form, Popover, Container, Row, Col, Card } from 'react-bootstrap';
import { viewTask, viewPastEventData, viewGoal, viewGoalData, isApiErrorCode} from '../utils/utils';

import UtilityWrapper from '../components/UtilityWrapper';

import CreatePastEvent from '../components/CreatePastEvent';
import CreateTask from '../components/CreateTask';
import ManagePastEvent from '../components/ManagePastEvent';
import UserManageTask from '../components/UserManageTask';
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
  const [selectedManagePastEvent, setSelectedManagePastEvent] = React.useState<PastEvent | null>(null);

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
      apiKey: props.apiKey.key
    });

    const maybeTasks = await viewTask({
      minStartTime: args.start.valueOf(),
      maxStartTime: args.end.valueOf(),
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
      : maybeTasks.map(t => ({
        id: `Task:${t.taskId}`,
        start: new Date(t.startTime),
        end: new Date(t.startTime + t.duration),
        color: "#00000000",
        borderColor: "#00000000",
        task: t
      }))

    return [...pastEventData, ...task];
  }

  //this handler runs any time we recieve a click on an event
  const clickHandler = (eca: EventClickArg) => {
    const props = eca.event.extendedProps;
    // we switch on what type it is
    switch (eca.event.id.split(':')[0]) {
      case "PastEventData": {
        setSelectedManagePastEvent(props.pastEventData);
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
      slotDuration="00:15:00"
      nowIndicator={true}
      editable={false}
      selectable={true}
      selectMirror={true}
      events={eventSource}
      eventContent={CalendarCard}
      unselectCancel=".modal-content"
      eventClick={clickHandler}
      businessHours={{
        daysOfWeek: [1, 2, 3, 4, 5], // MTWHF
        startTime: "08:00", // 8am
        endTime: "18:00", // 6pm
        startRecur: new Date()
      }}
      selectConstraint="businessHours"
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
            <UserCreateSession
              apiKey={props.apiKey}
              start={selectedSpan.start}
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
    {selectedManageSession === null ? <> </> :
      <DisplayModal
        title="Manage Session"
        show={selectedManageSession !== null}
        onClose={() => setSelectedManageSession(null)}
      >
        <UserManageSession session={selectedManageSession} apiKey={props.apiKey} />
      </DisplayModal>
    }
    {selectedViewSession === null ? <> </> :
      <DisplayModal
        title="View Session"
        show={selectedManageSession !== null}
        onClose={() => setSelectedViewSession(null)}
      >
        <ViewSession session={selectedViewSession} expanded apiKey={props.apiKey} />
      </DisplayModal>
    }
    {selectedReviewSessionRequest === null ? <> </> :
      <DisplayModal
        title="Review Student Request"
        show={selectedReviewSessionRequest !== null}
        onClose={() => setSelectedReviewSessionRequest(null)}
      >
        <UserReviewSessionRequest
          sessionRequest={selectedReviewSessionRequest}
          apiKey={props.apiKey}
          postSubmit={() => setSelectedReviewSessionRequest(null)}
        />
      </DisplayModal>
    }
    {selectedManageSessionRequest === null ? <> </> :
      <DisplayModal
        title="Manage your Session Request"
        show={selectedManageSessionRequest !== null}
        onClose={() => setSelectedManageSessionRequest(null)}
      >
        <StudentManageSessionRequest
          sessionRequest={selectedManageSessionRequest}
          apiKey={props.apiKey}
          postSubmit={() => setSelectedManageSessionRequest(null)}
        />
      </DisplayModal>
    }
    {selectedViewSessionRequestResponse === null ? <> </> :
      <DisplayModal
        title="View Session Request Response"
        show={selectedViewSessionRequestResponse !== null}
        onClose={() => setSelectedViewSessionRequestResponse(null)}
      >
        <ViewSessionRequestResponse
          sessionRequestResponse={selectedViewSessionRequestResponse}
          apiKey={props.apiKey}
          expanded
        />
      </DisplayModal>
    }
    {selectedViewCommittment === null ? <> </> :
      <DisplayModal
        title="View Committment"
        show={selectedViewCommittment !== null}
        onClose={() => setSelectedViewCommittment(null)}
      >
        <ViewCommittment
          committment={selectedViewCommittment}
          apiKey={props.apiKey}
          expanded
        />
      </DisplayModal>
    }
    {selectedViewCommittmentResponse === null ? <> </> :
      <DisplayModal
        title="View Attendance"
        show={selectedViewCommittmentResponse !== null}
        onClose={() => setSelectedViewCommittmentResponse(null)}
      >
        <ViewCommittmentResponse
          committmentResponse={selectedViewCommittmentResponse}
          apiKey={props.apiKey}
          expanded
        />
      </DisplayModal>
    }
  </>
}

const loadCourseMemberships = async (props: AsyncProps<CourseMembership[]>) => {
  const maybeCourseMembership = await viewCourseMembership({
    userId: props.apiKey.creator.userId,
    onlyRecent: true,
    apiKey: props.apiKey.key,
  });
  if (isApiErrorCode(maybeCourseMembership)) {
    throw Error;
  }
  return maybeCourseMembership;
}


const loadCourseData = async (props: AsyncProps<CourseData[]>) => {
  const maybeCourseData = await viewCourseData({
    recentMemberUserId: props.apiKey.creator.userId,
    onlyRecent: true,
    apiKey: props.apiKey.key,
  });

  if (isApiErrorCode(maybeCourseData)) {
    throw Error;
  }
  // there's an invariant that there must always be one course data per valid course id
  return maybeCourseData;
}



function CalendarWidget(props: AuthenticatedComponentProps) {
  const [showAllHours, setShowAllHours] = React.useState(false);
  const [hiddenCourses, setHiddenCourses] = React.useState<number[]>([]);


  return <UtilityWrapper title="Upcoming Appointments">
    <Popover id="information-tooltip">
      This screen shows all future appointments.
      You can click any date to add an appointment on that date,
      or click an existing appointment to delete it.
    </Popover>
    <Async promiseFn={loadCourseData} apiKey={props.apiKey}>
      <Async.Pending>
        <Loader />
      </Async.Pending>
      <Async.Rejected>
        <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
      </Async.Rejected>
      <Async.Fulfilled<CourseData[]>>{cds =>
        <Row>
          <Col sm>
            <Card className="my-3 mx-3">
              <Card.Body>
                <Card.Title> View Settings </Card.Title>
                <Form.Check
                  checked={showAllHours}
                  onChange={_ => setShowAllHours(!showAllHours)}
                  label="Show All Hours"
                />
                {cds.length === 0
                  ? <> </>
                  : <Card.Subtitle className="my-2"> Hide Courses </Card.Subtitle>
                }
                {cds.map((cd: CourseData) =>
                  <Form.Check
                    checked={hiddenCourses.includes(cd.course.courseId)}
                    onChange={_ => setHiddenCourses(
                      hiddenCourses.includes(cd.course.courseId)
                        // if its included, remove it
                        ? hiddenCourses.filter(ci => ci !== cd.course.courseId)
                        // if its not included, disinclude it
                        : [...hiddenCourses, cd.course.courseId]
                    )}
                    label={`Hide ${cd.name}`}
                  />)}
              </Card.Body>
            </Card>
          </Col>
          <Col lg={10}>
            <Async promiseFn={loadCourseMemberships} apiKey={props.apiKey}>
              <Async.Pending>
                <Loader />
              </Async.Pending>
              <Async.Rejected>
                <Form.Text className="text-danger">An unknown error has occured.</Form.Text>
              </Async.Rejected>
              <Async.Fulfilled<CourseMembership[]>>{cms =>
                <EventCalendar
                  activeCourseDatas={cds.filter(cm => !hiddenCourses.includes(cm.course.courseId))}
                  apiKey={props.apiKey}
                  showAllHours={showAllHours}
                  courseMemberships={cms}
                />
              }
              </Async.Fulfilled>
            </Async>
          </Col>
        </Row>}
      </Async.Fulfilled>
    </Async>
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
