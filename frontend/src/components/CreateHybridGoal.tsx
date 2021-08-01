import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Form } from "react-bootstrap";
import { goalIntentNew, GoalIntentData, GoalTemplateData, GoalTemplatePattern, NamedEntityData, NamedEntityPattern } from "../utils/utils";
import { ApiKey } from '@innexgo/frontend-auth-api';
import { isErr, unwrap } from '@innexgo/frontend-common';
import winkNlp from 'wink-nlp';
import model from 'wink-eng-lite-web-model';

export type HybridNamedEntityData = {
  ned: NamedEntityData,
  nep: NamedEntityPattern[],
}

export type HybridGoalTemplateData = {
  gtd: GoalTemplateData,
  gtp: GoalTemplatePattern[],
}

type CreateHybridGoalProps = {
  apiKey: ApiKey;
  tags: HybridNamedEntityData[];
  templates: HybridGoalTemplateData[];
  postSubmit: (gid: GoalIntentData) => void;
}

function CreateHybridGoal(props: CreateHybridGoalProps) {

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

    // instantiate nlp
    let nlp = winkNlp(model);
    const its = nlp.its;

    nlp.learnCustomEntities(
      props.templates.map(x => ({
        name: `GoalTemplate:${x.gtd.goalTemplateDataId}`,
        patterns: x.gtp.map(x => x.pattern)
      }))
    );

    nlp.learnCustomEntities([
      {
        name: "before deadline",
        patterns: [
          "[by|before] [DATE|TIME]",
          "[by|before] [TIME] [DATE]",
          "[by|before] [DATE] [TIME]",
        ]
      },
      {
        name: "before goal",
        patterns: ["before [HASHTAG]",]
      },
      {
        name: "after goal",
        patterns: [
          "after [HASHTAG]",
        ]
      },
      {
        name: "child goal",
        patterns: [
          "for [HASHTAG]",
          "@[HASHTAG]",
        ]
      },
      {
        name: "interval",
        patterns: [
          "[DURATION|DATE|TIME]",
          "[TIME] [DATE]",
          "[DATE] [TIME]",
        ]
      }
    ]);

    let doc = nlp.readDoc(values.name);
    // recognize
    doc.customEntities().each(x => console.log(x.out(its.detail)));

    let maybeGoalIntentData = await goalIntentNew({
      name: values.name,
      apiKey: props.apiKey.key,
    });

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
