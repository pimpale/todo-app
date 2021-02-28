import React from "react";
import { Card } from "react-bootstrap";
import { EventContentArg } from "@fullcalendar/react"

function TaskCard(props: { task: Task, goalData: GoalData }) {
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
      return <PastEventCard
      pastEventData={props.pastEventData}
      />
    case "Task":
      return <TaskCard
        task={props.task}
        goalData={props.goalData}
      />
  }
}

export default CalendarCard;
