import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import AuthenticatedRoute from './components/AuthenticatedRoute';

// public pages
import Home from './pages/Home';
import TermsOfService from './pages/TermsOfService';
import Instructions from './pages/Instructions';
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
import TodoList from './pages/TodoList';

// settings
import Settings from './pages/Settings';

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
        <Route path="/terms_of_service" component={TermsOfService} />
        <Route path="/forgot_password" component={ForgotPassword} />
        <Route path="/reset_password" component={ResetPassword} />
        <Route path="/register" component={Register} />
        <Route path="/register_confirm" component={RegisterConfirm} />
        <Route path="/todo_list" component={TodoList} />
        <AuthenticatedRoute path="/calendar" {...apiKeyGetSetter} component={Settings} />
        <AuthenticatedRoute path="/settings" {...apiKeyGetSetter} component={Settings} />
        <AuthenticatedRoute path="/feed" {...apiKeyGetSetter} component={Settings} />
        <Route path="/" component={Error404} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
