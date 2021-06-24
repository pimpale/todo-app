import { Table } from 'react-bootstrap';
import update from 'immutability-helper';
import ManageGoalIntent from '../components/ManageGoalIntent';
import CreateGoalIntent from '../components/CreateGoalIntent';
import { ApiKey } from '@innexgo/frontend-auth-api';
import { GoalIntentData } from '../utils/utils';

type ManageGoalIntentTableProps = {
  goalIntentData: GoalIntentData[],
  setGoalIntentData: (gids: GoalIntentData[]) => void,
  apiKey: ApiKey,
  mutable: boolean,
  addable: boolean,
  showInactive: boolean,
}

function ManageGoalIntentTable(props: ManageGoalIntentTableProps) {

  // this list has an object consisting of both the index in the real array and the object constructs a new objec
  const actives = props.goalIntentData
    .map((gid, i) => ({ gid, i }))
    .filter(({ gid }) => props.showInactive || gid.active);

  return <>
    <CreateGoalIntent
      apiKey={props.apiKey}
      postSubmit={(gid) => {
        props.setGoalIntentData(update(props.goalIntentData, { $push: [gid] }));
      }}
    />
    <Table hover bordered>
      <thead>
        <tr>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        {actives.length !== 0 ? <> </> :
          <tr><td className="text-center">No Active GoalIntents</td></tr>
        }
        {actives.map(({ gid, i }) =>
          <ManageGoalIntent
            key={i}
            apiKey={props.apiKey}
            goalIntentData={gid}
            setGoalIntentData={
              // https://stackoverflow.com/questions/29537299/react-how-to-update-state-item1-in-state-using-setstate
              (gid) => {
                props.setGoalIntentData(update(props.goalIntentData, { [i]: { $set: gid } }))
              }
            }
            mutable={props.mutable}
          />
        )}
      </tbody>
    </Table>
  </>
}

export default ManageGoalIntentTable;
