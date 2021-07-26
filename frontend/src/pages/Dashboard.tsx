import { Row, Container, Col } from 'react-bootstrap';
import { Async, AsyncProps } from 'react-async';
import update from 'immutability-helper';
import Section from '../components/Section';
import ErrorMessage from '../components/ErrorMessage';
import DashboardLayout from '../components/DashboardLayout';
import ManageHybridGoalTable from '../components/ManageHybridGoalTable';
import Loader from '../components/Loader';
import { GoalIntentData, goalIntentDataView, GoalData, goalDataView } from '../utils/utils';
import { unwrap } from '@innexgo/frontend-common';

import { AuthenticatedComponentProps } from '@innexgo/frontend-auth-api';

type DashboardData = {
  goalIntentData: GoalIntentData[],
  goalData: GoalData[],
}

const loadDashboardData = async (props: AsyncProps<DashboardData>) => ({
  goalIntentData: await goalIntentDataView({
    creatorUserId: props.apiKey.creator.userId,
    onlyRecent: true,
    active: true,
    responded: false,
    apiKey: props.apiKey.key,
  })
    .then(unwrap),
  goalData: await goalDataView({
    creatorUserId: props.apiKey.creator.userId,
    onlyRecent: true,
    status: "PENDING",
    apiKey: props.apiKey.key,
  })
    .then(unwrap)
})

function Dashboard(props: AuthenticatedComponentProps) {
  return <DashboardLayout {...props}>
    <Container fluid className="py-4 px-4">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Section id="goalIntents" name="My Goals">
            <Async promiseFn={loadDashboardData} apiKey={props.apiKey}>
              {({ setData }) => <>
                <Async.Pending><Loader /></Async.Pending>
                <Async.Rejected>
                  {e => <ErrorMessage error={e} />}
                </Async.Rejected>
                <Async.Fulfilled<DashboardData>>{dd =>
                  <ManageHybridGoalTable
                    goalIntentData={dd.goalIntentData}
                    setGoalIntentData={(gids) => setData(update(dd, { goalIntentData: { $set: gids } }))}
                    goalData={dd.goalData}
                    setGoalData={(gds) => setData(update(dd, { goalData: { $set: gds } }))}
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
