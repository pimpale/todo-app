import React from 'react';
import TextField from '@material-ui/core/TextField'
import Icon from '@material-ui/core/Icon';
import { green } from '@material-ui/core/colors';
import SimpleLayout from '../components/SimpleLayout';
import {TodoItems} from '../CalendarDisplay/TodoListEx'

function TodoList() {

    // get todo list from ../CalendarDisplay/TodoListEx and make a todo list
    // out of it:
    let todo_list = TodoItems.map((todo) =>
    <div style={{display: 'flex', justifyContent:'center', 
                alignItems:'center', height: '15vh',}}>
      <li>
        <TextField 
          id="standard-multiline-static" 
          multiline 
          rows={4}
          value={
            todo.title + '\n' +
            todo.timeStart + " - " + todo.timeEnd + '\n' +
            todo.description
          }
          style = {{width: 300}}>
          {/* might add icons like a circle for todo list items:
          {/* <Icon style={{ color: green[500] }}>add_circle</Icon>
          {"Todo Title\nDescription and stuff"} */}
        </TextField>
      </li>
    </div>
    );

    // some more examples of todo list items:
    let todo_list_examples = []
    for(let i = 0; i < 4; i++){
      todo_list_examples.push(
        <div style={{display: 'flex', justifyContent:'center', 
        alignItems:'center', height: '15vh',}}>
          <li>
            <TextField 
              id="standard-multiline-static" 
              multiline 
              rows={4}
              value={
                "Todo Title\nDescription and stuff"
                // might add icons like a circle for todo list items:
                //<Icon style={{ color: green[500] }}>add_circle</Icon>
              }
              style = {{width: 300}}>
            </TextField>
          </li>
        </div>
      )
    }

  return (
    <SimpleLayout>

      {/* for inserting a new todo: */}
      <div style={{display: 'flex', justifyContent:'center', 
                  alignItems:'center', height: '30vh',}}>
        <TextField 
          id="standard-multiline-static" 
          multiline 
          rows={4}
          placeholder="Insert a todo here..."
          style = {{width: 300}}
        /> 
      </div>

      {todo_list}

      {todo_list_examples}

    </SimpleLayout>
  )
}

export default TodoList;
