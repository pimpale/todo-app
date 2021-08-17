import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { ApiKey } from '@innexgo/frontend-auth-api';
import { AuthenticatedRoute, BrandedRoute } from '@innexgo/frontend-auth';

// public pages
import Home from './pages/Home';
import Instructions from './pages/Instructions';
import About from './pages/About';
import Error404 from './pages/Error404';

// register
import { Register } from '@innexgo/frontend-auth';
import { EmailConfirm } from '@innexgo/frontend-auth';
import { ParentPermissionConfirm } from '@innexgo/frontend-auth';

// When you forget password
import { ForgotPassword } from '@innexgo/frontend-auth';
import { ResetPassword } from '@innexgo/frontend-auth';

// calendar
import Calendar from './pages/Calendar';

// todo list
import Dashboard from './pages/Dashboard';

// settings
import Settings from './pages/Settings';

// account
import Account from './pages/Account';

// search
import Search from './pages/Search';

import DarkAdaptedIcon from "./img/innexgo_transparent_icon.png";
import LightAdaptedIcon from "./img/innexgo_onyx_transparent.png";

// Bootstrap CSS & JS
import './style/style.scss';
import 'bootstrap/dist/js/bootstrap';



function getPreexistingApiKey() {
  const preexistingApiKeyString = localStorage.getItem("apiKey");
  if (preexistingApiKeyString == null) {
    return null;
  } else {
    try {
      // TODO validate here
      return JSON.parse(preexistingApiKeyString) as ApiKey;
    } catch (e) {
      // try to clean up a bad config
      localStorage.setItem("apiKey", JSON.stringify(null));
      return null;
    }
  }
}

function App() {
  const [apiKey, setApiKeyState] = React.useState(getPreexistingApiKey());
  const apiKeyGetSetter = {
    apiKey: apiKey,
    setApiKey: (data: ApiKey | null) => {
      localStorage.setItem("apiKey", JSON.stringify(data));
      setApiKeyState(data);
    }
  };

  const branding = {
    name: "LifeSketch",
    tagline: "Optimize your day.",
    homeUrl: "/",
    tosUrl: "/terms_of_service",
    darkAdaptedIcon: DarkAdaptedIcon,
    lightAdaptedIcon: LightAdaptedIcon,
  }

  return <BrowserRouter>
    <Switch>
      <Route path="/" exact >
        <BrandedRoute branding={branding} component={Home} />
      </Route>
      <Route path="/instructions" >
        <BrandedRoute branding={branding} component={Instructions} />
      </Route>
      <Route path="/about" >
        <BrandedRoute branding={branding} component={About} />
      </Route>
      <Route path="/forgot_password" >
        <BrandedRoute branding={branding} component={ForgotPassword} />
      </Route>
      <Route path="/reset_password" >
        <BrandedRoute branding={branding} component={ResetPassword} />
      </Route>
      <Route path="/register" >
        <BrandedRoute branding={branding} component={Register} />
      </Route>
      <Route path="/email_confirm" >
        <BrandedRoute branding={branding} component={EmailConfirm} />
      </Route>
      <Route path="/parent_confirm" >
        <BrandedRoute branding={branding} component={ParentPermissionConfirm} />
      </Route>
      <Route path="/calendar" >
        <AuthenticatedRoute branding={branding} {...apiKeyGetSetter} component={Calendar} />
      </Route>
      <Route path="/dashboard" >
        <AuthenticatedRoute branding={branding} {...apiKeyGetSetter} component={Dashboard} />
      </Route>
      <Route path="/settings" >
        <AuthenticatedRoute branding={branding} {...apiKeyGetSetter} component={Settings} />
      </Route >
      <Route path="/account" >
        <AuthenticatedRoute branding={branding} {...apiKeyGetSetter} component={Account} />
      </Route >
      <Route path="/search" >
        <AuthenticatedRoute branding={branding} {...apiKeyGetSetter} component={Search} />
      </Route >
      <Route path="/" component={Error404} />
    </Switch >
  </BrowserRouter >
}

export default App;
