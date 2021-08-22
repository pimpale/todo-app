import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Button, Form, } from 'react-bootstrap'
import { ApiKey, Password, passwordNewChange } from '@innexgo/frontend-auth-api';
import { isErr } from '@innexgo/frontend-common';

interface ManagePasswordProps {
  apiKey: ApiKey,
  onSuccess: (p: Password) => void
}

function ManagePassword(props: ManagePasswordProps) {
  type ManagePasswordValue = {
    oldpassword: string,
    password1: string,
    password2: string,
  }

  const onSubmit = async (values: ManagePasswordValue, { setStatus, setErrors }: FormikHelpers<ManagePasswordValue>) => {
    // Validate input
    let errors: FormikErrors<ManagePasswordValue> = {};
    let hasError = false;
    if (values.password2 !== values.password1) {
      errors.password2 = "Password does not match.";
      hasError = true;
    }
    setErrors(errors);
    if (hasError) {
      return;
    }

    const passwordChangeResult = await passwordNewChange({
      oldPassword: values.oldpassword,
      newPassword: values.password1,
      apiKey: props.apiKey.key,
    });
    if (isErr(passwordChangeResult)) {
      switch (passwordChangeResult.Err) {
        case "API_KEY_UNAUTHORIZED": {
          setStatus({
            failureMessage: "Please log back in and try again",
            successMessage: ""
          });
          break;
        }
        case "PASSWORD_CANNOT_CREATE_FOR_OTHERS": {
          setStatus({
            failureMessage: "You may only change your own password",
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

      props.onSuccess(passwordChangeResult.Ok);
    }
  }
  return <>
    <Formik<ManagePasswordValue>
      onSubmit={onSubmit}
      initialStatus={{
        successMessage: "",
        failureMessage: "",
      }}
      initialValues={{
        oldpassword: "",
        password1: "",
        password2: "",
      }}
    >
      {(props) => (
        <Form
          noValidate
          onSubmit={props.handleSubmit} >
          <Form.Group className="mb-3">
            <Form.Label >Old Password</Form.Label>
            <Form.Control
              name="oldpassword"
              type="password"
              placeholder="Old Password"
              value={props.values.oldpassword}
              onChange={props.handleChange}
              isInvalid={!!props.errors.password1}
            />
            <Form.Control.Feedback type="invalid"> {props.errors.oldpassword} </Form.Control.Feedback>
          </Form.Group>
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
            <Button type="submit">Change Password</Button>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Text className="text-danger">{props.status.failureMessage}</Form.Text>
            <Form.Text className="text-success">{props.status.successMessage}</Form.Text>
          </Form.Group>
        </Form>
      )}
    </Formik>
  </>
}

export default ManagePassword;
