import React from 'react'

import FullCalendar, { EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import CalendarCard from '../components/CalendarCard';

import { isApiErrorCode } from '../utils/utils';

type CalendarSolverProps = {
  goalData: GoalDataScheduled[];
}

type CalendarSolverState = {
  goalData: GoalDataScheduled[];
  iteration: number;
  stopIteration: boolean;
  fullCalendar: React.RefObject<FullCalendar>;

}

class CalendarSolver extends React.Component<CalendarSolverProps, CalendarSolverState> {
  constructor(props: CalendarSolverProps) {
    super(props)
    this.state = {
      goalData: this.props.goalData,
      iteration: 0,
      stopIteration:true,
      fullCalendar: React.createRef<FullCalendar>(),
    };
  }

  startOptimize = () => {
    this.setState({
        stopIteration: false
    });
    setTimeout(this.annealIteration,100);
  }

  stopOptimize = () => {
    this.setState({
        stopIteration: true
    });
  }

  multiplier = () => {
      return 100000000 - this.state.iteration;
  }

  annealIteration = () => {
    this.setState({
        goalData: this.state.goalData.map(gd => {
            console.log(gd.startTime );
            gd.startTime += (Math.random()-0.5)*this.multiplier();
            return gd;
        })
    });
    if(!this.state.stopIteration) {
      setTimeout(this.annealIteration, 10);
    }
  }


  render() {
    return <>
      <button onClick={this.startOptimize}>Start</button>
      <button onClick={this.stopOptimize}>Stop</button>
      <FullCalendar
        ref={this.state.fullCalendar}
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
        editable={false}
        selectable={false}
        events={this.state.goalData.map(gd => ({
          id: `GoalData:${gd.goalDataId}`,
          start: new Date(gd.startTime),
          end: new Date(gd.startTime + gd.duration),
          color: "#00000000",
          borderColor: "#00000000",
          goalData: gd
        }))}
        eventContent={CalendarCard}
        unselectCancel=".modal-content"
      />
    </>
  }

}

export default CalendarSolver;
