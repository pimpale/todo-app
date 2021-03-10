import React from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import Loader from '../components/Loader';
import { Async, AsyncProps } from 'react-async';
import DisplayModal from '../components/DisplayModal';
import UtilityPicker from '../components/UtilityPicker';
import { viewTimeUtilityFunctionPoint, newTimeUtilityFunction, viewGoalData, newGoalData, isApiErrorCode } from '../utils/utils';
import { Edit, Cancel, } from '@material-ui/icons';
import { Formik, FormikHelpers } from 'formik'


type EditGoalProps = {
  goalData: GoalData,
  tuf: TimeUtilityFunctionPoint[],
  apiKey: ApiKey,
  postSubmit: () => void
};

function EditGoal(props: EditGoalProps) {

  type EditGoalValue = {
    name: string,
    description: string,
    startTime: number | null,
    duration: number | null,
    points: { x: number, y: number }[]
  }

  const onSubmit = async (values: EditGoalValue,
    fprops: FormikHelpers<EditGoalValue>) => {

    // TODO: check if utility function has been changed before creating a new one
    // this will be more efficient
    const maybeTimeUtilFunction = await newTimeUtilityFunction({
      startTimes: values.points.map(p => p.x),
      utils: values.points.map(p => p.y),
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

    const maybeGoalData = await newGoalData({
      goalId: props.goalData.goal.goalId,
      name: values.name,
      description: values.description,
      durationEstimate: props.goalData.durationEstimate,
      timeUtilityFunctionId: maybeTimeUtilFunction.timeUtilityFunctionId,
      scheduled: values.startTime !== null && values.duration !== null,
      startTime: values.startTime ?? 0,
      duration: values.duration ?? 0,
      status: props.goalData.status,
      apiKey: props.apiKey.key,
    });

    if (isApiErrorCode(maybeGoalData)) {
      switch (maybeGoalData) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "API_KEY_UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You are not authorized to modify this goal.",
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
    props.postSubmit();
  }

  return <>
    <Formik<EditGoalValue>
      onSubmit={onSubmit}
      initialValues={{
        name: props.goalData.name,
        description: props.goalData.description,
        startTime: props.goalData.startTime,
        duration: props.goalData.duration,
        points: props.tuf.map(p => ({ x: p.startTime, y: p.utils }))
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
              <Form.Label>Goal Name</Form.Label>
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
            <Form.Group >
              <Form.Label >Goal Description</Form.Label>
              <Form.Control
                name="description"
                type="text"
                placeholder="Goal Description"
                value={fprops.values.description}
                onChange={e => fprops.setFieldValue("description", e.target.value)}
                isInvalid={!!fprops.errors.description}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.description}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Card>
                <Card.Body>
                  <UtilityPicker
                    span={[
                      Math.min(...props.tuf.map(p => p.startTime)) - 100000,
                      Math.max(...props.tuf.map(p => p.startTime)) + 100000
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
  apiKey: ApiKey,
  postSubmit: () => void
};

function CancelGoal(props: CancelGoalProps) {

  type CancelGoalValue = {}

  const onSubmit = async (_: CancelGoalValue,
    fprops: FormikHelpers<CancelGoalValue>) => {

    const maybeGoalData = await newGoalData({
      goalId: props.goalData.goal.goalId,
      apiKey: props.apiKey.key,
      name: props.goalData.name,
      description: props.goalData.description,
      durationEstimate: props.goalData.durationEstimate,
      timeUtilityFunctionId: props.goalData.timeUtilityFunction.timeUtilityFunctionId,
      scheduled: props.goalData.scheduled,
      startTime: props.goalData.startTime ?? 0,
      duration: props.goalData.duration ?? 0,
      status: "CANCEL",
    });

    if (isApiErrorCode(maybeGoalData)) {
      switch (maybeGoalData) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "API_KEY_UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You are not authorized to manage this goal.",
            successResult: ""
          });
          break;
        }
        case "PAST_EVENT_NONEXISTENT": {
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
    props.postSubmit();
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

type ManageGoalData = {
  goalData: GoalData,
  tuf: TimeUtilityFunctionPoint[],
}

const loadManageGoalData = async (props: AsyncProps<ManageGoalData>) => {
  const maybeGoalData = await viewGoalData({
    goalId: props.goalId,
    onlyRecent: true,
    apiKey: props.apiKey.key
  });

  if (isApiErrorCode(maybeGoalData) || maybeGoalData.length === 0) {
    throw Error;
  }

  const goalData = maybeGoalData[0];

  const maybeTuf = await viewTimeUtilityFunctionPoint({
    timeUtilityFunctionId: goalData.timeUtilityFunction.timeUtilityFunctionId,
    apiKey: props.apiKey.key
  });

  if (isApiErrorCode(maybeTuf) || maybeTuf.length === 0) {
    throw Error;
  }

  return {
    goalData,
    tuf: maybeTuf
  };
}


const ManageGoal = (props: {
  goalId: number,
  apiKey: ApiKey,
  onChange: () => void
}) => {

  const [showEditGoal, setShowEditGoal] = React.useState(false);
  const [showCancelGoal, setShowCancelGoal] = React.useState(false);

  return <Async
    promiseFn={loadManageGoalData}
    apiKey={props.apiKey}
    goalId={props.goalId}>
    {({ reload }) => <>
      <Async.Pending><Loader /></Async.Pending>
      <Async.Rejected>
        <span className="text-danger">An unknown error has occured.</span>
      </Async.Rejected>
      <Async.Fulfilled<ManageGoalData >>{mgd => <>
        <td>
          {mgd.goalData.name}
          <br />
          <small>{mgd.goalData.status}</small>
        </td>
        <td>{mgd.goalData.description}</td>
        <td>
          <UtilityPicker
            span={[
              Math.min(...mgd.tuf.map(p => p.startTime)) - 100000,
              Math.max(...mgd.tuf.map(p => p.startTime)) + 100000
            ]}
            points={mgd.tuf.map(p => ({ x: p.startTime, y: p.utils }))}
            setPoints={() => null}
            mutable={false}
          />
        </td>
        <td>
          <Button variant="link" onClick={_ => setShowEditGoal(true)}><Edit /></Button>
          {mgd.goalData.status !== "CANCEL"
            ? <Button variant="link" onClick={_ => setShowCancelGoal(true)}><Cancel /></Button>
            : <> </>
          }
        </td>
        <DisplayModal
          title="Edit Goal"
          show={showEditGoal}
          onClose={() => setShowEditGoal(false)}
        >
          <EditGoal
            goalData={mgd.goalData}
            tuf={mgd.tuf}
            apiKey={props.apiKey}
            postSubmit={() => {
              setShowEditGoal(false);
              reload();
            }}
          />
        </DisplayModal>
        <DisplayModal
          title="Cancel Goal"
          show={showCancelGoal}
          onClose={() => setShowCancelGoal(false)}
        >
          <CancelGoal
            goalData={mgd.goalData}
            apiKey={props.apiKey}
            postSubmit={() => {
              setShowCancelGoal(false);
              props.onChange();
            }}
          />
        </DisplayModal>
      </>
      }
      </Async.Fulfilled>
    </>}
  </Async>
}

export default ManageGoal;
