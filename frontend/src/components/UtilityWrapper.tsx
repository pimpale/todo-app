import React from 'react';
import { OverlayTrigger, Card, CardProps } from 'react-bootstrap';
import { Help } from '@material-ui/icons';

type NoChildrenCardProps = Omit<CardProps, 'children'|'title'>

type UtilityWrapperProps = NoChildrenCardProps & {
  title: string
  children: [React.ReactElement, React.ReactElement]
} 

function UtilityWrapper(props: UtilityWrapperProps) {
  return <Card {...(props as NoChildrenCardProps )}>
    <Card.Body>
      <div className="d-flex justify-content-between">
        <Card.Title >{props.title}</Card.Title>
        <OverlayTrigger
          overlay={props.children[0]}
          placement="auto"
        >
          <button type="button" className="btn btn-sm">
            <Help />
          </button>
        </OverlayTrigger>
      </div>
      {props.children[1]}
    </Card.Body>
  </Card>
}

export default UtilityWrapper;
