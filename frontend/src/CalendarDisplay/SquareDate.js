import React from 'react'
import './SquareDate.css'
import {TodoItems} from './TodoListEx'

class SquareDate extends React.Component {
    displayTodo(){
        
    }

    constructor(props){
        super(props);
        this.state = {
            date: props.day,
            inMonth: props.month,
            totalTasks: TodoItems.length,
        }
    }
    render(){
        return(
            <div className="day" onClick={null}>
                <div className={this.state.inMonth ? "num" : "num Out"}>{this.state.date}</div>
                
                <li className="todo">
                    {TodoItems.map((item, index) => {
                        return(
                            <div className={this.state.totalTasks > 3 && index < 2 ? "task" : "task"} key={index} onClick={null}>
                                {item.timeStart} {item.title}
                            </div>
                        )
                    })}  
                    <div className={this.state.totalTasks > 3 ? "task": " task extranone"}>+{this.state.totalTasks-4} more items</div>
                </li>
            </div>
        )
    }
}

export default SquareDate