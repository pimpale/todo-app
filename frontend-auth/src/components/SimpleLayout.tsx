import React from 'react';
import Branding from '../components/Branding';
import { Menu } from '@material-ui/icons';

interface HeaderProps {
  branding: Branding,
  links: { title: string, url: string }[]
  children: React.ReactNode[],
}

interface HeaderState {
  scroll: number;
}

class Header extends React.Component<HeaderProps, HeaderState> {
  constructor(props: HeaderProps) {
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
    const navStyle = {
      transitionDuration: "0.4s"
    };
    return <>
      <header>
        <nav style={navStyle} className={"navbar navbar-expand-lg py-3 fixed-top" + (this.state.scroll === 0 ? "" : " bg-secondary")}>
          <div className="container">
            <a className="navbar-brand" href={this.props.branding.homeUrl}>
              <img src={this.props.branding.iconSrc} alt="" width="30" height="24" className="d-inline-block align-text-top" />
              {this.props.branding.name}
            </a>
            <button className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarSupportedContent">
              <ThreeDotsVertical className="text-light" />
            </button>
            <div className="collapse navbar-collapse"
              id="navbarSupportedContent">
              <div className="navbar-nav ml-auto">
                {this.props.links.map(l =>
                  <a href={l.url} className="nav-item nav-link">
                    <strong>{l.title}</strong>
                  </a>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>
      {this.props.children}
      <footer>
        <a href={this.props.branding.homeUrl}>
          <img src={this.props.branding.iconSrc} alt="" width="30" height="24" className="d-inline-block align-text-top" />
          {this.props.branding.name}
        </a>
        {this.props.branding.copyrightOrg ? `&copy; ${this.props.branding}` : ""}
        {this.props.branding.tosUrl ? <a href={this.props.branding.tosUrl}>Terms of Service</a> : <div />}
      </footer>
    </>;
  }
}




export default ExternalLayout;
