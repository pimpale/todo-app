import { Card } from "react-bootstrap";
import { EventContentArg, EventInput } from "@fullcalendar/react"

export function externalEventDataToEvent(eed: ExternalEventData): EventInput {
  return {
    id: `ExternalEvent:${eed.externalEvent.externalEventId}`,
    start: new Date(eed.startTime),
    end: new Date(eed.endTime),
    color: "#00000000",
    borderColor: "#00000000",
    externalEventData: eed,
  }
}

export function goalDataToEvent(gd: GoalData): EventInput {
  return {
    id: `Goal:${gd.goal.goalId}`,
    start: new Date(gd.time_span![0]),
    end: new Date(gd.time_span![1]),
    color: "#00000000",
    borderColor: "#00000000",
    goalData: gd,
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
    case "ExternalEvent":
      return <ExternalEventCard externalEventData={props.externalEventData} />
    case "Goal":
      return <GoalCard goalData={props.goalData} />
  }
}

export default CalendarCard;
