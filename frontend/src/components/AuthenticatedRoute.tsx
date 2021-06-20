import React from "react";
import Login from "../components/Login";
import SimpleLayout from "../components/SimpleLayout";
import {Card} from "react-bootstrap";
import { RouteProps } from "react-router";
import { Route } from "react-router-dom";

import {ApiKey, AuthenticatedComponentProps } from '@innexgo/frontend-auth-api';

interface AuthenticatedRouteProps extends Omit<RouteProps, 'component'> {
  component: React.ComponentType<AuthenticatedComponentProps>
  apiKey: ApiKey | null,
  setApiKey: (data: ApiKey | null) => void
}

function AuthenticatedRoute({
  component: AuthenticatedComponent,
  apiKey,
  setApiKey,
  ...rest
}: AuthenticatedRouteProps) {

  const isAuthenticated = apiKey !== null &&
    apiKey.creationTime + apiKey.duration > Date.now() &&
    apiKey.apiKeyKind !== "CANCEL";

  return (
    <Route {...rest} >
      {isAuthenticated
        ? <AuthenticatedComponent apiKey={apiKey!} setApiKey={setApiKey} />
        : <SimpleLayout>
          <div className="h-100 w-100 d-flex">
            <Card className="mx-auto my-auto">
              <Card.Body>
                <Card.Title>Login</Card.Title>
                <Login onSuccess={x => setApiKey(x)} />
              </Card.Body>
            </Card>
          </div>
        </SimpleLayout>
      }
    </Route>
  );
}

export default AuthenticatedRoute;
