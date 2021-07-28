import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Form } from "react-bootstrap";
import { goalIntentNew, GoalIntentData } from "../utils/utils";
import { ApiKey } from '@innexgo/frontend-auth-api';
import { isErr } from '@innexgo/frontend-common';
import winkNlp from 'wink-nlp';
import model from 'wink-eng-lite-web-model';

const nlp = winkNlp(model);
const doc = nlp.readDoc("once upon a time, there was a thing");
const its = nlp.its;
const as = nlp.as;

type CreateHybridGoalProps = {
  apiKey: ApiKey;
  postSubmit: (gid: GoalIntentData) => void;
}


function CreateHybridGoal(props: CreateHybridGoalProps) {

  let q = doc.tokens().out(its.contractionFlag, as.bigrams);

  console.log(q);


  type CreateHybridGoalValue = {
    name: string,
  }

  const onSubmit = async (values: CreateHybridGoalValue,
    fprops: FormikHelpers<CreateHybridGoalValue>) => {

    let errors: FormikErrors<CreateHybridGoalValue> = {};

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
            failureResult: "An unknown or network error has occured while trying to create goal intent.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    // clear input
    fprops.setFieldValue("name", "");
    // execute callback
    props.postSubmit(maybeGoalIntentData.Ok);
  }


  return <>
    <Formik<CreateHybridGoalValue>
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

export default CreateHybridGoal;
