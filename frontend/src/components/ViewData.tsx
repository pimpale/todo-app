import React from 'react'
import { Table } from 'react-bootstrap';
import format from 'date-fns/format';

const ToggleExpandButton = (props: { expand: boolean, setExpand: (b: boolean) => void }) =>
  <button className="btn btn-link px-0 py-0 float-right"
    style={{
      fontWeight: "normal" as const,
      fontSize: "0.875rem"
    }}
    onClick={_ => props.setExpand(!props.expand)}>
    {props.expand ? "Less" : "More"}
  </button>

export const ViewUser = (props: {
  user: User,
  expanded: boolean
}) => {
  const [expanded, setExpanded] = React.useState(props.expanded);
  if (!expanded) {
    return <span>
      {props.user.name}
      <ToggleExpandButton expand={expanded} setExpand={setExpanded} />
    </span>
  } else {
    return <div>
      <Table hover bordered>
        <tbody>
          <tr>
            <th>Name</th>
            <td>{props.user.name}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{props.user.email}</td>
          </tr>
        </tbody>
      </Table>
      <ToggleExpandButton expand={expanded} setExpand={setExpanded} />
    </div>
  }
}

