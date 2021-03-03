import React from "react";
import { Card } from "react-bootstrap";
import { EventContentArg, EventInput } from "@fullcalendar/react"

export function goalDataToEvent(gd: GoalDataScheduled): EventInput {
  return {
    id: `GoalData:${gd.goalDataId}`,
    start: new Date(gd.startTime),
    end: new Date(gd.startTime + gd.duration),
    color: "#00000000",
    borderColor: "#00000000",
    goalData: gd
  }
}

export function pastEventDataToEvent(ped: PastEventData): EventInput {
  return {
    id: `PastEventData:${ped.pastEventDataId}`,
    start: new Date(ped.startTime),
    end: new Date(ped.startTime + ped.duration),
    color: "#00000000",
    borderColor: "#00000000",
    pastEventData: ped
  }
}


function GoalCard(props: { goalData: GoalData }) {
  return <Card className="px-1 py-1 h-100 w-100 bg-primary text-light overflow-hidden">
    {props.goalData.name}
  </Card>
}

// PastEvent
function PastEventCard(props: {
  pastEventData: PastEventData
}) {
  return (
    <Card className="px-1 py-1 h-100 w-100 bg-primary text-light overflow-hidden" >
      {props.pastEventData.name}
    </Card>
  )
}


function CalendarCard(eventInfo: EventContentArg) {
  const props = eventInfo.event.extendedProps;
  switch (eventInfo.event.id.split(':')[0]) {
    case "PastEventData":
      return <PastEventCard pastEventData={props.pastEventData} />
    case "GoalData":
      return <GoalCard goalData={props.goalData} />
  }
}

export default CalendarCard;
