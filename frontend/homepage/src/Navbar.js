import React from 'react';
import {MenuTabs} from "./Navbar/MenuItem";
import './Navbar.css';
import {Button} from './Button'


class Navbar extends React.Component {
    state = { 
        drop: false,
        current: MenuTabs[0],
    
    }
    pageChange(item){
        this.state.current.clicked = false;
        this.setState(item.label != 'Login' ? {current:item} : {current:this.state.current});
        item.clicked = true;
    }

    handleClick = () => {
        this.setState({drop: !this.state.drop})
    }

    render(){
        return(   
            <div className="NavbarTabs"> 
                <h1 className="logo">Todo-app<i className="fab fa-react"></i></h1>
                <div className="icon" onClick={this.handleClick}>
                    <i className={this.state.drop ? 'fas fa-times': 'fas fa-bars'}></i>
                </div>
                <ul className={this.state.drop ? 'tabs dropdown' : 'tabs'}>
                    {MenuTabs.map((item, index) => {
                        return(
                            <div key={index}>
                                <a className={(this.state.current == item) ? 'currentTab': item.cls} onClick={() => this.pageChange(item)}>
                                    {item.label}
                                </a>
                            </div> 
                        )
                    })}    
                </ul>
                <Button>Login</Button>
            </div>
        );
    }
}

export default Navbar