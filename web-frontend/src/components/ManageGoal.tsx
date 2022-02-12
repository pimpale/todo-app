import React from 'react';
import { Action, DisplayModal } from '@innexgo/common-react-components';
import update from 'immutability-helper';
import { Col, Row, Card, Form, Button } from 'react-bootstrap';
import UtilityPicker from '../components/UtilityPicker';
import { GoalData, GoalEvent, timeUtilityFunctionNew, goalDataNew } from '@innexgo/frontend-todo-app-api';
import { isErr } from '@innexgo/frontend-common';
import { ApiKey } from '@innexgo/frontend-auth-api';
import { Pencil as Edit, X as Cancel, } from 'react-bootstrap-icons';
import { Formik, FormikHelpers, FormikErrors } from 'formik'
import parseDuration from 'parse-duration';
import formatDuration from 'date-fns/formatDuration';
import intervalToDuration from 'date-fns/intervalToDuration';
import format from 'date-fns/format';

export type ManageGoalData = { gd: GoalData, ge: GoalEvent | undefined };

type EditGoalProps = {
  goalData: GoalData,
  apiKey: ApiKey,
  setGoalData: (gd: GoalData) => void,
};

function EditGoal(props: EditGoalProps) {

  type EditGoalValue = {
    name: string,
    durationEstimate: string,
    points: { x: number, y: number }[]
  }

  const onSubmit = async (values: EditGoalValue,
    fprops: FormikHelpers<EditGoalValue>) => {

    let hasError = false;
    let errors: FormikErrors<EditGoalValue> = {};

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

    const maybeGoalData = await goalDataNew({
      goalId: props.goalData.goal.goalId,
      name: values.name,
      durationEstimate: durationEstimate!,
      timeUtilityFunctionId: maybeTimeUtilFunction.Ok.timeUtilityFunctionId,
      status: props.goalData.status,
      apiKey: props.apiKey.key,
    })

    // TODO also modify time

    if (isErr(maybeGoalData)) {
      switch (maybeGoalData.Err) {
        case "UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "GOAL_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "This goal does not exist.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while modifying goal data.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "Goal Successfully Modified"
    });

    // execute callback
    props.setGoalData(maybeGoalData.Ok);
  }

  return <>
    <Formik<EditGoalValue>
      onSubmit={onSubmit}
      initialValues={{
        name: props.goalData.name,
        durationEstimate: props.goalData.durationEstimate === null
          ? ""
          : formatDuration(
            intervalToDuration({
              start: 0,
              end: props.goalData.durationEstimate
            })
          ),
        points: props.goalData.timeUtilityFunction.startTimes.map((t, i) => ({ x: t, y: props.goalData.timeUtilityFunction.utils[i] }))
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
                  placeholder="Goal Name"
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

type CancelGoalProps = {
  goalData: GoalData,
  setGoalData: (gd: GoalData) => void
  apiKey: ApiKey,
};

function CancelGoal(props: CancelGoalProps) {

  type CancelGoalValue = {}

  const onSubmit = async (_: CancelGoalValue,
    fprops: FormikHelpers<CancelGoalValue>) => {

    const maybeGoalData = await goalDataNew({
      goalId: props.goalData.goal.goalId,
      apiKey: props.apiKey.key,
      name: props.goalData.name,
      durationEstimate: props.goalData.durationEstimate === null ? undefined : props.goalData.durationEstimate,
      timeUtilityFunctionId: props.goalData.timeUtilityFunction.timeUtilityFunctionId,
      status: "CANCEL",
    });

    if (isErr(maybeGoalData)) {
      switch (maybeGoalData.Err) {
        case "UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "GOAL_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "This goal does not exist.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while managing goal.",
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
    props.setGoalData(maybeGoalData.Ok);
  }

  return <>
    <Formik<CancelGoalValue>
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
              Are you sure you want to cancel goal for {props.goalData.name}?
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

const ManageGoal = (props: {
  data: ManageGoalData,
  setData: (d: ManageGoalData) => void,
  mutable: boolean,
  apiKey: ApiKey,
}) => {

  const [showEditGoal, setShowEditGoal] = React.useState(false);
  const [showCancelGoal, setShowCancelGoal] = React.useState(false);

  return <tr>
    <td>
      {props.data.gd.name}
      <br />
      <small>{props.data.gd.status}</small>
    </td>
    <td>
      {props.data.ge !== undefined
        ? format(props.data.ge.startTime, "p EEE, MMM do")
        : "NOT SCHEDULED"
      }
      <br />
      {props.data.gd.durationEstimate === null
        ? false
        : <small>Estimate: {
          formatDuration(intervalToDuration({
            start: 0,
            end: props.data.gd.durationEstimate
          }))
        }</small>
      }
    </td>
    <td>
      <div className="d-flex flex-wrap">
        <Action
          title="Edit"
          onClick={() => setShowEditGoal(true)}
          icon={Edit}
          hidden={!props.mutable}
        />
        <Action
          title="Cancel"
          onClick={() => setShowCancelGoal(true)}
          hidden={props.data.gd.status == "CANCEL" || !props.mutable}
          variant="danger"
          icon={Cancel}
        />
      </div>
    </td>
    <DisplayModal
      title="Edit Goal"
      show={showEditGoal}
      onClose={() => setShowEditGoal(false)}
    >
      <EditGoal
        goalData={props.data.gd}
        setGoalData={(gd) => {
          setShowEditGoal(false);
          props.setData(update(props.data, { gd: { $set: gd } }));
        }}
        apiKey={props.apiKey}
      />
    </DisplayModal>
    <DisplayModal
      title="Cancel Goal"
      show={showCancelGoal}
      onClose={() => setShowCancelGoal(false)}
    >
      <CancelGoal
        goalData={props.data.gd}
        apiKey={props.apiKey}
        setGoalData={(gd) => {
          setShowCancelGoal(false);
          props.setData(update(props.data, { gd: { $set: gd } }));
        }}
      />
    </DisplayModal>
  </tr>
}

export default ManageGoal;
