import React from 'react';
import { Popover, OverlayTrigger, Card, CardProps } from 'react-bootstrap';
import { InfoCircle } from 'react-bootstrap-icons';

type NoChildrenCardProps = Omit<CardProps, 'children' | 'title'>

type UtilityWrapperProps = NoChildrenCardProps & {
  title: string
  children: [React.ReactElement, React.ReactElement]
}

function UtilityWrapper(props: UtilityWrapperProps) {
  return <Card {...(props as NoChildrenCardProps)}>
    <Card.Body>
      <div className="d-flex justify-content-between">
        <Card.Title >{props.title}</Card.Title>
        <OverlayTrigger
          trigger="click"
          placement="auto"
          overlay={
            <Popover id="information-tooltip">
              <Popover.Header as="h3">Help</Popover.Header>
              <Popover.Body>
                {props.children[0]}
              </Popover.Body>
            </Popover>
          }
        >
          <button type="button" className="btn btn-sm">
            <InfoCircle />
          </button>
        </OverlayTrigger>
      </div>
      {props.children[1]}
    </Card.Body>
  </Card>
}

export default UtilityWrapper;
