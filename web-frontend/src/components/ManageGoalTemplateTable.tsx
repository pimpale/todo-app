import React from 'react';
import { Table } from 'react-bootstrap';
import update from 'immutability-helper';
import CreateGoalTemplate from '../components/CreateGoalTemplate';
import ManageGoalTemplate, { TemplateData } from '../components/ManageGoalTemplate';
import { ApiKey } from '@innexgo/frontend-auth-api';
import { AddButton, DisplayModal } from '@innexgo/common-react-components';


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


  const [showCreateTemplate, setShowCreateTemplate] = React.useState(false);

  return <>
    <Table hover bordered>
      <thead>
        <tr>
          <th>Name</th>
          <th>Estimated Duration</th>
          <th>Patterns</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr hidden={!props.addable}>
          <td colSpan={5} className="p-0">
            <AddButton onClick={() => setShowCreateTemplate(true)} />
          </td>
        </tr>
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
    <DisplayModal
      title="New Template"
      show={showCreateTemplate}
      onClose={() => setShowCreateTemplate(false)}
    >
      <CreateGoalTemplate
        apiKey={props.apiKey}
        postSubmit={(gtd) => {
          props.setTemplates(update(props.templates, { $push: [gtd] }));
          setShowCreateTemplate(false);
        }}
      />
    </DisplayModal>

  </>
}

export default ManageGoalTemplateTable;
