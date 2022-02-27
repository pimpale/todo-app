import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ApiKey } from '@innexgo/frontend-auth-api';
import { AuthenticatedComponentRenderer } from '@innexgo/auth-react-components';

// public pages
import Home from './pages/Home';
import Instructions from './pages/Instructions';
import About from './pages/About';
import Error404 from './pages/Error404';

// register
import { Register } from '@innexgo/auth-react-components';
import { EmailConfirm } from '@innexgo/auth-react-components';
import { ParentPermissionConfirm } from '@innexgo/auth-react-components';

// When you forget password
import { ForgotPassword } from '@innexgo/auth-react-components';
import { ResetPassword } from '@innexgo/auth-react-components';

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
    forgotPasswordUrl: "/forgot_password",
    dashboardUrl: "/dashboard",
    darkAdaptedIcon: DarkAdaptedIcon,
    lightAdaptedIcon: LightAdaptedIcon,
  }

  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home branding={branding} />} />
      <Route path="/instructions" element={<Instructions branding={branding} />} />
      <Route path="/about" element={<About branding={branding} />} />
      <Route path="/forgot_password" element={<ForgotPassword branding={branding} />} />
      <Route path="/reset_password" element={<ResetPassword branding={branding} />} />
      <Route path="/register" element={<Register {...apiKeyGetSetter} branding={branding} />} />
      <Route path="/email_confirm" element={<EmailConfirm {...apiKeyGetSetter} branding={branding} />} />
      <Route path="/parent_permission_confirm" element={<ParentPermissionConfirm branding={branding} />} />
      <Route path="/calendar" element={<AuthenticatedComponentRenderer branding={branding} {...apiKeyGetSetter} component={Calendar} />} />
      <Route path="/dashboard" element={<AuthenticatedComponentRenderer branding={branding} {...apiKeyGetSetter} component={Dashboard} />} />
      <Route path="/settings" element={<AuthenticatedComponentRenderer branding={branding} {...apiKeyGetSetter} component={Settings} />} />
      <Route path="/account" element={<AuthenticatedComponentRenderer branding={branding} {...apiKeyGetSetter} component={Account} />} />
      <Route path="/search" element={<AuthenticatedComponentRenderer branding={branding} {...apiKeyGetSetter} component={Search} />} />
      <Route path="*" element={<Error404 />} />
    </Routes >
  </BrowserRouter >
}

export default App;
