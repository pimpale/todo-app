import { Button, Form } from 'react-bootstrap'
import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { userNew } from '@innexgo/frontend-auth-api';
import { isErr } from '@innexgo/frontend-common';

type RegisterFormProps = {
  onSuccess: () => void
}

function RegisterForm(props: RegisterFormProps) {

  type RegistrationValue = {
    name: string,
    email: string,
    password1: string,
    password2: string,
    // whether the olderThan13 is altered
    touchedAge: boolean,
    olderThan13: boolean,
    parentEmail: string,
    terms: boolean,
  }

  const onSubmit = async (values: RegistrationValue, fprops: FormikHelpers<RegistrationValue>) => {
    // Validate input
    let errors: FormikErrors<RegistrationValue> = {};
    let hasError = false;
    if (values.name === "") {
      errors.name = "Please enter what you'd like us to call you";
      hasError = true;
    }
    if (!values.email.includes("@")) {
      errors.email = "Please enter your email";
      hasError = true;
    }
    if (values.password2 !== values.password1) {
      errors.password2 = "Password does not match";
      hasError = true;
    }
    if (!values.touchedAge) {
      errors.olderThan13 = "Please pick an option";
      hasError = true;
    }

    if (!values.olderThan13 && !values.parentEmail.includes("@")) {
      errors.parentEmail = "Please enter a parent email";
      hasError = true;
    }

    if(values.parentEmail === values.email) {
      errors.parentEmail = "Parent email must be different from your email";
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

    const maybeUserData = await userNew({
      userName: values.name,
      userPassword: values.password1,
      userEmail: values.email,
      parentEmail: values.olderThan13 ? undefined : values.parentEmail
    });

    if (isErr(maybeUserData)) {
      // otherwise display errors
      switch (maybeUserData.Err) {
        case "USER_EMAIL_EMPTY": {
          fprops.setErrors({
            name: "Please enter your email."
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
            password1: "Password must have at least 8 chars and 1 number"
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
        touchedAge: false,
        olderThan13: true,
        parentEmail: ""
      }}
    >
      {(fprops) => <>
        <Form
          noValidate
          onSubmit={fprops.handleSubmit} >
          <div hidden={fprops.status.successMessage !== ""}>
            <Form.Group className="mb-3">
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
            <Form.Group className="mb-3">
              <Form.Label >Email</Form.Label>
              <Form.Control
                name="email"
                type="email"
                placeholder="Email"
                value={fprops.values.email}
                onChange={fprops.handleChange}
                isInvalid={!!fprops.errors.email}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.email}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
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
            <Form.Group className="mb-3">
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
            <Form.Group className="mb-3">
              <Form.Check className="form-check">
                <Form.Check.Input
                  type="radio"
                  name="olderThan13"
                  isInvalid={!!fprops.errors.olderThan13}
                  onChange={() => {
                    fprops.setFieldValue('olderThan13', false);
                    fprops.setFieldValue('touchedAge', true)
                  }}
                />
                <Form.Check.Label>I am younger than 13</Form.Check.Label>
              </Form.Check>
              <Form.Check className="form-check">
                <Form.Check.Input
                  type="radio"
                  name="olderThan13"
                  isInvalid={!!fprops.errors.olderThan13}
                  onChange={() => {
                    fprops.setFieldValue('olderThan13', true);
                    fprops.setFieldValue('touchedAge', true)
                  }}
                />
                <Form.Check.Label>I am older than 13</Form.Check.Label>
                <Form.Control.Feedback type="invalid">{fprops.errors.olderThan13}</Form.Control.Feedback>
              </Form.Check>
            </Form.Group>
            <Form.Group hidden={fprops.values.olderThan13} className="mb-3">
              <Form.Label>Parent Email</Form.Label>
              <Form.Control
                name="parentEmail"
                type="email"
                placeholder="Parent Email"
                value={fprops.values.parentEmail}
                onChange={fprops.handleChange}
                isInvalid={!!fprops.errors.parentEmail}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.parentEmail}</Form.Control.Feedback>
            </Form.Group>
            <Form.Check className="mb-3 form-check">
              <Form.Check.Input
                name="terms"
                checked={fprops.values.terms}
                onChange={fprops.handleChange}
                isInvalid={!!fprops.errors.terms}
              />
              <Form.Check.Label>Agree to <a target="_blank" rel="noopener noreferrer" href="/terms_of_service">terms of service</a></Form.Check.Label>
              <Form.Control.Feedback type="invalid">{fprops.errors.terms}</Form.Control.Feedback>
            </Form.Check>
            <br />
            <Button type="submit">Submit Form</Button>
            <Form.Group>
              <Form.Text className="text-danger">{fprops.status.failureMessage}</Form.Text>
            </Form.Group>
          </div>
          <Form.Text className="text-success">{fprops.status.successMessage}</Form.Text>
        </Form>
      </>}
    </Formik>
  );
}

export default RegisterForm;
