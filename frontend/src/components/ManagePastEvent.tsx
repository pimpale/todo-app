import React from 'react';
import { Form, Button, Table } from 'react-bootstrap'; import Loader from '../components/Loader';
import { Async, AsyncProps } from 'react-async';
import DisplayModal from '../components/DisplayModal';
import { viewPastEventData, newPastEventData, isApiErrorCode} from '../utils/utils';
import { Edit, Archive, Unarchive} from '@material-ui/icons';
import { Formik, FormikHelpers } from 'formik'
import format from 'date-fns/format';


type EditPastEventDataProps = {
  pastEventData: PastEventData,
  apiKey: ApiKey,
  postSubmit: () => void
};

function EditPastEventData(props: EditPastEventDataProps) {

  type EditPastEventDataValue = {
    name: string,
    description: string,
  }

  const onSubmit = async (values: EditPastEventDataValue,
    fprops: FormikHelpers<EditPastEventDataValue>) => {

    const maybePastEventData = await newPastEventData({
      pastEventId: props.pastEventData.pastEvent.pastEventId,
      apiKey: props.apiKey.key,
      name: values.name,
      description: values.description,
      startTime:props.pastEventData.startTime,
      duration:props.pastEventData.duration,
      active: props.pastEventData.active,
    });

    if (isApiErrorCode(maybePastEventData)) {
      switch (maybePastEventData) {
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
        case "PAST_EVENT_NONEXISTENT": {
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
    <Formik<EditPastEventDataValue>
      onSubmit={onSubmit}
      initialValues={{
        name: props.pastEventData.name,
        description: props.pastEventData.description
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
              <Form.Label >PastEvent Description</Form.Label>
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


type ArchivePastEventProps = {
  pastEventData: PastEventData,
  apiKey: ApiKey,
  postSubmit: () => void
};

function ArchivePastEvent(props: ArchivePastEventProps) {

  type ArchivePastEventValue = {}

  const onSubmit = async (_: ArchivePastEventValue,
    fprops: FormikHelpers<ArchivePastEventValue>) => {

    const maybePastEventData = await newPastEventData({
      pastEventId: props.pastEventData.pastEvent.pastEventId,
      apiKey: props.apiKey.key,
      startTime: props.pastEventData.startTime,
      duration: props.pastEventData.duration,
      name: props.pastEventData.name,
      description: props.pastEventData.description,
      active: !props.pastEventData.active,
    });

    if (isApiErrorCode(maybePastEventData)) {
      switch (maybePastEventData) {
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
    <Formik<ArchivePastEventValue>
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
              Are you sure you want to {props.pastEventData.active ? "archive" : "unarchive"} {props.pastEventData.name}?
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



const loadPastEventData = async (props: AsyncProps<PastEventData>) => {
  const maybePastEventData = await viewPastEventData({
    pastEventId: props.pastEventId,
    onlyRecent: true,
    apiKey: props.apiKey.key
  });

  if (isApiErrorCode(maybePastEventData) || maybePastEventData.length === 0) {
    throw Error;
  } else {
    return maybePastEventData[0];
  }
}


const ManagePastEventData = (props: {
  pastEventId: number,
  apiKey: ApiKey,
}) => {

  const [showEditPastEventData, setShowEditPastEventData] = React.useState(false);
  const [showArchivePastEvent, setShowArchivePastEvent] = React.useState(false);


  return <Async
    promiseFn={loadPastEventData}
    apiKey={props.apiKey}
    pastEventId={props.pastEventId}>
    {({ reload }) => <>
      <Async.Pending><Loader /></Async.Pending>
      <Async.Rejected>
        <span className="text-danger">An unknown error has occured.</span>
      </Async.Rejected>
      <Async.Fulfilled<PastEventData>>{pastEventData => <>
        <Table hover bordered>
          <tbody>
            <tr>
              <th>Status</th>
              <td>{pastEventData.active ? "Active" : "Archived"}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{pastEventData.name}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td>{pastEventData.description}</td>
            </tr>
            <tr>
              <th>Creation Time</th>
              <td>{format(pastEventData.pastEvent.creationTime, "MMM do")} </td>
            </tr>
          </tbody>
        </Table>
        <Button variant="secondary" onClick={_ => setShowEditPastEventData(true)}>Edit <Edit /></Button>

        { pastEventData.active
            ? <Button variant="danger" onClick={_ => setShowArchivePastEvent(true)}>Archive <Archive /></Button>
            : <Button variant="success" onClick={_ => setShowArchivePastEvent(true)}>Unarchive <Unarchive /></Button>
        }

        <DisplayModal
          title="Edit Event"
          show={showEditPastEventData}
          onClose={() => setShowEditPastEventData(false)}
        >
          <EditPastEventData
            pastEventData={pastEventData}
            apiKey={props.apiKey}
            postSubmit={() => {
              setShowEditPastEventData(false);
              reload();
            }}
          />
        </DisplayModal>

        <DisplayModal
          title="Archive Event"
          show={showArchivePastEvent}
          onClose={() => setShowArchivePastEvent(false)}
        >
          <ArchivePastEvent
            pastEventData={pastEventData}
            apiKey={props.apiKey}
            postSubmit={() => {
              setShowArchivePastEvent(false);
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

export default ManagePastEventData;
