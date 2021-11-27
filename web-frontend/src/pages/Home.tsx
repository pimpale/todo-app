import { Container, Button } from 'react-bootstrap';

import ExternalLayout from '../components/ExternalLayout';
import { Section, BrandedComponentProps } from '@innexgo/common-react-components';

import lady from '../img/lady_sit.png';

function Home(props: BrandedComponentProps) {

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
    <ExternalLayout branding={props.branding} fixed={true} transparentTop={true}>
      <Container fluid style={jumboStyle}>

        <img src={lady} width="450" height="450" />

        <div style={homeTextStyle}>
          <h1 style={gradText}>{props.branding.tagline}</h1>
          <h5 style={bodyText}>
            Easily organize and manage your <br />
            calendar to accomplish long-term goals.
          </h5>
          <Button style={buttonStyle} href="/register"> Get Started → </Button>
        </div>
      </Container>


      <div className="w-100">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,
            11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="shape-fill" fill="#F6F0E5"></path>
        </svg>
      </div>

      <div style={goldBack}>

        <Container style={{ paddingBottom: '30px' }}>
          <Section id="welcome" name={`Welcome to ${props.branding.name}`} >
            <div style={{ paddingBottom: '20px' }}>
              As college students, we understand, firsthand, the difficulties of creating schedules. Whether it be planning out your classes, extracurriculars,
              or shifts, the time and effort one must put into schedule planning becomes quite significant. That's why we set out design an app that
              not only organizes your schedule, but also sorts your events by importance to ensure the most urgent of tasks are finished faster and
              more efficiently than ever. Meet {props.branding.name}, your one stop shop for simple, yet effective schedule planning. {props.branding.name} uses an advanced
              algorithm trained to ensure that your most urgent tasks are prioritized. That way, you can leave the schedule planning to us, confident that
              your priorities will be met. {props.branding.name}, when your schedule feels like spam, it's time to make a plan.
            </div>
          </Section>


        </Container>

      </div>
    </ExternalLayout>
  )
}

export default Home;
