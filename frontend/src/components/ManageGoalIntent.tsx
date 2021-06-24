import React from 'react';
import { Col, Row, Card, Form, Button } from 'react-bootstrap';
import DisplayModal from '../components/DisplayModal';
import { GoalIntentData, goalIntentDataView, goalIntentDataNew } from '../utils/utils';
import { isErr } from '@innexgo/frontend-common';
import { ApiKey } from '@innexgo/frontend-auth-api';
import { Edit, Cancel, } from '@material-ui/icons';
import { Formik, FormikHelpers, FormikErrors } from 'formik'


type EditGoalIntentProps = {
  goalIntentData: GoalIntentData,
  setGoalIntentData: (gid: GoalIntentData) => void
  apiKey: ApiKey,
};

function EditGoalIntent(props: EditGoalIntentProps) {

  type EditGoalIntentValue = {
    name: string,
  }

  const onSubmit = async (values: EditGoalIntentValue,
    fprops: FormikHelpers<EditGoalIntentValue>) => {

    let hasError = false;
    let errors: FormikErrors<EditGoalIntentValue> = {};

    if (values.name === "") {
      errors.name = "Please enter an event name";
      hasError = true;
    }

    fprops.setErrors(errors);
    if (hasError) {
      return;
    }

    const maybeGoalIntentData = await goalIntentDataNew({
      goalIntentId: props.goalIntentData.goalIntent.goalIntentId,
      name: values.name,
      active: props.goalIntentData.active,
      apiKey: props.apiKey.key,
    })

    if (isErr(maybeGoalIntentData)) {
      switch (maybeGoalIntentData.Err) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "API_KEY_UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You are not authorized to modify this goalIntent.",
            successResult: ""
          });
          break;
        }
        case "GOAL_INTENT_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "This goalIntent does not exist.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while modifying goalIntent data.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "GoalIntent Successfully Modified"
    });

    // execute callback
    props.setGoalIntentData(maybeGoalIntentData.Ok);
  }

  return <>
    <Formik<EditGoalIntentValue>
      onSubmit={onSubmit}
      initialValues={{
        name: props.goalIntentData.name,
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
                  placeholder="GoalIntent Name"
                  as="input"
                  value={fprops.values.name}
                  onChange={e => fprops.setFieldValue("name", e.target.value)}
                  isInvalid={!!fprops.errors.name}
                />
                <Form.Control.Feedback type="invalid">{fprops.errors.name}</Form.Control.Feedback>
              </Form.Group>
            </Row>
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



const cancelGoalIntent = async (
  apiKey: ApiKey,
  goalIntentData: GoalIntentData,
  setGoalIntentData: (gid: GoalIntentData) => void,
  setFailureResult: (s: string) => void,
) => {
  const maybeGoalIntentData = await goalIntentDataNew({
    goalIntentId: goalIntentData.goalIntent.goalIntentId,
    apiKey: apiKey.key,
    name: goalIntentData.name,
    active: false,
  });

  if (isErr(maybeGoalIntentData)) {
    switch (maybeGoalIntentData.Err) {
      case "API_KEY_NONEXISTENT": {
        setFailureResult("You have been automatically logged out. Please relogin.");
        break;
      }
      case "API_KEY_UNAUTHORIZED": {
        setFailureResult("You are not authorized to manage this goalIntent.");
        break;
      }
      case "GOAL_INTENT_NONEXISTENT": {
        setFailureResult("This goalIntent does not exist.");
        break;
      }
      default: {
        setFailureResult("An unknown or network error has occured while managing goalIntent.");
        break;
      }
    }
    return;
  }
  // execute callback
  setGoalIntentData(maybeGoalIntentData.Ok);
}

const ManageGoalIntent = (props: {
  goalIntentData: GoalIntentData,
  setGoalIntentData: (gid: GoalIntentData) => void,
  apiKey: ApiKey,
}) => {
  const [showEditGoalIntent, setShowEditGoalIntent] = React.useState(false);

  const [failureResult, setFailureResult] = React.useState("");

  return <tr>
    <td>
      {props.goalIntentData.name}
      <button className="btn btn-link px-0 py-0 float-right">
        <Edit />
      </button>
      {props.goalIntentData.active
        ?
        <button className="btn btn-link px-0 py-0 float-right"
          onClick={_ =>
            cancelGoalIntent(
              props.apiKey,
              props.goalIntentData,
              props.setGoalIntentData,
              setFailureResult
            )
          }>
          <Cancel />
        </button>
        : <> </>
      }
      <Form.Text className="text-danger">{failureResult}</Form.Text>
    </td>
    <DisplayModal
      title="Edit GoalIntent"
      show={showEditGoalIntent}
      onClose={() => setShowEditGoalIntent(false)}
    >
      <EditGoalIntent
        goalIntentData={props.goalIntentData}
        setGoalIntentData={(gid) => {
          setShowEditGoalIntent(false);
          props.setGoalIntentData(gid);
        }}
        apiKey={props.apiKey}
      />
    </DisplayModal>
  </tr>
}

export default ManageGoalIntent;
