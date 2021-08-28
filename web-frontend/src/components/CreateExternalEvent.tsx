import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Button, Form } from "react-bootstrap";
import { externalEventNew} from "@innexgo/frontend-todo-app-api";
import {ApiKey } from '@innexgo/frontend-auth-api';


import {isErr} from '@innexgo/frontend-common';


type CreateExternalEventProps = {
  startTime: number;
  endTime: number;
  apiKey: ApiKey;
  postSubmit: () => void;
}

function CreateExternalEvent(props: CreateExternalEventProps) {
  type CreateExternalEventValue = {
    name: string,
    description: string,
    startTime: number,
    endTime: number,
  }

  const onSubmit = async (values: CreateExternalEventValue,
    fprops: FormikHelpers<CreateExternalEventValue>) => {

    let errors: FormikErrors<CreateExternalEventValue> = {};

    // Validate input

    let hasError = false;
    if (values.name === "") {
      errors.name = "Please enter an event name";
      hasError = true;
    }

    fprops.setErrors(errors);
    if (hasError) {
      return;
    }

    const maybeExternalEvent = await externalEventNew({
      name: values.name,
      startTime: values.startTime,
      endTime: values.endTime,
      apiKey: props.apiKey.key,
    });

    if (isErr(maybeExternalEvent)) {
      switch (maybeExternalEvent.Err) {
        case "UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "Unable to authenticate. Please relogin.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while trying to create externalEvent.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "Event Created"
    });
    // execute callback
    props.postSubmit();
  }

  return <>
    <Formik<CreateExternalEventValue>
      onSubmit={onSubmit}
      initialValues={{
        name: "",
        description: "",
        startTime: props.startTime,
        endTime: props.endTime
      }}
      initialStatus={{
        failureResult: "",
        successResult: ""
      }}
    >
      {(fprops) => <>
        <Form
          noValidate
          onSubmit={fprops.handleSubmit} >
          <div hidden={fprops.status.successResult !== ""}>
            <Form.Group className="mb-3">
              <Form.Label>ExternalEvent Name</Form.Label>
              <Form.Control
                name="name"
                type="text"
                placeholder="Event Name"
                as="input"
                value={fprops.values.name}
                onChange={e => fprops.setFieldValue("name", e.target.value)}
                isInvalid={!!fprops.errors.name}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                name="description"
                type="text"
                placeholder="Description"
                as="input"
                value={fprops.values.description}
                onChange={e => fprops.setFieldValue("description", e.target.value)}
                isInvalid={!!fprops.errors.description}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.description}</Form.Control.Feedback>
            </Form.Group>
            <Button type="submit" className="mb-3">Submit Form</Button>
            <br />
            <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          </div>
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      </>}
    </Formik>
  </>
}

export default CreateExternalEvent;
