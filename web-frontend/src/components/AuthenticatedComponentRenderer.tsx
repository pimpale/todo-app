import React from "react";
import {LoginForm, AuthenticatedComponentProps, SendVerificationChallengeForm} from "@innexgo/auth-react-components";
import { ApiKey, Email } from "@innexgo/frontend-auth-api";
//import AuthenticatedComponentProps from '../components/AuthenticatedComponentProps';
import { SimpleLayout, Branding } from '@innexgo/common-react-components';
//import SendVerificationChallengeForm from "../components/SendVerificationChallengeForm";


export interface AuthenticatedComponentRendererProps {
  branding: Branding,
  component: React.ComponentType<AuthenticatedComponentProps>
  apiKey: ApiKey | null,
  setApiKey: (data: ApiKey | null) => void
}

function AuthenticatedComponentRenderer({
  branding,
  component: AuthenticatedComponent,
  apiKey,
  setApiKey,

}: AuthenticatedComponentRendererProps) {
  const [sentEmail, setSentEmail] = React.useState<boolean>(false);
  const isAuthenticated = apiKey !== null &&
    apiKey.creationTime + apiKey.duration > Date.now() &&
    apiKey.apiKeyKind === "VALID";
  
  if(isAuthenticated){
    return <AuthenticatedComponent apiKey={apiKey!} setApiKey={setApiKey} branding={branding} />
  }

  const notLoggedIn = apiKey === null ||  
    apiKey.creationTime + apiKey.duration <= Date.now() ||
    apiKey.apiKeyKind === "CANCEL";

  if(notLoggedIn){
    return <SimpleLayout branding={branding}>
      <div className="h-100 w-100 d-flex"> 
        <div className="card mx-auto my-auto">
          <div className="card-body">
            <h5 className="card-title">Login</h5>
            <LoginForm branding={branding} onSuccess={x => setApiKey(x)} />
          </div>
        </div>
      </div>
    </SimpleLayout>
  }

  if(sentEmail === true){
    return <SimpleLayout branding={branding}>
    <div className="h-100 w-100 d-flex"> 
      <div className="card mx-auto my-auto">
        <div className="card-body">
          <h5 className="card-title">Email sent successfully!</h5>
          <p> Please check your email to continue.</p>
          <p>If you don't see our email, reload this page and try again.</p>
        </div>
      </div>
    </div>
  </SimpleLayout>
  }
  if(apiKey.apiKeyKind === "NO_EMAIL"){
    return <SimpleLayout branding={branding}>
      <div className="h-100 w-100 d-flex"> 
        <div className="card mx-auto my-auto">
          <div className="card-body">
            <h5 className="card-title">Confirm Email</h5>
            <SendVerificationChallengeForm toParent={false} initialEmailAddress="" setVerificationChallenge={()=>setSentEmail(true)} apiKey={apiKey}/>
          </div>
        </div>
      </div>
    </SimpleLayout>
  }
  else{
    return <SimpleLayout branding={branding}>
      <div className="h-100 w-100 d-flex"> 
        <div className="card mx-auto my-auto">
          <div className="card-body">
            <h5 className="card-title">Confirm Parent Email</h5>
            <SendVerificationChallengeForm toParent={true} initialEmailAddress="" setVerificationChallenge={()=>setSentEmail(true)} apiKey={apiKey}/>
          </div>
        </div>
      </div>
    </SimpleLayout>
  }
  
  


}

export default AuthenticatedComponentRenderer;
