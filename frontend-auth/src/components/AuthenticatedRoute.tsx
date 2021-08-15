import React from "react";
import Login from "../components/Login";
import SimpleLayout from "../components/SimpleLayout";
import { RouteProps } from "react-router";
import { Route } from "react-router-dom";
import { ApiKey } from "@innexgo/frontend-auth-api";


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
            <div className="card mx-auto my-auto">
              <div className="card-body">
                <h5 className="card-title">Login</h5>
                <Login onSuccess={x => setApiKey(x)} />
              </div>
            </div>
          </div>
        </SimpleLayout>
      }
    </Route>
  );
}

export default AuthenticatedRoute;
