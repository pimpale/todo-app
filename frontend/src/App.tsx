import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import {ApiKey} from '@innexgo/frontend-auth-api';
import {AuthenticatedRoute, BrandedRoute} from '@innexgo/frontend-auth';

// public pages
import Home from './pages/Home';
import Instructions from './pages/Instructions';
import About from './pages/About';
import Error404 from './pages/Error404';

// register
import {Register } from '@innexgo/frontend-auth';
import {EmailConfirm } from '@innexgo/frontend-auth';
import {ParentPermissionConfirm } from '@innexgo/frontend-auth';

// When you forget password
import {ForgotPassword} from '@innexgo/frontend-auth';
import {ResetPassword} from '@innexgo/frontend-auth';

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

import LightIcon from "./img/innexgo_transparent_icon.png";
import DarkIcon from "./img/innexgo_onyx_transparent.png";

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
      tagline:  "Optimize your day.",
      homeUrl: "/",
      tosUrl: "/terms_of_service",
      iconSrc: LightIcon,
  }

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Home} />
        <BrandedRoute       branding={branding} path="/instructions" component={Instructions} />
        <BrandedRoute       branding={branding} path="/about" component={About} />
        <BrandedRoute       branding={branding} path="/forgot_password" component={ForgotPassword} />
        <BrandedRoute       branding={branding} path="/reset_password" component={ResetPassword} />
        <BrandedRoute       branding={branding} path="/register" component={Register} />
        <BrandedRoute       branding={branding} path="/email_confirm" component={EmailConfirm} />
        <BrandedRoute       branding={branding} path="/parent_confirm" component={ParentPermissionConfirm} />
        <AuthenticatedRoute branding={branding} path="/calendar" {...apiKeyGetSetter} component={Calendar} />
        <AuthenticatedRoute branding={branding} path="/dashboard" {...apiKeyGetSetter} component={Dashboard} />
        <AuthenticatedRoute branding={branding} path="/settings" {...apiKeyGetSetter} component={Settings} />
        <AuthenticatedRoute branding={branding} path="/account" {...apiKeyGetSetter} component={Account} />
        <AuthenticatedRoute branding={branding} path="/search" {...apiKeyGetSetter} component={Search} />
        <Route path="/" component={Error404} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
