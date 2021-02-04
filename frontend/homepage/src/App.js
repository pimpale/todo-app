import React from 'react';
import './App.css';
import Navbar from './components/Navbar'
import Content from './components/Content'





class App extends React.Component{
  
  
  render(){
    return (
      <div className="App">
        
        <Navbar key="bar" onClick={() => Content.render()}/>
        <Content key="pg" className="page"/>
        <div className="sideL"/>
        <div className="sideR"/>
  
        
  
  
      </div>
    );
  }
  
}


export default App;
