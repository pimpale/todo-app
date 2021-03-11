import React from 'react'
import { Row, Container, Col, Form} from 'react-bootstrap';
import { Async, AsyncProps } from 'react-async';
import Section from '../components/Section';
import DashboardLayout from '../components/DashboardLayout';
import ManageGoalTable from '../components/ManageGoalTable';
import Loader from '../components/Loader';
import { viewGoalData, isApiErrorCode} from '../utils/utils';

type DashboardData = {
  goalData: GoalData
}

const loadDashboardData = async (props: AsyncProps<DashboardData[]>) => {
  const maybeGoalData = await viewGoalData({
    creatorUserId: props.apiKey.creator.userId,
    onlyRecent: true,
    status: "PENDING",
    apiKey: props.apiKey.key,
  });

  if (isApiErrorCode(maybeGoalData)) {
    throw Error;
  }

  return maybeGoalData.map(goalData => ({ goalData }));
}

function Dashboard(props: AuthenticatedComponentProps) {
  return <DashboardLayout {...props}>
    <Container fluid className="py-4 px-4">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Section id="goals" name="My Goals">
            <Async promiseFn={loadDashboardData} apiKey={props.apiKey}>
              {({ reload }) => <>
                <Async.Pending><Loader /></Async.Pending>
                <Async.Rejected>
                  <Form.Text className="text-danger">An unknown error has occured while loading data.</Form.Text>
                </Async.Rejected>
                <Async.Fulfilled<DashboardData[]>>{ddata =>
                  <ManageGoalTable
                    reload={reload}
                    apiKey={props.apiKey}
                    goalIds={ddata.map(gd => gd.goalData.goal.goalId)}
                    mutable
                    addable
                  />
                }</Async.Fulfilled>
              </>}
            </Async>
          </Section>
        </Col>
      </Row>
    </Container>
  </DashboardLayout>
}

export default Dashboard;
