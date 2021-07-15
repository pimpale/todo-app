import { Table } from 'react-bootstrap';
import update from 'immutability-helper';
import ManageGoalIntent from '../components/ManageGoalIntent';
import CreateGoalIntent from '../components/CreateGoalIntent';
import ManageGoal from '../components/ManageGoal';
import { ApiKey } from '@innexgo/frontend-auth-api';
import { GoalData, GoalIntentData } from '../utils/utils';

type ManageHybridGoalTableProps = {
  goalIntentData: GoalIntentData[],
  setGoalIntentData: (gids: GoalIntentData[]) => void,
  goalData: GoalData[],
  setGoalData: (gds: GoalData[]) => void,
  apiKey: ApiKey,
  mutable: boolean,
  addable: boolean,
  showInactive: boolean,
}

function ManageHybridGoalTable(props: ManageHybridGoalTableProps) {

  // this list has an object consisting of both the index in the real array and the object constructs a new objec
  const activeGoalIntents = props.goalIntentData
    .map((gid, i) => ({ gid, i }))
    .filter(({ gid }) => props.showInactive || gid.active);

  const activeGoals = props.goalData
    .map((gd, i) => ({ gd, i }))
    .filter(({ gd }) => props.showInactive || gd.status !== "CANCEL");

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
          <th>Time</th>
          <th>Utility</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {activeGoalIntents.length !== 0 && activeGoals.length !== 0 ? <> </> :
          <tr><td className="text-center">No Goals Yet</td></tr>
        }
        {activeGoalIntents
          // reverse in order to see newest first
          .reverse()
          .map(({ gid, i }) =>
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
        {activeGoals
          // reverse in order to see newest first
          .reverse()
          .map(({ gd, i }) =>
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
  </>
}

export default ManageHybridGoalTable;
