import React from 'react';
import { Form, Button, Table } from 'react-bootstrap';
import { Loader, DisplayModal } from '@innexgo/common-react-components';
import { Async, AsyncProps } from 'react-async';
import ErrorMessage from '../components/ErrorMessage';
import { ExternalEventData, externalEventDataNew, externalEventDataView } from '@innexgo/frontend-todo-app-api';
import { ApiKey } from '@innexgo/frontend-auth-api';
import { Pencil as EditIcon, Trash as DeleteIcon, BoxArrowUp as RestoreIcon } from 'react-bootstrap-icons';
import { Formik, FormikHelpers } from 'formik'
import format from 'date-fns/format';
import { isErr } from '@innexgo/frontend-common';


type EditExternalEventDataProps = {
  externalEventData: ExternalEventData,
  apiKey: ApiKey,
  postSubmit: () => void
};

function EditExternalEventData(props: EditExternalEventDataProps) {

  type EditExternalEventDataValue = {
    name: string,
  }

  const onSubmit = async (values: EditExternalEventDataValue,
    fprops: FormikHelpers<EditExternalEventDataValue>) => {

    const maybeExternalEventData = await externalEventDataNew({
      externalEventId: props.externalEventData.externalEvent.externalEventId,
      apiKey: props.apiKey.key,
      name: values.name,
      startTime: props.externalEventData.startTime,
      endTime: props.externalEventData.endTime,
      active: props.externalEventData.active,
    });

    if (isErr(maybeExternalEventData)) {
      switch (maybeExternalEventData.Err) {
        case "UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "EXTERNAL_EVENT_NONEXISTENT": {
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
    <Formik<EditExternalEventDataValue>
      onSubmit={onSubmit}
      initialValues={{
        name: props.externalEventData.name,
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


type ArchiveExternalEventProps = {
  externalEventData: ExternalEventData,
  apiKey: ApiKey,
  postSubmit: () => void
};

function ArchiveExternalEvent(props: ArchiveExternalEventProps) {

  type ArchiveExternalEventValue = {}

  const onSubmit = async (_: ArchiveExternalEventValue,
    fprops: FormikHelpers<ArchiveExternalEventValue>) => {

    const maybeExternalEventData = await externalEventDataNew({
      externalEventId: props.externalEventData.externalEvent.externalEventId,
      apiKey: props.apiKey.key,
      name: props.externalEventData.name,
      startTime: props.externalEventData.startTime,
      endTime: props.externalEventData.endTime,
      active: !props.externalEventData.active,
    });

    if (isErr(maybeExternalEventData)) {
      switch (maybeExternalEventData.Err) {
        case "UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "EXTERNAL_EVENT_NONEXISTENT": {
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
    <Formik<ArchiveExternalEventValue>
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
              Are you sure you want to {props.externalEventData.active ? "archive" : "unarchive"} {props.externalEventData.name}?
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



const loadExternalEventData = async (props: AsyncProps<ExternalEventData>) => {
  const maybeExternalEventData = await externalEventDataView({
    externalEventId: props.externalEventId,
    onlyRecent: true,
    apiKey: props.apiKey.key
  });

  if (isErr(maybeExternalEventData)) {
    throw Error(maybeExternalEventData.Err);
  } else {
    return maybeExternalEventData.Ok[0];
  }
}


const ManageExternalEventData = (props: {
  externalEventId: number,
  apiKey: ApiKey,
}) => {

  const [showEditExternalEventData, setShowEditExternalEventData] = React.useState(false);
  const [showArchiveExternalEvent, setShowArchiveExternalEvent] = React.useState(false);


  return <Async
    promiseFn={loadExternalEventData}
    apiKey={props.apiKey}
    externalEventId={props.externalEventId}>
    {({ reload }) => <>
      <Async.Pending><Loader /></Async.Pending>
      <Async.Rejected>
        {e => <ErrorMessage error={e} />}
      </Async.Rejected>
      <Async.Fulfilled<ExternalEventData>>{externalEventData => <>
        <Table hover bordered>
          <tbody>
            <tr>
              <th>Status</th>
              <td>{externalEventData.active ? "Active" : "Archived"}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{externalEventData.name}</td>
            </tr>
            <tr>
              <th>Creation Time</th>
              <td>{format(externalEventData.externalEvent.creationTime, "MMM do")} </td>
            </tr>
          </tbody>
        </Table>
        <Button variant="secondary" onClick={_ => setShowEditExternalEventData(true)}>Edit <EditIcon /></Button>

        {externalEventData.active
          ? <Button variant="danger" onClick={_ => setShowArchiveExternalEvent(true)}>Archive <DeleteIcon /></Button>
          : <Button variant="success" onClick={_ => setShowArchiveExternalEvent(true)}>Unarchive <RestoreIcon /></Button>
        }

        <DisplayModal
          title="Edit Event"
          show={showEditExternalEventData}
          onClose={() => setShowEditExternalEventData(false)}
        >
          <EditExternalEventData
            externalEventData={externalEventData}
            apiKey={props.apiKey}
            postSubmit={() => {
              setShowEditExternalEventData(false);
              reload();
            }}
          />
        </DisplayModal>

        <DisplayModal
          title="Archive Event"
          show={showArchiveExternalEvent}
          onClose={() => setShowArchiveExternalEvent(false)}
        >
          <ArchiveExternalEvent
            externalEventData={externalEventData}
            apiKey={props.apiKey}
            postSubmit={() => {
              setShowArchiveExternalEvent(false);
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

export default ManageExternalEventData;
