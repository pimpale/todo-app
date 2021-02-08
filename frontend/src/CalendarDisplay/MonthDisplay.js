import React from 'react'
import './MonthDisplay.css'
import LineWeek from './LineWeek'

class MonthDisplay extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            monthNum: props.monthNum,
            monthArr: Array(42),
            dayArr: Array(42),
            dayStart: props.start, //0-6 equates to Sunday-Saturday
        };
        this.calcDaysMonths();
    }
    
    toStringMonth(){
        switch(this.state.monthNum){
            case 1: 
                return "January";
            case 2:
                return "February";
            case 3:
                return "March";
            case 4:
                return "April";
            case 5:
                return "May";
            case 6:
                return "June";
            case 7:
                return "July";
            case 8:
                return "August";
            case 9:
                return "September";
            case 10:
                return "October";
            case 11:
                return "November";
            case 12:
                return "December";
        }
    }

    calcDaysMonths(){
        let mTemp = [31,28,31,30,31,30,31,31,30,31,30,31];
        let i = 0;
        if(this.state.dayStart != 0 ) {
            for(i = i; i < this.state.dayStart; i++){
                this.state.dayArr[this.state.dayStart - 1 - i] = mTemp[this.state.monthNum - 2] - i;
                this.state.monthArr[this.state.dayStart - 1 - i] = false;
            }
        }

        for(i = i; i < mTemp[this.state.monthNum-1] + this.state.dayStart; i++) {
            this.state.dayArr[i] = i - this.state.dayStart + 1;
            this.state.monthArr[i] = true;
        }

        let newMonthDay = 1;
        for(i = i; i < 42; i++){
            this.state.dayArr[i] = newMonthDay;
            this.state.monthArr[i] = false;
            newMonthDay = newMonthDay + 1;
        }
    }


    render(){
        return(
            <div className="calTable">
                <b className="monthName">
                    {this.toStringMonth()}
                </b>
                <div className="lineDayLabel">
                    <b className="dayLabel">Sun</b>
                    <b className="dayLabel">Mon</b>
                    <b className="dayLabel">Tues</b>
                    <b className="dayLabel">Wed</b>
                    <b className="dayLabel">Thurs</b>
                    <b className="dayLabel">Fri</b>
                    <b className="dayLabel">Sat</b>
                </div>

                <LineWeek className="LineWeekLabel" week={this.state.dayArr.slice(0,7)} inMonth={this.state.monthArr.slice(0,7)}/>
                <LineWeek week={this.state.dayArr.slice(7,14)} inMonth={this.state.monthArr.slice(7,14)}/>
                <LineWeek week={this.state.dayArr.slice(14,21)} inMonth={this.state.monthArr.slice(14,21)}/>
                <LineWeek week={this.state.dayArr.slice(21,28)} inMonth={this.state.monthArr.slice(21,28)}/>
                <LineWeek week={this.state.dayArr.slice(28,35)} inMonth={this.state.monthArr.slice(28,35)}/>
                <LineWeek week={this.state.dayArr.slice(35,42)} inMonth={this.state.monthArr.slice(35,42)}/>

            </div>
        )
    }
}

export default MonthDisplay