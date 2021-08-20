import React from 'react'
import { Table } from 'react-bootstrap';
import update from 'immutability-helper';
import DisplayModal from '../components/DisplayModal';
import { Plus as Add } from 'react-bootstrap-icons'
import ManageGoal, { ManageGoalData } from '../components/ManageGoal';
import CreateGoal from '../components/CreateGoal';
import { ApiKey } from '@innexgo/frontend-auth-api';


type ManageGoalTableProps = {
  data: ManageGoalData[],
  setData: (d: ManageGoalData[]) => void,
  apiKey: ApiKey,
  mutable: boolean,
  addable: boolean,
  showInactive: boolean,
}

function ManageGoalTable(props: ManageGoalTableProps) {
  const [showCreateGoal, setShowCreateGoal] = React.useState(false);

  const actives = props.data
    // enumerate data + index
    .map((d, i) => ({ d, i }))
    // filter inactive
    .filter(({ d }) => props.showInactive || d.gd.status !== "CANCEL")

  return <>
    <Table hover bordered>
      <thead>
        <tr>
          <th>Name</th>
          <th>Time</th>
          <th>Utility</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr hidden={!props.addable}>
          <td colSpan={5} className="px-0 py-0">
            <button
              className="h-100 w-100 mx-0 my-0"
              style={{ borderStyle: 'dashed', borderWidth: "medium" }}
              onClick={() => setShowCreateGoal(true)}
            >
              <Add className="mx-auto my-auto text-muted" fontSize="large" />
            </button>
          </td>
        </tr>
        {actives.length !== 0 ? <> </> :
          <tr><td colSpan={5} className="text-center">No Goals</td></tr>
        }
        {actives
          // reverse in order to see newest first
          .reverse()
          .map(({ d, i }) =>
            <ManageGoal
              key={i}
              mutable={props.mutable}
              data={d}
              setData={(d) => props.setData(update(props.data, { [i]: { $set: d } }))}
              apiKey={props.apiKey}
            />
          )}
      </tbody>
    </Table>
    <DisplayModal
      title="New Goal"
      show={showCreateGoal}
      onClose={() => setShowCreateGoal(false)}
    >
      <CreateGoal
        apiKey={props.apiKey}
        postSubmit={(gd) => {
          setShowCreateGoal(false);
          // add d to the goal data
          props.setData(update(props.data, { $push: [{ gd: gd, ge: undefined }] }));
        }}
      />
    </DisplayModal>
  </>
}

export default ManageGoalTable;
