import { Card } from "react-bootstrap";
import { EventContentArg, EventInput } from "@fullcalendar/react"
import { GoalData, GoalEvent, ExternalEventData } from '@innexgo/frontend-todo-app-api';

export function externalEventDataToEvent(eed: ExternalEventData): EventInput {
  return {
    id: `ExternalEventData:${eed.externalEvent.externalEventId}`,
    start: new Date(eed.startTime),
    end: new Date(eed.endTime),
    color: "#00000000",
    borderColor: "#00000000",
    externalEventData: eed,
  }
}

export function goalDataToEvent(gd: GoalData, ge:GoalEvent): EventInput {
  return {
    id: `GoalData:${gd.goal.goalId}`,
    start: new Date(ge.startTime),
    end: new Date(ge.endTime),
    color: "#00000000",
    borderColor: "#00000000",
    goalData: gd,
    goalEvent: ge,
  }
}

export function GoalCard(props: { goalData: GoalData }) {
  return <Card className="px-1 py-1 h-100 w-100 bg-primary text-light overflow-hidden">
    {props.goalData.name}
  </Card>
}

// ExternalEvent
export function ExternalEventCard(props: {
  externalEventData: ExternalEventData
}) {
  return (
    <Card className="px-1 py-1 h-100 w-100 bg-secondary text-light overflow-hidden" >
      {props.externalEventData.name}
    </Card>
  )
}


function CalendarCard(eventInfo: EventContentArg) {
  const props = eventInfo.event.extendedProps;
  switch (eventInfo.event.id.split(':')[0]) {
    case "ExternalEventData":
      return <ExternalEventCard externalEventData={props.externalEventData} />
    case "GoalData":
      return <GoalCard goalData={props.goalData} />
  }
}

export default CalendarCard;
