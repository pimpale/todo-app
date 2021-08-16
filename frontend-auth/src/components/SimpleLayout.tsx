import React from 'react';
import { ArrowForward } from '@material-ui/icons';
import HomeIcon from '@material-ui/icons/Home';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import FeaturedPlayListIcon from '@material-ui/icons/FeaturedPlayList';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';
import { Container, Row, Col } from 'react-bootstrap';
import BrandedComponentProps from '../components/BrandedComponentProps';

class SimpleLayout extends React.Component<BrandedComponentProps> {
  render() {
    const gradText = {
      background: "linear-gradient(#B7C9D6, #E6D5B8)",
      color: "transparent",
      backgroundClip: "text",
      webkitBackgroundClip: "text",
      fontWeight: "bold" as "bold",
      marginBottom: "50px"
    }

    const iconStyle = {
      color: "#E6D5B8",
      fontSize: "32px",
      marginRight: "10px",
      marginLeft: "-20px"
    }

    const linkStyle = {
      color: "white",
      fontWeight: 550,
      display: "flex",
      marginTop: "15px",
      alignItems: "center"
    }


    return (
      <Container fluid>
        <Row style={{ minHeight: "100vh" }}>
          <Col md="2" className="px-5 py-5" style={{ backgroundColor: '#1C2B2D' }}>
            <a href="/"><img src={this.props.branding.iconSrc} alt="Application Icon" /></a>
            <h4 style={gradText} >{this.props.branding.name}</h4>

            <a href="/" style={linkStyle}>
              <HomeIcon style={iconStyle} /> Home
            </a>
            <br />
            <a href="/dashboard" style={linkStyle}>
              <ArrowForward style={iconStyle} /> Log In
            </a>
            <br />
            <a href="/register" style={linkStyle}>
              <AccountBoxIcon style={iconStyle} /> Register
            </a>
            <br />
            <a href="/instructions" style={linkStyle}>
              <FeaturedPlayListIcon style={iconStyle} /> Instructions
            </a>
            <br />
            <a href="/terms_of_service" style={linkStyle}>
              <SettingsApplicationsIcon style={iconStyle} /> Terms of Service
            </a>
            <br />
          </Col>
          <Col className="px-5 py-5">
            {this.props.children}
          </Col>
        </Row>
      </Container>
    )
  }
}

export default SimpleLayout;
