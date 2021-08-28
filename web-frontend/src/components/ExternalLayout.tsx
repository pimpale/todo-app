import React from 'react';
import { List as Menu } from 'react-bootstrap-icons';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Branding } from '@innexgo/common-react-components';

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
      transitionDuration: "0.4s",
      backgroundColor: "#1C2B2D"
    } : {
      transitionDuration: "0.4s",
      backgroundColor: "#F6F0E5"
    };
    const linkStyle = topTransparent ? {
      color: "#F6F0E5",
      marginLeft: "25px"
    } : {
      color: "#2A4043",
      marginLeft: "25px"
    }

    const gradText = {
      background: "linear-gradient(#87C6F0, #EFCB8C)",
      color: "transparent",
      backgroundClip: "text",
      webkitBackgroundClip: "text",
      fontWeight: "bold" as "bold"
    }

    return (
      <header>
        <nav style={navStyle} className={"navbar navbar-expand-lg py-3" + (this.props.fixed ? " fixed-top" : "")}>
          <div className="container">
            <a style={gradText} className="navbar-brand font-weight-bold" href="/">{this.props.title}</a>
            <button className="navbar-toggler navbar-toggler-right" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
              <Menu style={linkStyle} />
            </button>
            <div className="collapse navbar-collapse"
              id="navbarSupportedContent">
              <div className="navbar-nav ml-auto">
                <a style={linkStyle} className="nav-item nav-link font-weight-bold" href="/instructions">Instructions</a>
                <a style={linkStyle} className="nav-item nav-link font-weight-bold" href="/dashboard">Login</a>
                <a style={linkStyle} className="nav-item nav-link font-weight-bold" href="/register">Register</a>
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
  branding: Branding;
}

const ExternalLayout: React.FC<ExternalLayoutProps> = (props) =>
  <>
    <ExternalHeader fixed={props.fixed} transparentTop={props.transparentTop} title={props.branding.name} />
    {props.children}
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="#home">
          <img
            alt={`${props.branding.name} Logo`}
            src={props.branding.darkAdaptedIcon}
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{' '}
          {props.branding.name}
        </Navbar.Brand>
        {props.branding.copyrightOrg ?
          <Nav className="mr-auto">
            <Nav.Link>&copy; {props.branding.copyrightOrg}, 2021</Nav.Link>
          </Nav>
          : false
        }
      </Container>
    </Navbar>
  </>

export default ExternalLayout;
