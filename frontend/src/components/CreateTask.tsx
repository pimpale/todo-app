import React from "react"
import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Button, Form } from "react-bootstrap";
import { newGoal, newTimeUtilityFunction, TimeUtilityFunctionPointProps, newTask, isApiErrorCode } from "../utils/utils";


type CreateTaskProps = {
  startTime: number;
  duration: number;
  apiKey: ApiKey;
  postSubmit: () => void;
}

function CreateTask(props: CreateTaskProps) {
  type CreateTaskValue = {
    name: string,
    description: string,
    startTime: number,
    duration: number,
    timeUtilityFunctionPoints:TimeUtilityFunctionPointProps[]
  }

  const onSubmit = async (values: CreateTaskValue,
    fprops: FormikHelpers<CreateTaskValue>) => {

    let errors: FormikErrors<CreateTaskValue> = {};

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

    const maybeTimeUtilFunction = await newTimeUtilityFunction({
      points: values.timeUtilityFunctionPoints,
      apiKey: props.apiKey.key,
    })

    if (isApiErrorCode(maybeTimeUtilFunction)) {
      switch (maybeTimeUtilFunction) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "TIME_UTILITY_FUNCTION_NOT_VALID": {
          fprops.setErrors({
            timeUtilityFunctionPoints: "Function is invalid."
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while trying to create utility function.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    const maybeGoalData = await newGoal({
      name: values.name,
      description: values.description,
      duration: values.duration,
      timeUtilityFunctionId: maybeTimeUtilFunction.timeUtilityFunctionId,
      apiKey: props.apiKey.key,
    });

    if(isApiErrorCode(maybeGoalData)) {
      switch (maybeGoalData) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while trying to create goal.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    const maybeTask = await newTask({
      goalId: maybeGoalData.goal.goalId,
      startTime: values.startTime,
      duration: values.duration,
      apiKey: props.apiKey.key,
      status: "VALID"
    });

    if (isApiErrorCode(maybeTask)) {
      switch (maybeTask) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while trying to create task.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "Task Created"
    });
    // execute callback
    props.postSubmit();
  }

  return <>
    <Formik<CreateTaskValue>
      onSubmit={onSubmit}
      initialValues={{
        name: "",
        description: "",
        startTime: props.startTime,
        duration: props.duration,
        timeUtilityFunctionPoints: [],
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
              <Form.Label>Task Name</Form.Label>
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

export default CreateTask;
