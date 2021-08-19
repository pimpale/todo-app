import React from "react";
import Login from "../components/Login";
import { ApiKey } from "@innexgo/frontend-auth-api";
import AuthenticatedComponentProps from '../components/AuthenticatedComponentProps';
import { SimpleLayout , Branding } from '@innexgo/common-react-components';


export interface AuthenticatedRouteProps {
  branding: Branding,
  component: React.ComponentType<AuthenticatedComponentProps>
  apiKey: ApiKey | null,
  setApiKey: (data: ApiKey | null) => void
}

function AuthenticatedRoute({
  branding,
  component: AuthenticatedComponent,
  apiKey,
  setApiKey,
}: AuthenticatedRouteProps) {

  const isAuthenticated = apiKey !== null &&
    apiKey.creationTime + apiKey.duration > Date.now() &&
    apiKey.apiKeyKind !== "CANCEL";

  return isAuthenticated
    ? <AuthenticatedComponent apiKey={apiKey!} setApiKey={setApiKey} branding={branding} />
    : <SimpleLayout branding={branding}>
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

export default AuthenticatedRoute;
