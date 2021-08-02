import React from 'react';
import update from 'immutability-helper';
import { Col, Row, Card, Form, Button } from 'react-bootstrap';
import DisplayModal from '../components/DisplayModal';
import UtilityPicker from '../components/UtilityPicker';
import { GoalTemplateData, GoalTemplatePattern, timeUtilityFunctionNew, goalTemplateDataNew } from '../utils/utils';
import { isErr } from '@innexgo/frontend-common';
import { ApiKey } from '@innexgo/frontend-auth-api';
import { Edit, Cancel, } from '@material-ui/icons';
import { Formik, FormikHelpers, FormikErrors } from 'formik'
import parseDuration from 'parse-duration';
import formatDuration from 'date-fns/formatDuration';
import intervalToDuration from 'date-fns/intervalToDuration';
import format from 'date-fns/format';

export type TemplateData  = {
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
    points: { x: number, y: number }[]
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

    // TODO: check if utility function has been changed before creating a new one
    // this will be more efficient
    const maybeTimeUtilFunction = await timeUtilityFunctionNew({
      startTimes: values.points.map(p => p.x),
      utils: values.points.map(p => p.y),
      apiKey: props.apiKey.key,
    })

    if (isErr(maybeTimeUtilFunction)) {
      switch (maybeTimeUtilFunction.Err) {
        case "UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "TIME_UTILITY_FUNCTION_NOT_VALID": {
          fprops.setErrors({
            points: "Utility function is invalid."
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

    const maybeGoalTemplateData = await goalTemplateDataNew({
      goalTemplateId: props.goalTemplateData.goalTemplate.goalTemplateId,
      name: values.name,
      durationEstimate: durationEstimate!,
      timeUtilityFunctionId: maybeTimeUtilFunction.Ok.timeUtilityFunctionId,
      status: props.goalTemplateData.status,
      apiKey: props.apiKey.key,
    })

    // TODO also modify time

    if (isErr(maybeGoalTemplateData)) {
      switch (maybeGoalTemplateData.Err) {
        case "UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "GOALTemplate_NONEXISTENT": {
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

    fprops.setStatus({
      failureResult: "",
      successResult: "GoalTemplate Successfully Modified"
    });

    // execute callback
    props.setGoalTemplateData(maybeGoalTemplateData.Ok);
  }

  return <>
    <Formik<EditGoalTemplateValue>
      onSubmit={onSubmit}
      initialValues={{
        name: props.goalTemplateData.name,
        durationEstimate: props.goalTemplateData.durationEstimate === undefined
          ? ""
          : formatDuration(
            intervalToDuration({
              start: 0,
              end: props.goalTemplateData.durationEstimate
            })
          ),
        points: props.goalTemplateData.timeUtilityFunction.startTimes.map((t, i) => ({ x: t, y: props.goalTemplateData.timeUtilityFunction.utils[i] }))
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
            <Form.Group>
              <Card>
                <Card.Body>
                  <UtilityPicker
                    span={[
                      Math.min(...fprops.values.points.map(p => p.x)) - 100000,
                      Math.max(...fprops.values.points.map(p => p.x)) + 100000
                    ]}
                    points={fprops.values.points}
                    setPoints={p => fprops.setFieldValue("points", p)}
                    mutable
                  />
                </Card.Body>
              </Card>
              <Form.Text className="text-danger">{fprops.errors.points}</Form.Text>
            </Form.Group>
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
      durationEstimate: props.goalTemplateData.durationEstimate,
      timeUtilityFunctionId: props.goalTemplateData.timeUtilityFunction.timeUtilityFunctionId,
      status: "CANCEL",
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
        case "GOALTemplate_NONEXISTENT": {
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
      {props.data.gtd.durationEstimate === undefined
        ? false
        : <small>Estimate: {
          formatDuration(intervalToDuration({
            start: 0,
            end: props.data.gtd.durationEstimate
          }))
        }</small>
      }
    </td>
    <td>
      <Button variant="link" onClick={_ => setShowEditGoalTemplate(true)} hidden={!props.mutable}>
        <Edit />
      </Button>
      <Button variant="link" onClick={_ => setShowCancelGoalTemplate(true)}
        hidden={props.data.gtd.status == "CANCEL" || !props.mutable}
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
        goalTemplateData={props.data.gtd}
        setGoalTemplateData={(gtd) => {
          setShowEditGoalTemplate(false);
          props.setData(update(props.data, { gtd: { $set: gtd } }));
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
