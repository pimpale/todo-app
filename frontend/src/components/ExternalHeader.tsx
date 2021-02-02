import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from '@material-ui/icons'

interface ExternalHeaderProps {
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
            <Link style={linkStyle} className="navbar-brand font-weight-bold" to="/">{this.props.children}</Link>
            <button className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarSupportedContent">
              <Menu style={linkStyle} />
            </button>
            <div className="collapse navbar-collapse"
              id="navbarSupportedContent">
              <div className="navbar-nav ml-auto">
                <Link style={linkStyle} className="nav-item nav-link font-weight-bold" to="">Home</Link>
                <Link style={linkStyle} className="nav-item nav-link font-weight-bold" to="/user">Teacher Login</Link>
                <Link style={linkStyle} className="nav-item nav-link font-weight-bold" to="/student">Student Login</Link>
              </div>
            </div>
          </div>
        </nav>
      </header>
    );
  }
}

export default ExternalHeader;
