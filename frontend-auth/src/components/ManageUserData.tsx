import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Button, Form, } from 'react-bootstrap'
import {isErr} from '@innexgo/frontend-common';
import { ApiKey, UserData, userDataNew, } from '@innexgo/frontend-auth-api';

interface ManageUserDataProps {
  apiKey: ApiKey,
  onSuccess: (ud:UserData) => void
}

function ManageUserData(props: ManageUserDataProps) {
  type ManageUserDataValue = {
    name: string,
  }

  const onSubmit = async (values: ManageUserDataValue, { setStatus, setErrors }: FormikHelpers<ManageUserDataValue>) => {
    // Validate input
    let errors: FormikErrors<ManageUserDataValue> = {};
    let hasError = false;
    if (values.name === "") {
      errors.name = "Name must not be empty";
      hasError = true;
    }
    setErrors(errors);
    if (hasError) {
      return;
    }

    const maybeUserData = await userDataNew({
      userName: values.name,
      apiKey: props.apiKey.key,
    });

    if (isErr(maybeUserData)) {
      switch (maybeUserData.Err) {
        case "API_KEY_UNAUTHORIZED": {
          setStatus({
            failureMessage: "Please log back in and try again",
            successMessage: ""
          });
          break;
        }
        default: {
          setStatus({
            failureMessage: "An unknown or network error has occured while trying to change name.",
            successMessage: ""
          });
          break;
        }
      }
    } else {
      setStatus({
        failureMessage: "",
        successMessage: "Name successfully changed."
      });

      props.onSuccess(maybeUserData.Ok);
    }
  }
  return <>
    <Formik<ManageUserDataValue>
      onSubmit={onSubmit}
      initialStatus={{
        successMessage: "",
        failureMessage: "",
      }}
      initialValues={{
        name: "",
      }}
    >
      {(props) => (
        <Form
          noValidate
          onSubmit={props.handleSubmit} >
          <Form.Group >
            <Form.Label >Name</Form.Label>
            <Form.Control
              name="name"
              placeholder="Name"
              value={props.values.name}
              onChange={props.handleChange}
              isInvalid={!!props.errors.name}
            />
            <Form.Control.Feedback type="invalid">{props.errors.name}</Form.Control.Feedback>
          </Form.Group>
          <br />
          <Button type="submit">Change Name</Button>
          <br />
          <Form.Text className="text-danger">{props.status.failureMessage}</Form.Text>
          <Form.Text className="text-success">{props.status.successMessage}</Form.Text>
        </Form>
      )}
    </Formik>
  </>
}

export default ManageUserData;
