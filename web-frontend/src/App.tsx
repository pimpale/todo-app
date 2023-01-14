import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AuthComponentRenderer from './components/AuthComponentRenderer';

import { ApiKey } from '@innexgo/frontend-auth-api';

// public pages
import Home from './pages/Home';
import Instructions from './pages/Instructions';
import About from './pages/About';
import Error404 from './pages/Error404';

// calendar
import Calendar from './pages/Calendar';

// todo list
import Dashboard from './pages/Dashboard';

// settings
import Settings from './pages/Settings';

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
  const [apiKey, setApiKey_raw] = React.useState(getPreexistingApiKey());

  const setApiKey = (data: ApiKey | null) => {
    localStorage.setItem("apiKey", JSON.stringify(data));
    setApiKey_raw(data);
  };

  const [authServerUrlPromise, setAuthServerUrlPromise] = React.useState<Promise<string> | null>(null);

  const commonProps = {
    apiKey,
    setApiKey,
    authServerUrlPromise,
    setAuthServerUrlPromise,
  };

  const branding = {
    name: "LifeSketch",
    tagline: "Optimize your day.",
    homeUrl: "/",
    dashboardUrl: "/dashboard",
    darkAdaptedIcon: DarkAdaptedIcon,
    lightAdaptedIcon: LightAdaptedIcon,
  }

  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home branding={branding} />} />
      <Route path="/instructions" element={<Instructions branding={branding} />} />
      <Route path="/about" element={<About branding={branding} />} />
      <Route path="/calendar" element={<AuthComponentRenderer component={Calendar} branding={branding} {...commonProps} />} />
      <Route path="/dashboard" element={<AuthComponentRenderer component={Dashboard} branding={branding} {...commonProps} />} />
      <Route path="/settings" element={<AuthComponentRenderer component={Settings} branding={branding} {...commonProps} />} />
      <Route path="/search" element={<AuthComponentRenderer component={Search} branding={branding} {...commonProps} />} />
      <Route path="*" element={<Error404 />} />
    </Routes >
  </BrowserRouter >
}

export default App;
