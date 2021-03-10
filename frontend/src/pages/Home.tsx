import { Jumbotron, Container} from 'react-bootstrap';

import ExternalLayout from '../components/ExternalLayout';
import Section from '../components/Section';

import {APP_NAME, APP_SLOGAN} from '../utils/utils';

function Home() {

  const jumboStyle = {
    height: "60vh",
    alignItems: "center",
    backgroundAttachment: "fixed",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    display: "flex",
    backgroundColor: "#990000ff",
    justifyContent: "center"
  };


  return (
    <ExternalLayout fixed={true} transparentTop={true}>
      <Jumbotron fluid style={jumboStyle}>
        <h1 className="text-light">{APP_SLOGAN}</h1>
      </Jumbotron>
      <Container>
        <Section id="welcome" name={`Welcome to ${APP_NAME}`}>
          <div>
            Welcome to 4cast, an application built for a class project, but an application designed for the busiest of people. As students at UCLA, we know how frustrasting
            it is to schedule classes, clubs, and homework so we made this application to help all kinds of people efficiently plan their schedule. We invite you to join us
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
            <a href="/register">Register</a>
          </div>
        </Section>
        <Section id="aboutCreators" name="About the Creators">
          <div>
            Govind Pimpale: I am a 1st year Computer Science major who is interested in working for startup companies after school
            <br />
            Edmund Yim: I am a "insertYear" Computer Science and Engineering major interested in working as a software engineer after UCLA.
            <br />
            Brandon Le
            <br />
            Edgar Hukassian: I am a 3rd Year Computer Science Major interested in working as a software engineer after school.
            <br />
            Warren Pagsuguiron: I am a 4th year Electrical Engineering major who is also passionate about Computer Science. After UCLA, I plan on working on robotics.
            <a href="/register">Register</a>
          </div>
        </Section>
        <Section id="specialThanks" name="Special Thanks">
          <div>
            We want to thank Professor Eggert & the Language and Teaching Assistants of Winter 2021 CS 97 for their hard-work during the quarter.
            <a href="/register">Register</a>
          </div>
        </Section>
      </Container>
    </ExternalLayout>
  )
}

export default Home;
