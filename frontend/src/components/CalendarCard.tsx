import { Card } from "react-bootstrap";
import { EventContentArg, EventInput } from "@fullcalendar/react"

export function taskEventToEvent(te: TaskEvent, gd: GoalData): EventInput {
  return {
    id: `TaskEvent:${te.taskEventId}`,
    start: new Date(te.startTime),
    end: new Date(te.startTime + te.duration),
    color: "#00000000",
    borderColor: "#00000000",
    taskEvent: te,
    goalData: gd,
  }
}

export function GoalCard(props: { goalData: GoalData }) {
  return <Card className="px-1 py-1 h-100 w-100 bg-primary text-light overflow-hidden">
    {props.goalData.name}
  </Card>
}

// TaskEvent
export function TaskEventCard(props: {
  goalData: GoalData
}) {
  return (
    <Card className="px-1 py-1 h-100 w-100 bg-primary text-light overflow-hidden" >
      {props.goalData.name}
    </Card>
  )
}


function CalendarCard(eventInfo: EventContentArg) {
  const props = eventInfo.event.extendedProps;
  switch (eventInfo.event.id.split(':')[0]) {
    case "TaskEvent":
      return <TaskEventCard goalData={props.goalData} />
  }
}

export default CalendarCard;
