import React from 'react';
import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Card, Button, Form, } from 'react-bootstrap'
import { passwordNewReset, } from '@innexgo/frontend-auth-api';
import { isErr } from '@innexgo/frontend-common';
import { SimpleLayout, BrandedComponentProps } from '@innexgo/common-react-components';

interface ResetPasswordProps {
  resetKey: string,
  onSuccess: () => void
}

function ResetPasswordForm(props: ResetPasswordProps) {
  type ResetPasswordValue = {
    password1: string,
    password2: string,
  }

  const onSubmit = async (values: ResetPasswordValue, { setStatus, setErrors }: FormikHelpers<ResetPasswordValue>) => {
    // Validate input
    let errors: FormikErrors<ResetPasswordValue> = {};
    let hasError = false;
    if (values.password2 !== values.password1) {
      errors.password2 = "Password does not match.";
      hasError = true;
    }
    setErrors(errors);
    if (hasError) {
      return;
    }

    const passwordResetResult = await passwordNewReset({
      passwordResetKey: props.resetKey,
      newPassword: values.password1,
    });
    if (isErr(passwordResetResult)) {
      switch (passwordResetResult.Err) {
        case "PASSWORD_RESET_NONEXISTENT": {
          setStatus({
            failureMessage: "Invalid password reset link.",
            successMessage: ""
          });
          break;
        }
        case "PASSWORD_RESET_TIMED_OUT": {
          setStatus({
            failureMessage: "Password reset link timed out.",
            successMessage: ""
          });
          break;
        }
        case "PASSWORD_EXISTENT": {
          setStatus({
            failureMessage: "Password reset link may only be used once.",
            successMessage: ""
          });
          break;
        }
        case "PASSWORD_INSECURE": {
          setErrors({
            password1: "Password must have at least 8 chars and 1 number"
          });
          break;
        }
        default: {
          setStatus({
            failureMessage: "An unknown or network error has occured while trying to reset password.",
            successMessage: ""
          });
          break;
        }
      }
    } else {
      setStatus({
        failureMessage: "",
        successMessage: "Password successfully changed."
      });
      props.onSuccess();
    }
  }
  return <>
    <Formik<ResetPasswordValue>
      onSubmit={onSubmit}
      initialStatus={{
        successMessage: "",
        failureMessage: "",
      }}
      initialValues={{
        password1: "",
        password2: "",
      }}
    >
      {(props) => (
        <Form
          noValidate
          onSubmit={props.handleSubmit} >
          <Form.Group className="mb-3">
            <Form.Label >New Password</Form.Label>
            <Form.Control
              name="password1"
              type="password"
              placeholder="New Password"
              value={props.values.password1}
              onChange={props.handleChange}
              isInvalid={!!props.errors.password1}
            />
            <Form.Control.Feedback type="invalid"> {props.errors.password1} </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              name="password2"
              type="password"
              placeholder="Confirm Password"
              value={props.values.password2}
              onChange={props.handleChange}
              isInvalid={!!props.errors.password2}
            />
            <Form.Control.Feedback type="invalid">{props.errors.password2}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Button type="submit">Reset Password</Button>
          </Form.Group >
          <Form.Group className="mb-3">
            <Form.Text className="text-danger">{props.status.failureMessage}</Form.Text>
            <Form.Text className="text-success">{props.status.successMessage}</Form.Text>
          </Form.Group>
        </Form>
      )}
    </Formik>
  </>
}

function ResetPassword(props: BrandedComponentProps) {
  // get password reset key from url
  const resetKey = (new URLSearchParams(window.location.search).get("resetKey") ?? "").replace(' ', '+');
  const [successful, setSuccess] = React.useState(false);
  return <SimpleLayout branding={props.branding}>
    <div className="h-100 w-100 d-flex">
      <Card className="mx-auto my-auto">
        <Card.Body>
          <Card.Title>Reset Password</Card.Title>
          {successful
            ? <Form.Text className="text-success">Password changed successfully</Form.Text>
            : <ResetPasswordForm resetKey={resetKey} onSuccess={() => setSuccess(true)} />
          }
        </Card.Body>
      </Card>
    </div>
  </SimpleLayout>
}

export default ResetPassword;
