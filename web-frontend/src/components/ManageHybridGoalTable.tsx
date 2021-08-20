import { Table } from 'react-bootstrap';
import update from 'immutability-helper';
import ManageGoalIntent from '../components/ManageGoalIntent';
import CreateHybridGoal from '../components/CreateHybridGoal';
import { TemplateData } from '../components/ManageGoalTemplate';
import { TagData } from '../components/ManageNamedEntity';
import ManageGoal, { ManageGoalData } from '../components/ManageGoal';
import { ApiKey } from '@innexgo/frontend-auth-api';
import { GoalIntentData } from '@innexgo/frontend-todo-app-api';


type ManageHybridGoalTableProps = {
  goalIntentData: GoalIntentData[],
  setGoalIntentData: (gids: GoalIntentData[]) => void,
  data: ManageGoalData[],
  setData: (d: ManageGoalData[]) => void,
  tags: TagData[],
  templates: TemplateData[],
  apiKey: ApiKey,
  mutable: boolean,
  addable: boolean,
  showInactive: boolean,
}

function ManageHybridGoalTable(props: ManageHybridGoalTableProps) {

  // this list has an object consisting of both the index in the real array and the object constructs a new objec
  const activeGoalIntents = props.goalIntentData
    // enumerate data + index
    .map((gid, i) => ({ gid, i }))
    // filter inactive
    .filter(({ gid }) => props.showInactive || gid.active);

  const activeGoalDataEvents = props.data
    // enumerate data + index
    .map((d, i) => ({ d, i }))
    // filter inactive
    .filter(({ d }) => props.showInactive || d.gd.status !== "CANCEL")

  return <>
    {!props.addable ? false :
      <CreateHybridGoal
        apiKey={props.apiKey}
        tags={props.tags}
        templates={props.templates}
        postSubmit={(gd) => {
          props.setData(update(props.data, { $push: [{ gd, ge: undefined }] }));
        }}
      />
    }
    <Table hover bordered className="mt-2">
      <thead>
        <tr>
          <th>Name</th>
          <th>Time</th>
          <th>Utility</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {activeGoalIntents.length === 0 && activeGoalDataEvents.length === 0
          ? <tr><td className="text-center" colSpan={4}>No Goals Yet</td></tr>
          : <> </>
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
        {activeGoalDataEvents
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
  </>
}

export default ManageHybridGoalTable;
