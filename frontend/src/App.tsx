import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import {ApiKey} from '@innexgo/frontend-auth-api';
import AuthenticatedRoute from './components/AuthenticatedRoute';

// public pages
import Home from './pages/Home';
import Instructions from './pages/Instructions';
import About from './pages/About';
import Error404 from './pages/Error404';

// register
import Register from './pages/Register';
import EmailConfirm from './pages/EmailConfirm';
import ParentPermissionConfirm from './pages/ParentPermissionConfirm';

// When you forget password
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

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

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/instructions" component={Instructions} />
        <Route path="/about" component={About} />
        <Route path="/forgot_password" component={ForgotPassword} />
        <Route path="/reset_password" component={ResetPassword} />
        <Route path="/register" component={Register} />
        <Route path="/email_confirm" component={EmailConfirm} />
        <Route path="/parent_confirm" component={ParentPermissionConfirm} />
        <AuthenticatedRoute path="/calendar" {...apiKeyGetSetter} component={Calendar} />
        <AuthenticatedRoute path="/dashboard" {...apiKeyGetSetter} component={Dashboard} />
        <AuthenticatedRoute path="/settings" {...apiKeyGetSetter} component={Settings} />
        <AuthenticatedRoute path="/account" {...apiKeyGetSetter} component={Account} />
        <AuthenticatedRoute path="/search" {...apiKeyGetSetter} component={Search} />
        <Route path="/" component={Error404} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
