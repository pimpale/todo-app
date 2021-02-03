import React from 'react';
import { Button, Form } from 'react-bootstrap'
import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { newVerificationChallenge, isApiErrorCode, isPasswordValid } from '../utils/utils';

type RegisterFormProps = {
  onSuccess: () => void
}

function RegisterForm(props: RegisterFormProps) {

  type RegistrationValue = {
    name: string,
    email: string,
    password1: string,
    password2: string,
    terms: boolean,
  }

  const onSubmit = async (values: RegistrationValue, fprops: FormikHelpers<RegistrationValue>) => {
    // Validate input
    let errors: FormikErrors<RegistrationValue> = {};
    let hasError = false;
    if (values.name === "") {
      errors.name = "Please enter what you'd like us to call you.";
      hasError = true;
    }
    if (!values.email.includes("@")) {
      errors.email = "Please enter your email";
      hasError = true;
    }
    if (!isPasswordValid(values.password1)) {
      errors.password1 = "Password must have at least 8 chars and 1 number";
      hasError = true;
    }
    if (values.password2 !== values.password1) {
      errors.password2 = "Password does not match";
      hasError = true;
    }
    if (!values.terms) {
      errors.terms = "You must agree to the terms and conditions";
      hasError = true;
    }

    fprops.setErrors(errors);
    if (hasError) {
      return;
    }

    const maybeVerificationChallenge = newVerificationChallenge({
      userName: values.name,
      userEmail: values.email,
      userPassword: values.password1,
    });

    if (isApiErrorCode(maybeVerificationChallenge)) {
      // otherwise display errors
      switch (maybeVerificationChallenge) {
        case "USER_EMAIL_EMPTY": {
          fprops.setErrors({
            email: "No such user exists"
          });
          break;
        }
        case "USER_NAME_EMPTY": {
          fprops.setErrors({
            name: "Please enter what you'd like us to call you."
          });
          break;
        }
        case "USER_EXISTENT": {
          fprops.setErrors({
            email: "A user with this email already exists."
          });
          break;
        }
        case "PASSWORD_INSECURE": {
          fprops.setErrors({
            password1: "Password is of insufficient complexity"
          });
          break;
        }
        case "EMAIL_RATELIMIT": {
          fprops.setErrors({
            email: "Please wait 5 minutes before sending another email."
          });
          break;
        }
        case "EMAIL_BLACKLISTED": {
          fprops.setErrors({
            email: "This email address is not permitted to make an account."
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureMessage: "An unknown or network error has occured while trying to register.",
            successMessage: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureMessage: "",
      successMessage: "We've sent an email to verify your address."
    });
    // execute callback
    props.onSuccess();
  }
  const normalizeInput = (e: string) => e.replace(/[^A-Za-z0-9]+/g, "");

  return (
    <Formik
      onSubmit={onSubmit}
      initialStatus={{
        failureMessage: "",
        successMessage: "",
      }}
      initialValues={{
        name: "",
        email: "",
        password1: "",
        password2: "",
        terms: false,
      }}
    >
      {(fprops) => <>
        <Form
          noValidate
          onSubmit={fprops.handleSubmit} >
          <div hidden={fprops.status.successMessage !== ""}>
            <Form.Group >
              <Form.Label >Name</Form.Label>
              <Form.Control
                name="name"
                type="text"
                placeholder="Name"
                value={fprops.values.name}
                onChange={e => fprops.setFieldValue("name", normalizeInput(e.target.value))}
                isInvalid={!!fprops.errors.name}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group >
              <Form.Label >Email</Form.Label>
              <Form.Control
                name="email"
                type="email"
                placeholder="Email"
                value={fprops.values.email}
                onChange={fprops.handleChange}
                isInvalid={!!fprops.errors.email}
              />
              <Form.Control.Feedback type="invalid"> {fprops.errors.email} </Form.Control.Feedback>
            </Form.Group>
            <Form.Group >
              <Form.Label >Password</Form.Label>
              <Form.Control
                name="password1"
                type="password"
                placeholder="Password"
                value={fprops.values.password1}
                onChange={fprops.handleChange}
                isInvalid={!!fprops.errors.password1}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.password1}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group >
              <Form.Label >Confirm Password</Form.Label>
              <Form.Control
                name="password2"
                type="password"
                placeholder="Confirm Password"
                value={fprops.values.password2}
                onChange={fprops.handleChange}
                isInvalid={!!fprops.errors.password2}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.password2}</Form.Control.Feedback>
            </Form.Group>
            <Form.Check>
              <Form.Check.Input
                name="terms"
                checked={fprops.values.terms}
                onChange={fprops.handleChange}
                isInvalid={!!fprops.errors.terms}
              />
              <Form.Check.Label> Agree to <a target="_blank" rel="noopener noreferrer"  href="/terms_of_service">terms of service</a></Form.Check.Label>
              <Form.Control.Feedback type="invalid">{fprops.errors.terms}</Form.Control.Feedback>
            </Form.Check>
            <br />
            <Button type="submit">Submit Form</Button>
            <br />
            <Form.Text className="text-danger">{fprops.status.failureMessage}</Form.Text>
          </div>
          <Form.Text className="text-success">{fprops.status.successMessage}</Form.Text>
        </Form>
      </>}
    </Formik>
  );
}

export default RegisterForm;
