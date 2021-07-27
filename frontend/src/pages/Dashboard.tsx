import { Row, Container, Col } from 'react-bootstrap';
import { Async, AsyncProps } from 'react-async';
import update from 'immutability-helper';
import Section from '../components/Section';
import ErrorMessage from '../components/ErrorMessage';
import DashboardLayout from '../components/DashboardLayout';
import ManageHybridGoalTable from '../components/ManageHybridGoalTable';
import { ManageGoalData } from '../components/ManageGoal';
import Loader from '../components/Loader';
import { GoalIntentData, goalIntentDataView, GoalData, goalDataView, GoalEvent, goalEventView } from '../utils/utils';
import { unwrap } from '@innexgo/frontend-common';

import { AuthenticatedComponentProps } from '@innexgo/frontend-auth-api';

type DashboardData = {
  goalIntentData: GoalIntentData[],
  data: ManageGoalData[],
}

const loadDashboardData = async (props: AsyncProps<DashboardData>) => {
  const goalIntentData = await goalIntentDataView({
    creatorUserId: [props.apiKey.creator.userId],
    onlyRecent: true,
    active: true,
    responded: false,
    apiKey: props.apiKey.key,
  })
    .then(unwrap);

  const goalData =
    await goalDataView({
      creatorUserId: [props.apiKey.creator.userId],
      status: ["PENDING"],
      onlyRecent: true,
      apiKey: props.apiKey.key,
    })
      .then(unwrap);

  const goalEvents = await goalEventView({
    goalId: goalData.map(gd => gd.goal.goalId),
    onlyRecent: true,
    apiKey: props.apiKey.key,
  })
    .then(unwrap)

  const data = goalData
    // join goal event
    .map(gd => ({ gd, ge: goalEvents.find(ge => ge.goal.goalId === gd.goal.goalId) }));

  return {
    goalIntentData,
    data,
  }
}

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
                    data={dd.data}
                    setData={(d) => setData(update(dd, { data: { $set: d } }))}
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
