import React from 'react';
import { Menu } from '@material-ui/icons'
import { Navbar, Nav } from 'react-bootstrap'

// Bootstrap CSS & JS
import '../style/dashboard.scss'
import 'bootstrap/dist/js/bootstrap.js'
import 'popper.js/dist/popper.js'

import innexgo_logo from '../img/innexgo_transparent_icon.png';


interface ExternalHeaderProps {
  title: string;
  fixed: boolean;
  transparentTop: boolean;
}

interface ExternalHeaderState {
  scroll: number;
}

class ExternalHeader extends React.Component<ExternalHeaderProps, ExternalHeaderState> {

  constructor(props: ExternalHeaderProps) {
    super(props);
    this.state = {
      scroll: 0,
    };
  }

  listenToScroll = () => {
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop

    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight

    const scrolled = winScroll / height

    this.setState({
      scroll: scrolled,
    })
  }

  componentDidMount() {
    window.addEventListener('scroll', this.listenToScroll)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.listenToScroll)
  }

  render() {
    const topTransparent = this.state.scroll === 0 && this.props.transparentTop;

    const navStyle = topTransparent ? {
      transitionDuration: "0.4s"
    } : {
        transitionDuration: "0.4s",
        backgroundColor: "#fff"
      };
    const linkStyle = topTransparent ? {
      color: "white",
    } : {
        color: "#000"
      }

    return (
      <header>
        <nav style={navStyle} className={"navbar navbar-expand-lg py-3" + (this.props.fixed ? " fixed-top" : "")}>
          <div className="container">
            <a style={linkStyle} className="navbar-brand font-weight-bold" href="/">{this.props.title}</a>
            <button className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarSupportedContent">
              <Menu style={linkStyle} />
            </button>
            <div className="collapse navbar-collapse"
              id="navbarSupportedContent">
              <div className="navbar-nav ml-auto">
                <a style={linkStyle} className="nav-item nav-link font-weight-bold" href="">Home</a>
                <a style={linkStyle} className="nav-item nav-link font-weight-bold" href="/feed">Login</a>
                <a style={linkStyle} className="nav-item nav-link font-weight-bold" href="/register">Register</a>
                <a style={linkStyle} className="nav-item nav-link font-weight-bold" href="/instructions">Instructions</a>
              </div>
            </div>
          </div>
        </nav>
      </header>
    );
  }
}

interface ExternalLayoutProps {
  fixed: boolean;
  transparentTop: boolean;
}

class ExternalLayout extends React.Component<ExternalLayoutProps> {
  render() {

    // TODO lets make this look better

    return (
      <>
        <ExternalHeader fixed={this.props.fixed} transparentTop={this.props.transparentTop} title="todo-app" />
        {this.props.children}
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand href="#home">
            <img
              alt="todo-app Logo"
              src={innexgo_logo}
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{' '}
        todo-app
        </Navbar.Brand>
          <Nav className="mr-auto">
            <Nav.Link>&copy; todo-app, 2021</Nav.Link>
            <Nav.Link href="/terms_of_service">Terms of Service</Nav.Link>
            <Nav.Link href="/terms_of_service#cookie_policy">Cookie Policy</Nav.Link>
          </Nav>
        </Navbar>
      </>
    )
  }
}

export default ExternalLayout;
