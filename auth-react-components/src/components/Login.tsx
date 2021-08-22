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

    // setErrors is a Formik function that automatically sets errors on the correct fields
    setErrors(errors);

    // bail early if we have hit any errors
    if (hasError) {
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
          <Form.Group className="mb-3">
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
          <Form.Group className="mb-3">
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
          {/* Hitting this button will submit the form. */}
          {/* Submitting the form will submit the Formik form, which will call onSubmit. */}
          {/* If the operation was successful, props.onSuccess will be called */}
          {/* If it wasn't successful, errors will be set. */}
          <Button type="submit" className="mb-3">Login</Button>
          {/* This is where the status text will be displayed */}
          <Form.Text className="text-danger mb-3">{fprops.status}</Form.Text>
          <Form.Group className="mb-3">
            <Form.Text>
              <a href="/forgot_password">Forgot Password?</a>
            </Form.Text>
          </Form.Group>
        </Form>
      )}
    </Formik>
  </>
}

export default Login;
