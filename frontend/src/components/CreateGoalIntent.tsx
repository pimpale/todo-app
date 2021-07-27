import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Form } from "react-bootstrap";
import { goalIntentNew,GoalIntentData } from "../utils/utils";
import { ApiKey } from '@innexgo/frontend-auth-api';
import { isErr } from '@innexgo/frontend-common';


type CreateGoalIntentProps = {
  apiKey: ApiKey;
  postSubmit: (gid:GoalIntentData) => void;
}

function CreateGoalIntent(props: CreateGoalIntentProps) {
  type CreateGoalIntentValue = {
    name: string,
  }

  const onSubmit = async (values: CreateGoalIntentValue,
    fprops: FormikHelpers<CreateGoalIntentValue>) => {

    let errors: FormikErrors<CreateGoalIntentValue> = {};

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

    let maybeGoalIntentData = await goalIntentNew({
      name: values.name,
      apiKey: props.apiKey.key,
    })

    if (isErr(maybeGoalIntentData)) {
      switch (maybeGoalIntentData.Err) {
        case "UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while trying to create goalIntent.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    // clear input
    fprops.setFieldValue('name', '');
    // execute callback
    props.postSubmit(maybeGoalIntentData.Ok);
  }


  return <>
    <Formik<CreateGoalIntentValue>
      onSubmit={onSubmit}
      initialValues={{
        name: "",
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
          <Form.Control
            name="name"
            type="text"
            placeholder="Goal Name"
            as="input"
            value={fprops.values.name}
            onChange={e => fprops.setFieldValue('name', e.target.value)}
            isInvalid={!!fprops.errors.name}
          />
          <Form.Control.Feedback type="invalid">{fprops.errors.name}</Form.Control.Feedback>
          <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      </>}
    </Formik>
  </>
}

export default CreateGoalIntent;
