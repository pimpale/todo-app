import React from 'react'
import { Table } from 'react-bootstrap';
import DisplayModal from '../components/DisplayModal';
import { Add } from '@material-ui/icons'
import ManageGoal from '../components/ManageGoal';
import CreateGoal from '../components/CreateGoal';
import { ApiKey } from '@innexgo/frontend-auth-api';

type ManageGoalTableProps = {
  goalIds: number[],
  apiKey: ApiKey,
  reload: () => void,
  mutable: boolean,
  addable: boolean,
}

function ManageGoalTable(props: ManageGoalTableProps) {
  const [showCreateGoal, setShowCreateGoal] = React.useState(false);
  return <>
    <Table hover bordered>
      <thead>
        <tr>
          <th>Name</th>
          <th>Time</th>
          <th>Description</th>
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
        {props.goalIds.length !== 0 ? <> </> :
          <tr><td colSpan={5} className="text-center">No Goals</td></tr>
        }
        {props.goalIds.map(gi =>
          <tr>
            <ManageGoal
              key={gi}
              goalId={gi}
              apiKey={props.apiKey}
              onChange={props.reload}
            />
          </tr>
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
        postSubmit={() => {
          setShowCreateGoal(false);
          props.reload();
        }}
      />
    </DisplayModal>
  </>
}

export default ManageGoalTable;
