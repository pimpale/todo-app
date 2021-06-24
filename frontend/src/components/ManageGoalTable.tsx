import React from 'react'
import { Table } from 'react-bootstrap';
import update from 'immutability-helper';
import DisplayModal from '../components/DisplayModal';
import { GoalData } from '../utils/utils';
import { Add } from '@material-ui/icons'
import ManageGoal from '../components/ManageGoal';
import CreateGoal from '../components/CreateGoal';
import { ApiKey } from '@innexgo/frontend-auth-api';

type ManageGoalTableProps = {
  goalData: GoalData[],
  setGoalData: (gds: GoalData[]) => void,
  apiKey: ApiKey,
  mutable: boolean,
  addable: boolean,
  showInactive: boolean,
}

function ManageGoalTable(props: ManageGoalTableProps) {
  const [showCreateGoal, setShowCreateGoal] = React.useState(false);

  const actives = props.goalData
    .map((gd, i) => ({ gd, i }))
    .filter(({ gd }) => props.showInactive || gd.status !== "CANCEL");

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
        {actives.map(({ gd, i }) =>
          <ManageGoal
            key={i}
            mutable={props.mutable}
            goalData={gd}
            setGoalData={
              // kinda like mongodb syntax
              // read here for more info:
              // https://stackoverflow.com/questions/29537299/react-how-to-update-state-item1-in-state-using-setstate
              (gd) => props.setGoalData(update(props.goalData, { [i]: { $set: gd } }))
            }
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
          // add gd to the goal data
          props.setGoalData(update(props.goalData, { $push: [gd] }));
        }}
      />
    </DisplayModal>
  </>
}

export default ManageGoalTable;
