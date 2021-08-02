
import { Table } from 'react-bootstrap';
import update from 'immutability-helper';
import CreateGoalTemplate from '../components/CreateGoalTemplate';
import ManageGoalTemplate, { TemplateData } from '../components/ManageGoalTemplate';
import { ApiKey } from '@innexgo/frontend-auth-api';


type ManageGoalTemplateTableProps = {
  templates: TemplateData[],
  setTemplates: (templates: TemplateData[]) => void,
  apiKey: ApiKey,
  mutable: boolean,
  addable: boolean,
  showInactive: boolean,
}

function ManageGoalTemplateTable(props: ManageGoalTemplateTableProps) {

  // this list has an object consisting of both the index in the real array and the object constructs a new objec
  const activeTemplates = props.templates
    // enumerate data + index
    .map((t, i) => ({ t, i }))
    // filter inactive
    .filter(({ t }) => props.showInactive || t.gtd.active);

  return <>
    {!props.addable ? false :
      <CreateGoalTemplate
        apiKey={props.apiKey}
        postSubmit={(gtd) => {
          props.setTemplates(update(props.templates, { $push: [gtd] }));
        }}
      />
    }
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
        {activeTemplates.length === 0
          ? <tr><td className="text-center" colSpan={4}>No Templates</td></tr>
          : <> </>
        }
        {activeTemplates
          // reverse in order to see newest first
          .reverse()
          .map(({ t, i }) =>
            <ManageGoalTemplate
              key={i}
              mutable={props.mutable}
              data={t}
              setData={(t) => props.setTemplates(update(props.templates, { [i]: { $set: t } }))}
              apiKey={props.apiKey}
            />
          )}
      </tbody>
    </Table>
  </>
}

export default ManageGoalTemplateTable;
