import React from 'react'
import SquareDate from './SquareDate'
import './LineWeek.css'

class LineWeek extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            days: props.week,
            inMonthArr: props.inMonth
        }
    }


    renderDay(date){
        return(
            <SquareDate day={this.state.days[date]} month={this.state.inMonthArr[date]}/>
        )
    }

    render() {
        return(
            <div className="line">
                {this.renderDay(0)}
                {this.renderDay(1)}
                {this.renderDay(2)}
                {this.renderDay(3)}
                {this.renderDay(4)}
                {this.renderDay(5)}
                {this.renderDay(6)}
            </div>
        )
    }
}

export default LineWeek