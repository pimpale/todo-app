import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Form, Button } from "react-bootstrap";
import { goalTemplateNew, goalTemplatePatternNew, userGeneratedCodeNew } from "@innexgo/frontend-todo-app-api";
import { TemplateData } from '../components/ManageGoalTemplate';
import { ApiKey } from '@innexgo/frontend-auth-api';
import { isErr, unwrap } from '@innexgo/frontend-common';

import update from 'immutability-helper';
import ChipInput from '../components/ChipInput';
import parseDuration from 'parse-duration';

type CreateGoalTemplateProps = {
  apiKey: ApiKey;
  postSubmit: (data: TemplateData) => void;
}

function CreateGoalTemplate(props: CreateGoalTemplateProps) {
  type CreateGoalTemplateValue = {
    name: string,
    utility: string,
    abstract: boolean,
    durationEstimate: string,
    patterns: string[]
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

    if (parseInt(values.utility) === NaN) {
      errors.name = "Couldn't parse Utility";
      hasError = true;
    }
    let durationEstimate: number | undefined;

    if (values.abstract) {
      durationEstimate = undefined;
    } else {
      const ret = parseDuration(values.durationEstimate);
      if (ret === null) {
        errors.durationEstimate = "Couldn't parse duration";
        hasError = true;
      } else {
        durationEstimate = ret;
      }
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
      utility: parseInt(values.utility),
      durationEstimate,
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

    let goalTemplateData = maybeGoalTemplateData.Ok;

    let gtp = [];

    for (const pattern of values.patterns) {
      const goalTemplatePattern = await goalTemplatePatternNew({
        goalTemplateId: goalTemplateData.goalTemplate.goalTemplateId,
        pattern,
        active: true,
        apiKey: props.apiKey.key
      }).then(unwrap);

      gtp.push(goalTemplatePattern);
    }

    // clear input
    fprops.setFieldValue('name', '');
    // execute callback
    props.postSubmit({ gtd: goalTemplateData, gtp });
  }


  return <>
    <Formik<CreateGoalTemplateValue>
      onSubmit={onSubmit}
      initialValues={{
        name: "",
        utility: "30",
        abstract: false,
        durationEstimate: "30 minutes",
        patterns: [],
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
          <Form.Group className="mb-3">
            <Form.Label>Template Name</Form.Label>
            <Form.Control
              name="name"
              type="text"
              placeholder="Template Name"
              value={fprops.values.name}
              onChange={e => fprops.setFieldValue('name', e.target.value)}
              isInvalid={!!fprops.errors.name}
            />
            <Form.Control.Feedback type="invalid">{fprops.errors.name}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Goal Utility</Form.Label>
            <Form.Control
              name="utility"
              type="number"
              placeholder="Goal Utility"
              value={fprops.values.utility}
              onChange={e => fprops.setFieldValue('utility', e.target.value)}
              isInvalid={!!fprops.errors.utility}
            />
            <Form.Control.Feedback type="invalid">{fprops.errors.utility}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check>
              <Form.Check.Input
                type="radio"
                name="abstract"
                checked={fprops.values.abstract}
                isInvalid={!!fprops.errors.abstract}
                onClick={() => {
                  fprops.setFieldValue('abstract', true);
                }}
              />
              <Form.Check.Label>Abstract Goal</Form.Check.Label>
            </Form.Check>
            <Form.Check>
              <Form.Check.Input
                type="radio"
                name="abstract"
                isInvalid={!!fprops.errors.abstract}
                checked={!fprops.values.abstract}
                onClick={() => {
                  fprops.setFieldValue('abstract', false);
                }}
              />
              <Form.Check.Label>Schedulable Goal</Form.Check.Label>
              <Form.Control.Feedback type="invalid">{fprops.errors.abstract}</Form.Control.Feedback>
            </Form.Check>
          </Form.Group>
          <Form.Group hidden={fprops.values.abstract} className="mb-3">
            <Form.Label>Duration Estimate</Form.Label>
            <Form.Control
              name="durationEstimate"
              type="text"
              placeholder="Duration Estimate"
              value={fprops.values.durationEstimate}
              onChange={fprops.handleChange}
              isInvalid={!!fprops.errors.durationEstimate}
            />
            <Form.Control.Feedback type="invalid">{fprops.errors.durationEstimate}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <ChipInput
              placeholder="Goal Patterns"
              chips={fprops.values.patterns}
              onSubmit={(value: string) => {
                fprops.setFieldValue('patterns', update(fprops.values.patterns, { $push: [value] }));
              }}
              onRemove={(index: number) => fprops.setFieldValue('patterns', fprops.values.patterns.filter((_, i) => i != index))}
            />
          </Form.Group>
          <Button type="submit">Submit</Button>
          <br/>
          <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      </>}
    </Formik>
  </>
}

export default CreateGoalTemplate;
