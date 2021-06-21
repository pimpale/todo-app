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

