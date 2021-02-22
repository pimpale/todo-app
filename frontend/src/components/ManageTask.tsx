import React from 'react';
import { Form, Button, Table } from 'react-bootstrap'; import Loader from '../components/Loader';
import { Async, AsyncProps } from 'react-async';
import DisplayModal from '../components/DisplayModal';
import { viewTask, newTask, viewGoalData, newGoalData, isApiErrorCode} from '../utils/utils';
import { Edit, Cancel, Unarchive} from '@material-ui/icons';
import { Formik, FormikHelpers } from 'formik'
import format from 'date-fns/format';


type EditTaskProps = {
  task: Task,
  goalData: GoalData,
  apiKey: ApiKey,
  postSubmit: () => void
};

function EditTask(props: EditTaskProps) {

  type EditTaskValue = {
    name: string,
    description: string,
  }

  const onSubmit = async (values: EditTaskValue,
    fprops: FormikHelpers<EditTaskValue>) => {

    const maybeGoalData  = await newGoalData({
      goalId: props.task.goal.goalId,
      apiKey: props.apiKey.key,
      name: values.name,
      description: values.description,
      duration:props.task.duration,
      timeUtilityFunctionId: props.goalData.timeUtilityFunction.timeUtilityFunctionId,
      status: props.goalData.status,
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
            failureResult: "An unknown or network error has occured while modifying task data.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "Task Successfully Modified"
    });

    // execute callback
    props.postSubmit();
  }

  return <>
    <Formik<EditTaskValue>
      onSubmit={onSubmit}
      initialValues={{
        name: props.goalData.name,
        description: props.goalData.description
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
              <Form.Label>Task Name</Form.Label>
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
              <Form.Label >Task Description</Form.Label>
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


type CancelTaskProps = {
  task: Task,
  goalData: GoalData,
  apiKey: ApiKey,
  postSubmit: () => void
};

function CancelTask(props: CancelTaskProps) {

  type CancelTaskValue = {}

  const onSubmit = async (_: CancelTaskValue,
    fprops: FormikHelpers<CancelTaskValue>) => {

    const maybeTask = await newTask({
      goalId: props.task.goal.goalId,
      duration: props.task.duration,
      startTime: props.task.startTime,
      status: "CANCEL",
      apiKey: props.apiKey.key,
    });

    if (isApiErrorCode(maybeTask)) {
      switch (maybeTask) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "API_KEY_UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You are not authorized to manage this event.",
            successResult: ""
          });
          break;
        }
        case "PAST_EVENT_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "This event does not exist.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while managing event.",
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
    <Formik<CancelTaskValue>
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
              Are you sure you want to cancel task for {props.goalData.name}?
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



type ManageTaskData = {
    task: Task,
    goalData: GoalData,
}

const loadManageTaskData = async (props: AsyncProps<ManageTaskData>) => {
  const maybeTask = await viewTask({
    taskId: props.taskId,
    onlyRecent: true,
    apiKey: props.apiKey.key
  });

  let task:Task;
  if (isApiErrorCode(maybeTask) || maybeTask.length === 0) {
    throw Error;
  } else {
    task = maybeTask[0];
  }

  const maybeGoalData = await viewGoalData({
    goalId: task.goal.goalId,
    onlyRecent: true,
    apiKey: props.apiKey.key
  });

  let goalData:GoalData;
  if (isApiErrorCode(maybeGoalData) || maybeGoalData.length === 0) {
    throw Error;
  } else {
    goalData = maybeGoalData[0];
  }

  return { task, goalData }

}


const ManageTask = (props: {
  taskId: number,
  apiKey: ApiKey,
}) => {

  const [showEditTask, setShowEditTask] = React.useState(false);
  const [showCancelTask, setShowCancelTask] = React.useState(false);


  return <Async
    promiseFn={loadManageTaskData}
    apiKey={props.apiKey}
    taskId={props.taskId}>
    {({ reload }) => <>
      <Async.Pending><Loader /></Async.Pending>
      <Async.Rejected>
        <span className="text-danger">An unknown error has occured.</span>
      </Async.Rejected>
      <Async.Fulfilled<ManageTaskData>>{mtd => <>
        <Table hover bordered>
          <tbody>
            <tr>
              <th>Status</th>
              <td>{mtd.task.status}</td>
            </tr>
            <tr>
              <th>Goal Name</th>
              <td>{mtd.goalData.name}</td>
            </tr>
            <tr>
              <th>Goal Description</th>
              <td>{mtd.goalData.description}</td>
            </tr>
            <tr>
              <th>Creation Time</th>
              <td>{format(mtd.task.creationTime, "MMM do")} </td>
            </tr>
          </tbody>
        </Table>
        <Button variant="secondary" onClick={_ => setShowEditTask(true)}>Edit <Edit /></Button>

        { mtd.task.status === "VALID"
            ? <Button variant="danger" onClick={_ => setShowCancelTask(true)}>Cancel <Cancel /></Button>
            : <> </>
        }

        <DisplayModal
          title="Edit Task"
          show={showEditTask}
          onClose={() => setShowEditTask(false)}
        >
          <EditTask
            task={mtd.task}
            goalData={mtd.goalData}
            apiKey={props.apiKey}
            postSubmit={() => {
              setShowEditTask(false);
              reload();
            }}
          />
        </DisplayModal>

        <DisplayModal
          title="Cancel Task"
          show={showCancelTask}
          onClose={() => setShowCancelTask(false)}
        >
          <CancelTask
            task={mtd.task}
            goalData={mtd.goalData}
            apiKey={props.apiKey}
            postSubmit={() => {
              setShowCancelTask(false);
              reload();
            }}
          />
        </DisplayModal>
      </>
      }
      </Async.Fulfilled>
    </>}
  </Async>
}

export default ManageTask;
