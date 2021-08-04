import React from 'react';
import update from 'immutability-helper';
import { Col, Row, Badge, Form, Button } from 'react-bootstrap';
import DisplayModal from '../components/DisplayModal';
import { GoalTemplateData, GoalTemplatePattern, goalTemplateDataNew, goalTemplatePatternNew } from '../utils/utils';
import { isErr, unwrap } from '@innexgo/frontend-common';
import { ApiKey } from '@innexgo/frontend-auth-api';
import { Edit, Cancel, } from '@material-ui/icons';
import { Formik, FormikHelpers, FormikErrors } from 'formik'
import parseDuration from 'parse-duration';
import formatDuration from 'date-fns/formatDuration';
import intervalToDuration from 'date-fns/intervalToDuration';
import ChipInput from '../components/ChipInput';

export type TemplateData = {
  gtd: GoalTemplateData,
  gtp: GoalTemplatePattern[],
}

type EditGoalTemplateProps = {
  data: TemplateData,
  setData: (td: TemplateData) => void,
  apiKey: ApiKey,
};

function EditGoalTemplate(props: EditGoalTemplateProps) {

  type EditGoalTemplateValue = {
    name: string,
    durationEstimate: string,
    abstract: boolean,
    patterns: string[],
  }

  const onSubmit = async (values: EditGoalTemplateValue,
    fprops: FormikHelpers<EditGoalTemplateValue>) => {

    let hasError = false;
    let errors: FormikErrors<EditGoalTemplateValue> = {};

    if (values.name === "") {
      errors.name = "Please enter an event name";
      hasError = true;
    }

    const durationEstimate = parseDuration(values.durationEstimate);

    if (durationEstimate === null || durationEstimate < 1) {
      errors.durationEstimate = "Invalid duration estimate";
      hasError = true;
    }

    fprops.setErrors(errors);
    if (hasError) {
      return;
    }

    const maybeGoalTemplateData = await goalTemplateDataNew({
      goalTemplateId: props.data.gtd.goalTemplate.goalTemplateId,
      name: values.name,
      durationEstimate: durationEstimate === null ? undefined : durationEstimate,
      userGeneratedCodeId: props.data.gtd.userGeneratedCode.userGeneratedCodeId,
      active: props.data.gtd.active,
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
        case "GOAL_TEMPLATE_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "This goalTemplate does not exist.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while modifying goalTemplate data.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    let goalTemplateData = maybeGoalTemplateData.Ok;


    // the most recent server side saved patterns
    const currentPatterns = props.data.gtp.map(gtp => gtp.pattern);

    // this will be our returned set of patterns
    // start with all goals that were unchanged
    let gtp = props.data.gtp.filter(x => values.patterns.includes(x.pattern));

    // to add contains all the patterns that will be added
    const toAdd = values.patterns.filter(x => !currentPatterns.includes(x));

    for (const pattern of toAdd) {
      const goalTemplatePattern = await goalTemplatePatternNew({
        goalTemplateId: goalTemplateData.goalTemplate.goalTemplateId,
        pattern,
        active: true,
        apiKey: props.apiKey.key
      }).then(unwrap);
      // add it to new most recent data
      gtp.push(goalTemplatePattern);
    }

    // this is all the patterns tht will be deactivated
    const toRemove = currentPatterns.filter(x => !values.patterns.includes(x));
    for (const pattern of toRemove) {
      await goalTemplatePatternNew({
        goalTemplateId: goalTemplateData.goalTemplate.goalTemplateId,
        pattern,
        active: false,
        apiKey: props.apiKey.key
      }).then(unwrap);
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "GoalTemplate Successfully Modified"
    });

    // execute callback
    props.setData({ gtd: goalTemplateData, gtp });
  }

  return <>
    <Formik<EditGoalTemplateValue>
      onSubmit={onSubmit}
      initialValues={{
        name: props.data.gtd.name,
        abstract: props.data.gtd.durationEstimate === undefined,
        durationEstimate: props.data.gtd.durationEstimate === null
          ? ""
          : formatDuration(
            intervalToDuration({
              start: 0,
              end: props.data.gtd.durationEstimate
            })
          ),
        patterns: props.data.gtp.map(gtp => gtp.pattern),
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
            <Row>
              <Form.Group as={Col}>
                <Form.Label>Name</Form.Label>
                <Form.Control
                  name="name"
                  type="text"
                  placeholder="GoalTemplate Name"
                  as="input"
                  value={fprops.values.name}
                  onChange={e => fprops.setFieldValue("name", e.target.value)}
                  isInvalid={!!fprops.errors.name}
                />
                <Form.Control.Feedback type="invalid">{fprops.errors.name}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>Estimated Duration</Form.Label>
                <Form.Control
                  name="durationEstimate"
                  type="text"
                  placeholder="Estimated Duration"
                  as="input"
                  value={fprops.values.durationEstimate}
                  onChange={e => fprops.setFieldValue("durationEstimate", e.target.value)}
                  isInvalid={!!fprops.errors.durationEstimate}
                />
                <Form.Control.Feedback type="invalid">{fprops.errors.durationEstimate}</Form.Control.Feedback>
              </Form.Group>
            </Row>
            <ChipInput
              placeholder="Goal Patterns"
              chips={fprops.values.patterns}
              onSubmit={(value: string) => {
                fprops.setFieldValue('patterns', update(fprops.values.patterns, { $push: [value] }));
              }}
              onRemove={(index: number) => fprops.setFieldValue('patterns', fprops.values.patterns.filter((_, i) => i != index))}
            />
            <br />
            <Button type="submit">Submit</Button>
            <br />
            <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          </div>
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      </>}
    </Formik>
  </>
}

type CancelGoalTemplateProps = {
  goalTemplateData: GoalTemplateData,
  setGoalTemplateData: (gd: GoalTemplateData) => void
  apiKey: ApiKey,
};

function CancelGoalTemplate(props: CancelGoalTemplateProps) {

  type CancelGoalTemplateValue = {}

  const onSubmit = async (_: CancelGoalTemplateValue,
    fprops: FormikHelpers<CancelGoalTemplateValue>) => {

    const maybeGoalTemplateData = await goalTemplateDataNew({
      goalTemplateId: props.goalTemplateData.goalTemplate.goalTemplateId,
      apiKey: props.apiKey.key,
      name: props.goalTemplateData.name,
      userGeneratedCodeId: props.goalTemplateData.userGeneratedCode.userGeneratedCodeId,
      durationEstimate: props.goalTemplateData.durationEstimate === null ? undefined : props.goalTemplateData.durationEstimate,
      active: false,
    });

    if (isErr(maybeGoalTemplateData)) {
      switch (maybeGoalTemplateData.Err) {
        case "UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "GOAL_TEMPLATE_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "This goalTemplate does not exist.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while managing goalTemplate.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "Event Edited"
    });

    // execute callback
    props.setGoalTemplateData(maybeGoalTemplateData.Ok);
  }

  return <>
    <Formik<CancelGoalTemplateValue>
      onSubmit={onSubmit}
      initialValues={{}}
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
            <p>
              Are you sure you want to cancel goalTemplate for {props.goalTemplateData.name}?
            </p>
            <Button type="submit">Confirm</Button>
            <br />
            <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          </div>
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      </>}
    </Formik>
  </>
}

const ManageGoalTemplate = (props: {
  data: TemplateData,
  setData: (d: TemplateData) => void,
  mutable: boolean,
  apiKey: ApiKey,
}) => {

  const [showEditGoalTemplate, setShowEditGoalTemplate] = React.useState(false);
  const [showCancelGoalTemplate, setShowCancelGoalTemplate] = React.useState(false);

  return <tr>
    <td>
      {props.data.gtd.name}
    </td>
    <td>
      {props.data.gtd.durationEstimate === null
        ? false
        : formatDuration(intervalToDuration({
          start: 0,
          end: props.data.gtd.durationEstimate
        }))
      }
    </td>
    <td>
      {
        props.data.gtp
          .map((gtp, i) => <Badge key={i} variant="secondary" className="m-1">{gtp.pattern}</Badge>)
      }
    </td>
    <td>
      <Button variant="link" onClick={_ => setShowEditGoalTemplate(true)} hidden={!props.mutable}>
        <Edit />
      </Button>
      <Button variant="link" onClick={_ => setShowCancelGoalTemplate(true)}
        hidden={!(props.data.gtd.active && props.mutable)}
      >
        <Cancel />
      </Button>
    </td>
    <DisplayModal
      title="Edit GoalTemplate"
      show={showEditGoalTemplate}
      onClose={() => setShowEditGoalTemplate(false)}
    >
      <EditGoalTemplate
        data={props.data}
        setData={(gtd) => {
          setShowEditGoalTemplate(false);
          props.setData(update(props.data, { $set: gtd }));
        }}
        apiKey={props.apiKey}
      />
    </DisplayModal>
    <DisplayModal
      title="Cancel GoalTemplate"
      show={showCancelGoalTemplate}
      onClose={() => setShowCancelGoalTemplate(false)}
    >
      <CancelGoalTemplate
        goalTemplateData={props.data.gtd}
        apiKey={props.apiKey}
        setGoalTemplateData={(gtd) => {
          setShowCancelGoalTemplate(false);
          props.setData(update(props.data, { gtd: { $set: gtd } }));
        }}
      />
    </DisplayModal>
  </tr>
}

export default ManageGoalTemplate;
