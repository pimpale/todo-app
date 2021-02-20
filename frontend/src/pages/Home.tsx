import React from 'react';

import { Jumbotron, Container} from 'react-bootstrap';

import ExternalLayout from '../components/ExternalLayout';
import Section from '../components/Section';

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
        <h1 className="text-light"> Academics, Achievement, Attendance first. </h1>
      </Jumbotron>
      <Container>
        <Section id="getstarted" name="Get Started For Free">
          <div>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Integer ornare ante placerat odio lacinia condimentum.
            Quisque dignissim vulputate vestibulum.
            Pellentesque mollis enim vel ornare laoreet.
            Donec sagittis eget turpis non malesuada.
            Donec ullamcorper eleifend ullamcorper.
            In eget felis malesuada, porttitor dolor viverra, cursus elit.
            Proin dictum neque vel sapien suscipit faucibus.
            Nulla ullamcorper nibh in purus finibus, elementum rhoncus dolor placerat.
            Fusce hendrerit libero elit, sit amet mattis nisi porttitor ac.
            <a href="/register">Register</a>
          </div>
        </Section>
        <Section id="getstarted" name="Get Started For Free">
          <div>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Integer ornare ante placerat odio lacinia condimentum.
            Quisque dignissim vulputate vestibulum.
            Pellentesque mollis enim vel ornare laoreet.
            Donec sagittis eget turpis non malesuada.
            Donec ullamcorper eleifend ullamcorper.
            In eget felis malesuada, porttitor dolor viverra, cursus elit.
            Proin dictum neque vel sapien suscipit faucibus.
            Nulla ullamcorper nibh in purus finibus, elementum rhoncus dolor placerat.
            Fusce hendrerit libero elit, sit amet mattis nisi porttitor ac.
            <a href="/register">Register</a>
          </div>
        </Section>
        <Section id="getstarted" name="Get Started For Free">
          <div>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Integer ornare ante placerat odio lacinia condimentum.
            Quisque dignissim vulputate vestibulum.
            Pellentesque mollis enim vel ornare laoreet.
            Donec sagittis eget turpis non malesuada.
            Donec ullamcorper eleifend ullamcorper.
            In eget felis malesuada, porttitor dolor viverra, cursus elit.
            Proin dictum neque vel sapien suscipit faucibus.
            Nulla ullamcorper nibh in purus finibus, elementum rhoncus dolor placerat.
            Fusce hendrerit libero elit, sit amet mattis nisi porttitor ac.
            <a href="/register">Register</a>
          </div>
        </Section>
        <Section id="getstarted" name="Get Started For Free">
          <div>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Integer ornare ante placerat odio lacinia condimentum.
            Quisque dignissim vulputate vestibulum.
            Pellentesque mollis enim vel ornare laoreet.
            Donec sagittis eget turpis non malesuada.
            Donec ullamcorper eleifend ullamcorper.
            In eget felis malesuada, porttitor dolor viverra, cursus elit.
            Proin dictum neque vel sapien suscipit faucibus.
            Nulla ullamcorper nibh in purus finibus, elementum rhoncus dolor placerat.
            Fusce hendrerit libero elit, sit amet mattis nisi porttitor ac.
            <a href="/register">Register</a>
          </div>
        </Section>
      </Container>
    </ExternalLayout>
  )
}

export default Home;
