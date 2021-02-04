import React from 'react'
import './Content.css'
import {MenuTabs} from './Navbar/MenuItem'


function readTxt(filename){
    return(
        null
    )
}

class Content extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            y: MenuTabs[0].clicked,
        }
    }

    render(){
        return(
            <div className="text">
                {MenuTabs[0].clicked ? <h1>Recent Updates</h1> : <h1>Hello!</h1>}
            </div>
            
        )
    }
}

export default Content