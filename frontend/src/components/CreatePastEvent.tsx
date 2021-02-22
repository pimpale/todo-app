import React from "react"
import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Button, Form } from "react-bootstrap";
import { newPastEvent, isApiErrorCode } from "../utils/utils";


type CreatePastEventProps = {
  startTime: number;
  duration: number;
  apiKey: ApiKey;
  postSubmit: () => void;
}

function CreatePastEvent(props: CreatePastEventProps) {
  type CreatePastEventValue = {
    name: string,
    description: string,
    startTime: number,
    duration: number,
  }

  const onSubmit = async (values: CreatePastEventValue,
    fprops: FormikHelpers<CreatePastEventValue>) => {

    let errors: FormikErrors<CreatePastEventValue> = {};

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

    const maybePastEvent = await newPastEvent({
      name: values.name,
      description: values.description,
      startTime: values.startTime,
      duration: values.duration,
      apiKey: props.apiKey.key,
    });

    if (isApiErrorCode(maybePastEvent)) {
      switch (maybePastEvent) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while trying to create pastEvent.",
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
    <Formik<CreatePastEventValue>
      onSubmit={onSubmit}
      initialValues={{
        name: "",
        description: "",
        startTime: props.startTime,
        duration: props.duration
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
            <Form.Group >
              <Form.Label>PastEvent Name</Form.Label>
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
            <Form.Group >
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
            <Button type="submit">Submit Form</Button>
            <br />
            <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          </div>
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      </>}
    </Formik>
  </>
}

export default CreatePastEvent;
