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
        {props.goalIntentData.filter(gid => props.showInactive || gid.active).length !== 0 ? <> </> :
          <tr><td className="text-center">No Active GoalIntents</td></tr>
        }
        {props.goalIntentData
          // hide inactive unless show enabled
          .map((gid, i) => props.showInactive || gid.active
            ?
            <ManageGoalIntent
              key={i}
              goalIntentData={gid}
              setGoalIntentData={
                // https://stackoverflow.com/questions/29537299/react-how-to-update-state-item1-in-state-using-setstate
                (gid) => {
                  props.setGoalIntentData(update(props.goalIntentData, { [i]: { $set: gid } }))
                }
              }
              apiKey={props.apiKey}
            />
            :
            <div />
          )}
      </tbody>
    </Table>
  </>
}

export default ManageGoalIntentTable;
