import React from 'react';
import { Form, Button, Table } from 'react-bootstrap'; import Loader from '../components/Loader';
import { Async, AsyncProps } from 'react-async';
import DisplayModal from '../components/DisplayModal';
import { newTaskEvent, isTodoAppErrorCode} from '../utils/utils';
import { ApiKey } from '@innexgo/frontend-auth-api';
import { Edit, Archive, Unarchive} from '@material-ui/icons';
import { Formik, FormikHelpers } from 'formik'
import format from 'date-fns/format';


type EditTaskEventDataProps = {
  taskEventData: TaskEventData,
  apiKey: ApiKey,
  postSubmit: () => void
};

function EditTaskEventData(props: EditTaskEventDataProps) {

  type EditTaskEventDataValue = {
    name: string,
    description: string,
  }

  const onSubmit = async (values: EditTaskEventDataValue,
    fprops: FormikHelpers<EditTaskEventDataValue>) => {

    const maybeTaskEventData = await newTaskEventData({
      taskEventId: props.taskEventData.taskEvent.taskEventId,
      apiKey: props.apiKey.key,
      name: values.name,
      description: values.description,
      startTime:props.taskEventData.startTime,
      duration:props.taskEventData.duration,
      active: props.taskEventData.active,
    });

    if (isTodoAppErrorCode(maybeTaskEventData)) {
      switch (maybeTaskEventData) {
        case "API_KEY_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "API_KEY_UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You are not authorized to modify this event.",
            successResult: ""
          });
          break;
        }
        case "TASK_EVENT_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "This event does not exist.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while modifying event data.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "Event Successfully Modified"
    });

    // execute callback
    props.postSubmit();
  }

  return <>
    <Formik<EditTaskEventDataValue>
      onSubmit={onSubmit}
      initialValues={{
        name: props.taskEventData.name,
        description: props.taskEventData.description
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
              <Form.Label>Event Name</Form.Label>
              <Form.Control
                name="name"
                type="text"
                placeholder="Event Name"
                as="input"
                value={fprops.values.name}
                onChange={e => fprops.setFieldValue("name", e.target.value)}
                isInvalid={!!fprops.errors.name}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.name}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group >
              <Form.Label >TaskEvent Description</Form.Label>
              <Form.Control
                name="description"
                type="text"
                placeholder="Event Description"
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


type ArchiveTaskEventProps = {
  taskEventData: TaskEventData,
  apiKey: ApiKey,
  postSubmit: () => void
};

function ArchiveTaskEvent(props: ArchiveTaskEventProps) {

  type ArchiveTaskEventValue = {}

  const onSubmit = async (_: ArchiveTaskEventValue,
    fprops: FormikHelpers<ArchiveTaskEventValue>) => {

    const maybeTaskEventData = await newTaskEventData({
      taskEventId: props.taskEventData.taskEvent.taskEventId,
      apiKey: props.apiKey.key,
      startTime: props.taskEventData.startTime,
      duration: props.taskEventData.duration,
      name: props.taskEventData.name,
      description: props.taskEventData.description,
      active: !props.taskEventData.active,
    });

    if (isTodoAppErrorCode(maybeTaskEventData)) {
      switch (maybeTaskEventData) {
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
        case "TASK_EVENT_NONEXISTENT": {
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
    <Formik<ArchiveTaskEventValue>
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
              Are you sure you want to {props.taskEventData.active ? "archive" : "unarchive"} {props.taskEventData.name}?
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



const loadTaskEventData = async (props: AsyncProps<TaskEventData>) => {
  const maybeTaskEventData = await viewTaskEventData({
    taskEventId: props.taskEventId,
    onlyRecent: true,
    apiKey: props.apiKey.key
  });

  if (isTodoAppErrorCode(maybeTaskEventData) || maybeTaskEventData.length === 0) {
    throw Error;
  } else {
    return maybeTaskEventData[0];
  }
}


const ManageTaskEventData = (props: {
  taskEventId: number,
  apiKey: ApiKey,
}) => {

  const [showEditTaskEventData, setShowEditTaskEventData] = React.useState(false);
  const [showArchiveTaskEvent, setShowArchiveTaskEvent] = React.useState(false);


  return <Async
    promiseFn={loadTaskEventData}
    apiKey={props.apiKey}
    taskEventId={props.taskEventId}>
    {({ reload }) => <>
      <Async.Pending><Loader /></Async.Pending>
      <Async.Rejected>
        <span className="text-danger">An unknown error has occured.</span>
      </Async.Rejected>
      <Async.Fulfilled<TaskEventData>>{taskEventData => <>
        <Table hover bordered>
          <tbody>
            <tr>
              <th>Status</th>
              <td>{taskEventData.active ? "Active" : "Archived"}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{taskEventData.name}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td>{taskEventData.description}</td>
            </tr>
            <tr>
              <th>Creation Time</th>
              <td>{format(taskEventData.taskEvent.creationTime, "MMM do")} </td>
            </tr>
          </tbody>
        </Table>
        <Button variant="secondary" onClick={_ => setShowEditTaskEventData(true)}>Edit <Edit /></Button>

        { taskEventData.active
            ? <Button variant="danger" onClick={_ => setShowArchiveTaskEvent(true)}>Archive <Archive /></Button>
            : <Button variant="success" onClick={_ => setShowArchiveTaskEvent(true)}>Unarchive <Unarchive /></Button>
        }

        <DisplayModal
          title="Edit Event"
          show={showEditTaskEventData}
          onClose={() => setShowEditTaskEventData(false)}
        >
          <EditTaskEventData
            taskEventData={taskEventData}
            apiKey={props.apiKey}
            postSubmit={() => {
              setShowEditTaskEventData(false);
              reload();
            }}
          />
        </DisplayModal>

        <DisplayModal
          title="Archive Event"
          show={showArchiveTaskEvent}
          onClose={() => setShowArchiveTaskEvent(false)}
        >
          <ArchiveTaskEvent
            taskEventData={taskEventData}
            apiKey={props.apiKey}
            postSubmit={() => {
              setShowArchiveTaskEvent(false);
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

export default ManageTaskEventData;
