import { Row, Container, Col } from 'react-bootstrap';
import { Async, AsyncProps } from 'react-async';
import Section from '../components/Section';
import ErrorMessage from '../components/ErrorMessage';
import DashboardLayout from '../components/DashboardLayout';
import ManageGoalTable from '../components/ManageGoalTable';
import ManageGoalIntentTable from '../components/ManageGoalIntentTable';
import Loader from '../components/Loader';
import { GoalIntentData, goalIntentDataView, GoalData, goalDataView } from '../utils/utils';
import { isErr } from '@innexgo/frontend-common';

import { AuthenticatedComponentProps } from '@innexgo/frontend-auth-api';

const loadGoalIntentData = async (props: AsyncProps<GoalIntentData[]>) => {
  const maybeGoalIntentData = await goalIntentDataView({
    creatorUserId: props.apiKey.creator.userId,
    onlyRecent: true,
    active: true,
    responded: false,
    apiKey: props.apiKey.key,
  });

  if (isErr(maybeGoalIntentData)) {
    throw Error(maybeGoalIntentData.Err);
  }

  return maybeGoalIntentData.Ok;
}

const loadGoalData = async (props: AsyncProps<GoalData[]>) => {
  const maybeGoalData = await goalDataView({
    creatorUserId: props.apiKey.creator.userId,
    onlyRecent: true,
    status: "PENDING",
    apiKey: props.apiKey.key,
  });

  if (isErr(maybeGoalData)) {
    throw Error(maybeGoalData.Err);
  }

  return maybeGoalData.Ok;
}

function Dashboard(props: AuthenticatedComponentProps) {
  return <DashboardLayout {...props}>
    <Container fluid className="py-4 px-4">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Section id="goalIntents" name="My GoalIntents">
            <Async promiseFn={loadGoalIntentData} apiKey={props.apiKey}>
              {({ setData }) => <>
                <Async.Pending><Loader /></Async.Pending>
                <Async.Rejected>
                  {e => <ErrorMessage error={e} />}
                </Async.Rejected>
                <Async.Fulfilled<GoalIntentData[]>>{gids =>
                  <ManageGoalIntentTable
                    goalIntentData={gids}
                    setGoalIntentData={setData}
                    apiKey={props.apiKey}
                    mutable
                    addable
                    showInactive={false}
                  />
                }</Async.Fulfilled>
              </>}
            </Async>
          </Section>
          <Section id="goals" name="My Goals">
            <Async promiseFn={loadGoalData} apiKey={props.apiKey}>
              {({ setData }) => <>
                <Async.Pending><Loader /></Async.Pending>
                <Async.Rejected>
                  {e => <ErrorMessage error={e} />}
                </Async.Rejected>
                <Async.Fulfilled<GoalData[]>>{gds =>
                  <ManageGoalTable
                    goalData={gds}
                    setGoalData={setData}
                    apiKey={props.apiKey}
                    mutable
                    addable
                    showInactive={false}
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
