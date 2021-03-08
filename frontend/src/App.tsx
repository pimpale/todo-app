import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import AuthenticatedRoute from './components/AuthenticatedRoute';

// public pages
import Home from './pages/Home';
import Instructions from './pages/Instructions';
import About from './pages/About';
import Error404 from './pages/Error404';

// register
import Register from './pages/Register';
import RegisterConfirm from './pages/RegisterConfirm';

// When you forget password
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// calendar
import Calendar from './pages/Calendar';

// todo list
import Dashboard from './pages/Dashboard';

// settings
import Settings from './pages/Settings';

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
        <Route path="/register_confirm" component={RegisterConfirm} />
        <AuthenticatedRoute path="/calendar" {...apiKeyGetSetter} component={Calendar} />
        <AuthenticatedRoute path="/dashboard" {...apiKeyGetSetter} component={Dashboard} />
        <AuthenticatedRoute path="/settings" {...apiKeyGetSetter} component={Settings} />
        <AuthenticatedRoute path="/search" {...apiKeyGetSetter} component={Search} />
        <Route path="/" component={Error404} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
