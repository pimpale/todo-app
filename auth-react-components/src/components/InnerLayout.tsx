import React from 'react';
import { Loader } from '@innexgo/common-react-components';
import { ApiKey, UserData, userDataView } from '@innexgo/frontend-auth-api';
import { unwrap } from '@innexgo/frontend-common';
import { Async, AsyncProps } from 'react-async';
import { Icon, BoxArrowLeft as ExitAppIcon, List as MenuIcon} from 'react-bootstrap-icons';


const iconStyle = {
  width: "2rem",
  height: "2rem",
};

const InnerLayoutContext = React.createContext<boolean>(true)

interface SidebarEntryProps {
  label: string,
  icon: Icon,
  href: string,
}

const SidebarEntry: React.FunctionComponent<SidebarEntryProps> = props => {
  const style = {
    color: "#fff"
  }
  const Icon = props.icon;
  if (React.useContext(InnerLayoutContext)) {
    // collapsed
    return <a style={style} className="nav-item nav-link" href={props.href}>
      <Icon style={iconStyle} />
    </a>
  } else {
    // not collapsed
    return <a style={style} className="nav-item nav-link" href={props.href}>
      <Icon style={iconStyle} /> {props.label}
    </a>
  }
}

const loadUserData = async (props: AsyncProps<UserData>) => {
  const userData = await userDataView({
    creatorUserId: [props.apiKey.creatorUserId],
    onlyRecent: true,
    apiKey: props.apiKey.key,
  })
    .then(unwrap);

  return userData[0];
}



const Body: React.FunctionComponent = props => <> {props.children} </>

interface InnerLayoutComposition {
  SidebarEntry: React.FunctionComponent<SidebarEntryProps>
  Body: React.FunctionComponent
}

interface InnerLayoutProps {
  apiKey: ApiKey
  logoutCallback: () => void
}

const InnerLayout: React.FunctionComponent<React.PropsWithChildren<InnerLayoutProps>> & InnerLayoutComposition =
  props => {
    let [collapsed, setCollapsed] = React.useState<boolean>(true);

    const widthrem = collapsed ? 4 : 15;

    const sidebarStyle = {
      height: "100%",
      width: `${widthrem}rem`,
      position: "fixed" as const,
      top: 0,
      left: 0,
      overflowX: "hidden" as const,
      overflowY: "hidden" as const,
      margin: "0%"
    };

    const sidebarBottom = {
      position: 'absolute' as const,
      bottom: 0,
      right: 0,
      left: 0,
    };

    let sidebarChildren: React.ReactElement[] = [];
    let nonSidebarChildren: React.ReactNode[] = [];

    React.Children.forEach(props.children, child => {
      if (React.isValidElement(child)) {
        if (child.type === SidebarEntry) {
          sidebarChildren.push(child);
        } else if (child.type === Body) {
          nonSidebarChildren.push(child);
        }
      }
    });

    return (
      <InnerLayoutContext.Provider value={collapsed}>
        <div>
          <nav className="bg-dark text-light" style={sidebarStyle}>
            <div className="nav-item nav-link link-light">
              <MenuIcon style={iconStyle} onClick={_ => setCollapsed(!collapsed)} />
            </div>
            <span className="nav-item nav-link link-light mx-auto my-3">
              <Async promiseFn={loadUserData} apiKey={props.apiKey}>
                <Async.Pending>
                  {collapsed ? false : <Loader /> }
                </Async.Pending>
                <Async.Rejected>
                  <span className="text-danger">Couldn't load User</span>
                </Async.Rejected>
                <Async.Fulfilled<UserData>>{ud =>
                  collapsed
                    ? false
                    : <h6>Welcome, {ud.name}</h6>
                }
                </Async.Fulfilled>
              </Async>
            </span>
            {sidebarChildren}
            <div style={sidebarBottom}>
              <button
                type="button"
                className="btn nav-item nav-link link-light"
                onClick={() => props.logoutCallback()}
              >
                <ExitAppIcon style={iconStyle} /> {collapsed ? "" : "Log Out"}
              </button>
            </div>
          </nav>
          <div style={{ marginLeft: `${widthrem}rem` }}>
            {nonSidebarChildren}
          </div>
        </div>
      </InnerLayoutContext.Provider>
    )
  }

InnerLayout.SidebarEntry = SidebarEntry;
InnerLayout.Body = Body;

export default InnerLayout;
