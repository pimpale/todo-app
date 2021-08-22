import React from 'react';
import { Formik, FormikHelpers } from 'formik'
import { Button, Card, Form, } from 'react-bootstrap'
import { passwordResetNew } from '@innexgo/frontend-auth-api';
import { isErr } from '@innexgo/frontend-common';
import { SimpleLayout, BrandedComponentProps } from '@innexgo/common-react-components';


type ForgotPasswordFormProps = {
  onSuccess: () => void;
}

function ForgotPasswordForm(props: ForgotPasswordFormProps) {

  type ForgotPasswordValue = {
    email: string,
  }

  const onSubmit = async (values: ForgotPasswordValue, { setErrors, setStatus }: FormikHelpers<ForgotPasswordValue>) => {
    // Validate input
    if (values.email === "") {
      setErrors({ email: "Please enter your email" });
      return;
    }

    // Now send request
    const maybePasswordResetKey = await passwordResetNew({
      userEmail: values.email
    });

    if (isErr(maybePasswordResetKey)) {
      switch (maybePasswordResetKey.Err) {
        case "USER_NONEXISTENT": {
          setErrors({ email: "No such user exists." });
          break;
        }
        case "EMAIL_BOUNCED": {
          setErrors({ email: "This email address is invalid." });
          break;
        }
        case "EMAIL_UNKNOWN": {
          setErrors({ email: "Unable to send mail to this address. Try again later." });
          break;
        }
        default: {
          setStatus({
            failureMessage: "An unknown or network error has occured while trying to reset the password.",
            successMessage: ""
          });
          break;
        }
      }
      return;
    } else {
      setStatus({
        failureMessage: "",
        successMessage: "A reset email has been sent."
      });
      props.onSuccess();
    }
  }

  return (
    <Formik
      onSubmit={onSubmit}
      initialValues={{
        email: "",
      }}
      initialStatus={{
        failureMessage: "",
        successMessage: ""
      }}
    >
      {(props) => (
        <Form
          noValidate
          onSubmit={props.handleSubmit} >
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              type="email"
              placeholder="Email"
              value={props.values.email}
              onChange={props.handleChange}
              isInvalid={!!props.errors.email}
            />
            <Form.Control.Feedback type="invalid"> {props.errors.email} </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Button type="submit">Submit</Button>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Text className="text-danger">{props.status.failureMessage}</Form.Text>
            <Form.Text className="text-success">{props.status.successMessage}</Form.Text>
          </Form.Group>
        </Form>
      )}
    </Formik>
  )
}

function ForgotPassword(props: BrandedComponentProps) {
  const [successful, setSuccess] = React.useState(false);
  return <SimpleLayout branding={props.branding}>
    <div className="h-100 w-100 d-flex">
      <Card className="mx-auto my-auto">
        <Card.Body>
          <Card.Title>Send Reset Password Email</Card.Title>
          {successful
            ? <Form.Text className="text-success">We've sent an email to reset your password.</Form.Text>
            : <ForgotPasswordForm onSuccess={() => setSuccess(true)} />
          }
        </Card.Body>
      </Card>
    </div>
  </SimpleLayout>
}

export default ForgotPassword;
