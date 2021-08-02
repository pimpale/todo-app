import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Form } from "react-bootstrap";
import { goalTemplateNew, userGeneratedCodeNew } from "../utils/utils";
import { TemplateData } from '../components/ManageGoalTemplate';
import { ApiKey } from '@innexgo/frontend-auth-api';
import { isErr, unwrap } from '@innexgo/frontend-common';

type CreateGoalTemplateProps = {
  apiKey: ApiKey;
  postSubmit: (data: TemplateData) => void;
}

function CreateGoalTemplate(props: CreateGoalTemplateProps) {
  type CreateGoalTemplateValue = {
    name: string,
    abstract: boolean,
    durationEstimate: string,
  }

  const onSubmit = async (values: CreateGoalTemplateValue,
    fprops: FormikHelpers<CreateGoalTemplateValue>) => {

    let errors: FormikErrors<CreateGoalTemplateValue> = {};

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

    let userGeneratedCode = await userGeneratedCodeNew({
      sourceLang: "test",
      sourceCode: "test",
      wasmCache: [],
      apiKey: props.apiKey.key
    })
      .then(unwrap);

    let maybeGoalTemplateData = await goalTemplateNew({
      name: values.name,
      durationEstimate: undefined,
      userGeneratedCodeId: userGeneratedCode.userGeneratedCodeId,
      apiKey: props.apiKey.key,
    })

    if (isErr(maybeGoalTemplateData)) {
      switch (maybeGoalTemplateData.Err) {
        case "UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while trying to create goalTemplate.",
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
    props.postSubmit({ gtd: maybeGoalTemplateData.Ok, gtp: [] });
  }


  return <>
    <Formik<CreateGoalTemplateValue>
      onSubmit={onSubmit}
      initialValues={{
        name: "",
        abstract: false,
        durationEstimate: "30 minutes",
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

export default CreateGoalTemplate;
