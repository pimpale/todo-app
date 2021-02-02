import React from 'react';
import { ArrowForward } from '@material-ui/icons';
import { Container, Row, Col } from 'react-bootstrap';

import TransparentLogoIcon from "../img/innexgo_transparent_icon.png"

class SimpleLayout extends React.Component {
  render() {
    return (
      <Container fluid>
        <Row style={{ minHeight: "100vh" }}>
          <Col md="2" className="px-3 py-3" style={{ backgroundColor: '#990000ff' }}>
            <a href="/"><img src={TransparentLogoIcon} alt="Application Icon" /></a>
            <h4 className="text-light">todo-app</h4>
            <a href="/" className="text-light">
              <ArrowForward />Log In
             </a>
            <br />
            <a href="/instructions" className="text-light">
              <ArrowForward />Instructions
            </a>
            <br />
            <a href="/register" className="text-light">
              <ArrowForward />Register
            </a>
            <br />
            <a href="/terms_of_service" className="text-light">
              <ArrowForward />Terms of Service
            </a>
          </Col>
          <Col className="px-3 py-3">
            {this.props.children}
          </Col>
        </Row>
      </Container>
    )
  }
}

export default SimpleLayout;
