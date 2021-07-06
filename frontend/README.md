# Todo App Frontend

### Table of Contents

* [Architecture](#architecture)
  * [Overview](#overview)
* [Basics](#basics)
  * [Asynchronous Network Calls](#asynchronous-network-calls)
  * [Error Handling with Typescript](#error-handling-with-typescript)
  * [Rendering Asynchronous Data](#rendering-asynchronous-data)
  * [React forms with Formik and React Bootstrap](#react-forms-with-formik-and-react-bootstrap)

## Architecture

This section goes over how the frontend is structured and how it works with the backend.

### Overview

The frontend is made with [React]( https://reactjs.org/ ) and [Typescript]( https://www.typescriptlang.org/ ). 
We use [Create React App]( https://create-react-app.dev/ ) to compile and build the frontend.

The project's directories are structured as follows:
* `public`
  * These files are directly copied into the final build. This folder holds the favicon, index.html, and other critical files.
* `src`
  * `src/setupProxy.js`
    * This file is managed by Create React App to set up the development proxy.
    * In production, this will be done by NGINX.
    * It redirects:
      * `/api/auth` to `http://localhost:8079`
      * `/api/todo-app` to `http://localhost:8080`
  * `src/index.tsx`
    * This is the mount point for React.
  * `src/assets/`
    * This is where we store pictures, audio files, and other assets. 
  * `src/App.tsx`
    * This guides which paths are directed to which React components


## Basics

This section goes over the basic design choices and coding strategies in use in this codebase.

### Asynchronous Network Calls

todo-app must communicate with the backend to render persisted data, or submit data to persist.
Our app uses standard POST requests over HTTP to communicate, as we don't require any special functionality.

In JavaScript, there are two ways to submit data:
* `XMLHttpRequest` [documentation]( https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest )
* `fetch` [documentation]( https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API )

`fetch` is newer, introduced in ES6, and we chose to use this in todo-app, since it has a more modern API and supports JavaScript Promises.
However, you will never have to use fetch directly in todo-app. 
Any time you need to make a request to the backend, call a function in [utils.ts](./src/utils/utils.ts).
Doing it this way type checks all arguments, automatically converts results to JavaScript objects, and overall prevents bugs.

Note that many of these functions use the keywords `await` and `async`.
This means that they are asynchronous functions ([documentation]( https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await )).
In a nutshell, the rule is that any call to an async function must have an `await` ahead of it to actually load the result.
Any function that makes an `await` call is itself asynchronous, and so must have the word `async` ahead of it.

Examples:
```tsx
import { sleep } from '@innexgo/frontend-common';

// this function is WRONG because it doesn't call await. 
// it won't sleep at all, but will still compile
function badsleep() {
  sleep(1000);
}

// this function won't compile because it hasn't been declared async
function wontcompile() {
  await sleep(1000);
}

// this function will work as intended
async function goodsleep() {
  await sleep(1000);
}
```

### Error Handling with Typescript

todo-app uses TypeScript, not pure JavaScript. Thus, all values have compile time types.
In most cases, this is very helpful for catching bugs, as it forces us to explicitly specify all possible results of a computation.
However, it does result in some verbosity, expecially when dealing with network requests.

Let's consider the example of creating a login token, and printing the key.
```tsx
import { ApiKey, apiKeyNewValid, } from '@innexgo/frontend-auth-api';
import { isErr } from '@innexgo/frontend-common';

const apiKey = await apiKeyNewValid({
  userEmail: 'alpha@example.com',
  userPassword: 'Boolean500',
  duration: 5 * 60 * 60 * 1000
});

// WRONG, will not compile
console.log(apiKey.key);
```
This example won't compile with TypeScript. 
The compiler will tell us something like 
`Property 'key' does not exist on type 'Result<ApiKey, "NO_CAPABILITY" | "API_KEY_UNAUTHORIZED" | ... 20 more ... | "UNKNOWN">'`.
If you have errors like this, a good starting point is to look at the the function's type.

Let's look at the declaration of newValidApiKey:
```tsx
export declare function apiKeyNewValid(props: ValidApiKeyNewProps): Promise<Result<ApiKey, AuthErrorCode>>;
```
The type of the returned value is the bit at the end: `Promise<Result<ApiKey, ApiErrorCode>>`
Breaking this expression down:
* Let's look at `Promise` 
  * All async functions have to return a `Promise`, not the actual type.
    * Learn more about this restriction here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
  * Promise documentation: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
* The angle brackets after `Promise` specify its type parameters. 
  Generics in TypesScript work similarly to generics in java and templates in C++.
  * Generic Type documentation: https://www.typescriptlang.org/docs/handbook/generics.html 
* The part inside the angle brackets `Result<ApiKey, ApiErrorCode>`, is the type that actually gets set on the variable apiKey.
  * How come `apiKeyNewValid` returns `Promise<Result<ApiKey, ApiErrorCode>>` but apiKey is set to `Result<ApiKey, ApiErrorCode>`?
    * The `await` keyword unwraps the Promise.
      * `sleep()` has type `Promise<void>` but `await sleep()` has type `void`.
  * The expression `Result<ApiKey, ApiErrorCode>` is a [tagged union]( https://en.wikipedia.org/wiki/Tagged_union ).
    * "Tagged unions hold a value that could take on several different, but fixed, types. Only one of the types can be in use at any one time."
    * For example, both of these variables can be represented by the same type:
      * `let x:Result<number, string> = { Ok: 1 };`
      * `let y:Result<number, string> = { Err: "error" };`
    * Learn more about Union types in Typescript here: https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html 

So, we've ascertained that apiKey has type `Result<ApiKey, ApiErrorCode>`. 
We can't directly access it's `key` property since it isn't guaranteed which variant of the tagged union we have.
To fix this, we have to satisfy TypeScript's type checker by checking that it isn't an Err variant.
After that, we can access the `Ok` field on the type to get the data.

```tsx
import { ApiKey, apiKeyNewValid, } from '@innexgo/frontend-auth-api';
import { isErr } from '@innexgo/frontend-common';

const maybeApiKey = await apiKeyNewValid({
  userEmail: values.email,
  userPassword: values.password,
  duration: 5 * 60 * 60 * 1000
});

if(isErr(maybeApiKey)) {
  console.log(maybeApiKey.Err);
} else {
  console.log(maybeApiKey.Ok.key);
}
```
This example does what is intended.
We also, in the process of satisfying the compiler, handled the error correctly and display an error message.

### Rendering Asynchronous Data

In a pure TypeScript function, you could do this to fetch data from the backend:
```tsx
import { ApiKey, apiKeyView } from '@innexgo/frontend-auth-api';
import { isErr } from '@innexgo/frontend-common';


async function Foo(apiKey:ApiKey) {
  const maybeApiKeys = await apiKeyView({
    apiKey:apiKey.key
  });
  
  // throw errors if they exist
  if(isErr(maybeApiKeys)) {
    throw Error(maybeApiKey.Err);
  }
  
  // logs each key
  maybeApiKeys.Ok.foreach(ak => console.log(ak.key));
}

```

However, this doesn't work in React:


```tsx
import { ApiKey, apiKeyView } from '@innexgo/frontend-auth-api';
import { isErr } from '@innexgo/frontend-common';

async function Foo(apiKey:ApiKey) {
  const maybeApiKeys = await apiKeyView({
    apiKey:apiKey.key
  });
  
  if(isErr(maybeApiKeys)) {
    return <p>Error!</p>
  } else {
    return <ul>{maybeApiKeys.Ok.map(ak => <li>{ak.key}</li>)}</ul>
  }
}

```

While this compiles just fine, it will throw a runtime exception.
This is because all async functions return a `Promise`.
React can only render a `ReactNode`, and has no idea what to do with a `Promise<ReactNode>`.

This problem, unfortunately, has no out of the box solutions.
We'll have to include the React-Async library ([documentation](https://github.com/async-library/react-async)).
While React-Async has a lot of functionality, the piece we're most interested in is the `Async` component.
Let's look at an annotated working example of what we wanted to do.


```tsx
import { ApiKey, apiKeyView } from '@innexgo/frontend-auth-api';
import { isErr } from '@innexgo/frontend-common';
import { Async, AsyncProps } from 'react-async';

import Loader from '../utils/Loader';

// it's necessary to put the function outside of the other function due to this 
// issue with React-Async: https://github.com/async-library/react-async/issues/104
async function loadApiKeys(props:AsyncProps<ApiKey[]>) => {
  const maybeApiKeys = await apiKeyView({
    // note: props is untyped, so we have to be careful that we don't 
    // accidentally request something that wasn't provided
    apiKey:props.apiKey.key
  });
  
  // throwing the error means that it will display <Async.Rejected> option.
  if(isErr(maybeApiKeys)) {
    throw Error(maybeApiKeys.Err);
  }
  
  // when an error is not thrown, it will display <Async.Fulfilled> option.
  return maybeApiKeys.Ok;
}

async function Foo(props:{apiKey:ApiKey}) {
  // include any extra arguments to the loading function as a prop to this function.
  return <Async promiseFn={loadApiKeys} apiKey={props.apiKey}>
    <Async.Pending>
      Loading...
      <Loader/>
    </Async.Pending>
    <Async.Rejected>
      Error: Couldn't load resource.
    </Async.Rejected>
    <Async.Fulfilled<ApiKey[]>>
      {apiKeys => 
        <ul>
          {apiKeys.map(ak => <li>{ak.key}</li>)}
        </ul>
      }
    </Async.Fulfilled>
  </Async>
}
```

The basic idea is that we use the `Async` component to load data from a function. 
The function is provided as the prop `promiseFn`, while the arguments are provided as the other props on the structure.
Inside the Async component, we have three sub components.

First, we have `Async.Pending`. This component is displayed while the data is still being fetched.
In todo-app, it is reccomended to use the `<Loader/>` element, as this displays a nice animated buffer wheel.

Next, we have the `Async.Rejected` component. 
This component is rendered when the promiseFn throws an error.
You should display some text here explaining what went wrong and asking the user to reload.

Finally, we have the `Async.Fulfilled` component. 
This is a generic component, as is shown by the nested pair of angle brackets.
The type parameter should be the same as the type parameter of the `AsyncProps` argument of the `promiseFn`.
In this case, the the argument of the `promiseFn` is `AsyncProps<ApiKey[]>`. 
This means that the type parameter is `ApiKey[]`.
On the interior of the `Async.Fulfilled` component, we have a function accepting the apiKeys argument and returning a ReactNode.
This will be rendered correctly.

In general React-Async is tricky to use right due to nested functions, and signifcant care should be used when developing components that need data.
Try to pass down data if possible rather than fetching in two places. 
When you do need to fetch data, fetch as much data as possible at once. 
Not only does this improve performance, it also is easier to write.

### React forms with Formik and React Bootstrap

Creating forms with custom functionality in React is a tedious and error prone process, especially as we add more features.
We want all of the following features:
* Render [controlled components]( https://reactjs.org/docs/forms.html ) 
  * In a nutshell, controlled components are components that store all of their state in React, not in the browser.
* Validate responses client side
  * Security Note: All user submitted data must be filtered server side if it is to have any measure of security.
  * Client side validation is primarily there to provide feedback to the user, and not as a security measure.
* After recieving response, provide feedback to user
  * If the server found any errors with a specific field, we must provide relevant feedback in the correct field.
    * An example is telling the user that their username is taken after a registration attempt. 
    * It's preferrable UX wise to highlight only the username field rather than the whole form.

Unlike React-Async, it is possible to do this with sanely with pure React. 
However, it can get tedious, so in order to automate out many of the repetitive aspects, we use Formik ([documentation]( https://formik.org/docs/overview )).
We are also using React-Bootstrap's form components to help us reduce boilerplate. ([documentation]( https://react-bootstrap.github.io/components/forms/ ))
Let's look at an annotated real example: [Login.tsx](./src/components/Login.tsx):

```tsx
import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Button, Form, } from 'react-bootstrap'
import { ApiKey, apiKeyNewValid, } from '@innexgo/frontend-auth-api';
import { isErr } from '@innexgo/frontend-common';


// onSuccess is a callback that will be run once the user has successfully logged in.
// In general, the onSuccess callback should make sure to hide the form so that the 
// user doesn't accidentally double submit.
interface LoginProps {
  onSuccess: (apiKey: ApiKey) => void
}

function Login(props: LoginProps) {

  // This represents the state stored in the form. 
  // Note that fields don't just have to be strings. 
  // You could use numbers, booleans, or more complex objects if you wanted.
  type LoginValue = {
    email: string,
    password: string,
  }

  // onSubmit is a callback that will be run once the user submits their form.

  // here, we're making use of JavaScript's destructuring assignment: 
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
  const onSubmit = async (values: LoginValue, { setStatus, setErrors }: FormikHelpers<LoginValue>) => {
    // Validate input


    // we start off by assuming no errors
    let errors: FormikErrors<LoginValue> = {};
    let hasError = false;
    if (values.email === "") {
      errors.email = "Please enter your email";
      hasError = true;
    }
    if (values.password === "") {
      errors.password = "Please enter your password";
      hasError = true;
    }

    // bail early if we have hit any errors
    if (hasError) {
      // setErrors is a Formik function that automatically sets errors on the correct fields
      setErrors(errors);
      return;
    }

    // we make our request here
    const maybeApiKey = await apiKeyNewValid({
      userEmail: values.email,
      userPassword: values.password,
      duration: 5 * 60 * 60 * 1000
    });

    // check if the operation was successful
    if (isErr(maybeApiKey)) {
      // otherwise display errors
      switch (maybeApiKey.Err) {
        case "USER_NONEXISTENT": {
          setErrors({
            email: "No such user exists"
          });
          break;
        }
        case "PASSWORD_INCORRECT": {
          setErrors({
            password: "Your password is incorrect"
          });
          break;
        }
        default: {
          // Status is like the global error field of the form. 
          // Only use it when dealing with unknown kinds of errors, 
          // or errors that don't really fit on a single field.
          setStatus("An unknown or network error has occured while trying to log you in");
          break;
        }
      }
      return;
    }

    // on success execute callBack
    props.onSuccess(maybeApiKey.Ok);
  }

  // Notice how Formik is a Generic component that does type checking
  // This helps ensure we make fewer mistakes
  return <>
    <Formik<LoginValue>
      onSubmit={onSubmit}
      initialStatus=""
      initialValues={{
        // these are the default values the form will start with
        email: "",
        password: "",
      }}
    >
      {(fprops) => (
        /* we enable noValidate so that we can delegate validation to Formik */
        /* onSubmit={fprops.handleSubmit} means that Formik will handle form submission */
        <Form
          noValidate
          onSubmit={fprops.handleSubmit}>
          {/* Use Bootstrap's Form.Group in order to recieve a consistently styled texbox */}
          <Form.Group>
            <Form.Label>Email</Form.Label>
            {/* When making a form, the `type` prop should usually be "text" */}
            {/* unless its an email address or a password */}
            <Form.Control
              name="email"
              type="email"
              placeholder="Email"
              value={fprops.values.email}
              onChange={fprops.handleChange}
              isInvalid={!!fprops.errors.email}
            />
            {/* Feedback fields aren't usually displayed unless we called `setError` in `onSubmit` */}
            <Form.Control.Feedback type="invalid"> {fprops.errors.email} </Form.Control.Feedback>
          </Form.Group>
          <Form.Group >
            <Form.Label>Password</Form.Label>
            <Form.Control
              name="password"
              type="password"
              placeholder="Password"
              value={fprops.values.password}
              onChange={fprops.handleChange}
              isInvalid={!!fprops.errors.password}
            />
            <Form.Control.Feedback type="invalid">{fprops.errors.password}</Form.Control.Feedback>
          </Form.Group>
          <br />
          {/* Hitting this button will submit the form. */}
          {/* Submitting the form will submit the Formik form, which will call onSubmit. */}
          {/* If the operation was successful, props.onSuccess will be called */}
          {/* If it wasn't successful, errors will be set. */}
          <Button type="submit">Login</Button>
          <br />
          {/* This is where the status text will be displayed */}
          <Form.Text className="text-danger">{fprops.status}</Form.Text>
          <br />
          <Form.Text>
            <a href="/forgot_password">Forgot Password?</a>
          </Form.Text>
        </Form>
      )}
    </Formik>
  </>
}

export default Login;
```
