import React from "react";
import { Card, Button, Spinner } from "react-bootstrap";
import { ApiKey } from "@innexgo/frontend-auth-api";
import { AuthenticatedComponentProps } from '@innexgo/auth-react-components';
import { AuthenticatedComponentRenderer } from '@innexgo/auth-react-components';
//import AuthenticatedComponentRenderer from "./AuthenticatedComponentRenderer";
import { Branding } from '@innexgo/common-react-components';
import { Async } from "react-async";

// to get the auth server url
import { info } from '@innexgo/frontend-todo-app-api';
import { unwrap } from '@innexgo/frontend-common';

const getAuthUrl = () => info().then(unwrap).then(x => x.authServiceExternalUrl);

function WaitingPage(props: { children: React.ReactNode | React.ReactNodeArray }) {
  return <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
    <div className="my-auto mx-auto text-center" children={props.children} />
  </div>
}

interface InnerAuthComponentRendererProps {
  branding: Branding,
  component: React.ComponentType<AuthenticatedComponentProps>
  apiKey: ApiKey | null,
  setApiKey: (data: ApiKey | null) => void,
  authServerUrlPromise: Promise<string>,
  setAuthServerUrlPromise: (data: Promise<string> | null) => void,
}

function InnerAuthComponentRenderer(props: InnerAuthComponentRendererProps) {
  return <Async promise={props.authServerUrlPromise}>
    <Async.Pending>
      <WaitingPage>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </WaitingPage>
    </Async.Pending>
    <Async.Rejected>{error =>
      <WaitingPage>
        <h1>Error Contacting Server: <span className="text-danger">{error.message}</span></h1>
        <Button onClick={() => props.setAuthServerUrlPromise(getAuthUrl())}>Retry</Button>
      </WaitingPage>
    }</Async.Rejected>
    <Async.Fulfilled<string>>{data =>
      <AuthenticatedComponentRenderer
        apiKey={props.apiKey}
        setApiKey={props.setApiKey}
        authServerUrl={data}
        branding={props.branding}
        component={props.component}
      />
    }</Async.Fulfilled>
  </Async>

}

interface AuthComponentRendererProps {
  branding: Branding,
  component: React.ComponentType<AuthenticatedComponentProps>
  apiKey: ApiKey | null,
  setApiKey: (data: ApiKey | null) => void,
  authServerUrlPromise: Promise<string> | null,
  setAuthServerUrlPromise: (data: Promise<string> | null) => void,
}

function AuthComponentRenderer(props: AuthComponentRendererProps) {
  React.useEffect(() => {
    if (props.authServerUrlPromise === null) {
      props.setAuthServerUrlPromise(getAuthUrl());
    }
  });

  if (props.authServerUrlPromise !== null) {
    return <InnerAuthComponentRenderer
      branding={props.branding}
      component={props.component}
      apiKey={props.apiKey}
      setApiKey={props.setApiKey}
      authServerUrlPromise={props.authServerUrlPromise}
      setAuthServerUrlPromise={props.setAuthServerUrlPromise}
    />
  } else {
    return <div />
  }
}

export default AuthComponentRenderer;
