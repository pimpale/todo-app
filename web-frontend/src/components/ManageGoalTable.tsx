import { Table } from 'react-bootstrap';
import update from 'immutability-helper';
import CreateGoalTextbox from '../components/CreateGoalTextbox';
import { TemplateData } from '../components/ManageGoalTemplate';
import { TagData } from '../components/ManageNamedEntity';
import ManageGoal, { ManageGoalData } from '../components/ManageGoal';
import { ApiKey } from '@innexgo/frontend-auth-api';


type ManageGoalTableProps = {
  data: ManageGoalData[],
  setData: (d: ManageGoalData[]) => void,
  tags: TagData[],
  templates: TemplateData[],
  apiKey: ApiKey,
  mutable: boolean,
  addable: boolean,
  showInactive: boolean,
}

function ManageGoalTable(props: ManageGoalTableProps) {

  const activeGoalDataEvents = props.data
    // enumerate data + index
    .map((d, i) => ({ d, i }))
    // filter inactive
    .filter(({ d }) => props.showInactive || d.gd.status !== "CANCEL")

  return <>
    {!props.addable ? false :
      <CreateGoalTextbox
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
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {activeGoalDataEvents.length === 0
          ? <tr><td className="text-center" colSpan={4}>No Goals Yet</td></tr>
          : null
        }
        {activeGoalDataEvents
          // reverse in order to see newest first
          .reverse()
          .map(({ d, i }) =>
            <ManageGoal
              key={i}
              mutable={props.mutable}
              data={d}
              setData={
                // https://stackoverflow.com/questions/29537299/react-how-to-update-state-item1-in-state-using-setstate
                (d) => props.setData(update(props.data, { [i]: { $set: d } }))
              }
              apiKey={props.apiKey}
            />
          )}
      </tbody>
    </Table>
  </>
}

export default ManageGoalTable;
