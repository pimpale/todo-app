import { Jumbotron, Container, Button} from 'react-bootstrap';

import ExternalLayout from '../components/ExternalLayout';
import Section from '../components/Section';

import {APP_NAME, APP_SLOGAN} from '../utils/utils';
import lady from '../img/lady_sit.png';
import { borderRadius } from 'react-select/src/theme';

function Home() {

  const jumboStyle = {
    height: "80vh",
    alignItems: "center",
    backgroundAttachment: "fixed",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    display: "flex",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    marginTop: "25px"
  };


  const buttonStyle = {
    backgroundColor: "#9DC6E1",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "5px",
    width: "33vh",
    fontSize: "20px",
    fontWeight: "bolder" as "bolder",
    letterSpacing: "1px",
    marginLeft: "10px"
  };

  const gradText = {
    background: "linear-gradient(#9DC6E1, #CBC0AC)",
    color: "transparent",
    backgroundClip: "text",
    webkitBackgroundClip: "text",
    fontWeight: "bold" as "bold",
    letterSpacing: "1px",
    marginBottom: "20px",
    fontSize: "45px"
  };

  const bodyText = {
    fontWeight: "lighter" as "lighter",
    marginBottom: "25px",
    lineHeight: "25px",
  };

  const homeTextStyle = {
    marginLeft: "150px"
  };

  const goldBack = {
    backgroundColor: "#F6F0E5"
  };

  const homeBody = {
    height: "50vh",
    marginTop: "110px"
  };




  return (
    <ExternalLayout fixed={true} transparentTop={true}>
      <Jumbotron fluid style={jumboStyle}>

        <img src={lady} width = "450" height = "450" />

        <div style = {homeTextStyle}>
          <h1 style ={gradText}> {APP_SLOGAN} </h1>
          <h5 style = {bodyText}>
            Easily organize and manage your <br/>
            calendar to accomplish long-term goals.
            </h5>
            <Button style={buttonStyle} href="/register"> Get Started → </Button>
        </div>
      </Jumbotron>

      
      <div className="custom-shape-divider-bottom-1624938662">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,
            11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="shape-fill"></path>
        </svg>
      </div>

      <div style = {goldBack}> 
    
      <Container>
        <Section id="welcome" name={`Welcome to ${APP_NAME}`}>
          <div>
            Welcome to {APP_NAME}, an application built for a class project, but an application designed for the
            busiest of people. As students at UCLA, we know how frustrating it is to schedule classes,
            clubs, and homework so we made this application to help all kinds of people efficiently plan their schedule. We invite you to join us
            and be prepared for what the day has in store.
            <a href="/register">Register</a>
          </div>
        </Section>
        <Section id="why_us" name="Our Application">
          <div>
            A scheduling app shouldn't have to take more than a few minutes to arrange the multiple events of your day; therefore, we use an algorithm modeled after simulated
            annealing to choose the best fit for certain events around your Commitments (immovable events such as classes, interviews, work, etc.).
            <br />
            With all your events in one place, our application gives you a simple TO-DO feed to see what is upcoming in your schedule, allowing you to take a quick glance and
            go back to working efficiently.
          </div>
        </Section>
        <Section id="aboutCreators" name="About the Creators">
          <div>
            Govind Pimpale: I am a 1st year Computer Science major who is interested in working for startup companies after school
            <br />
            Edmund Yim: I am a 3rd year Computer Science and Engineering major interested in working as a software engineer after UCLA.
            <br />
            Brandon Le: I am a 3rd year Computer Science major interested in working as a software engineer after graduating.
            <br />
            Edgar Hukassian: I am a 3rd Year Computer Science Major interested in working as a software engineer after school.
            <br />
            Warren Pagsuguiron: I am a 4th year Electrical Engineering major who is also passionate about Computer Science. After UCLA, I plan on working on robotics.
          </div>
        </Section>
        <Section id="specialThanks" name="Special Thanks">
          <div>
            We want to thank Professor Eggert & the Language and Teaching Assistants of Winter 2021 CS 97 for their hard-work during the quarter.
            <a href="/register">Register</a>
          </div>
        </Section>
      </Container>

      </div>
    </ExternalLayout>
  )
}

export default Home;
