import React from 'react'
import { Table, Row, Container, Col, Form, Tabs, Tab } from 'react-bootstrap';
import { Async, AsyncProps } from 'react-async';
import Section from '../components/Section';
import DashboardLayout from '../components/DashboardLayout';
import DisplayModal from '../components/DisplayModal';
import { Add } from '@material-ui/icons'
import Loader from '../components/Loader';
import ManageGoal from '../components/ManageGoal';
import CreateGoal from '../components/CreateGoal';
import { viewGoalData, isApiErrorCode, viewPastEventData } from '../utils/utils';

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
  const [showCreateGoal, setShowCreateGoal] = React.useState(false);

  return <DashboardLayout {...props}>
    <Container fluid className="py-4 px-4">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Section id="goals" name="My Goals">
            <Async promiseFn={loadDashboardData} apiKey={props.apiKey}>
              {({reload}) => <>
                <Async.Pending><Loader /></Async.Pending>
                <Async.Rejected>
                  <Form.Text className="text-danger">An unknown error has occured while loading data.</Form.Text>
                </Async.Rejected>
                <Async.Fulfilled<DashboardData[]>>{ddata => <>
                  <Table hover bordered>
                    <thead>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Utility</th>
                      <th>Actions</th>
                    </thead>
                    <tr><td colSpan={4} className="px-0 py-0">
                      <button
                        className="h-100 w-100 mx-0 my-0"
                        style={{ borderStyle: 'dashed', borderWidth: "medium" }}
                        onClick={()=>setShowCreateGoal(true)}
                      >
                        <Add className="mx-auto my-auto text-muted" fontSize="large" />
                      </button>
                    </td></tr>
                    {ddata.map(d =>
                      <tr>
                        <ManageGoal
                          goalId={d.goalData.goal.goalId}
                          apiKey={props.apiKey}
                          onChange={reload}
                        />
                      </tr>
                    )}
                  </Table>
                  <DisplayModal
                    title="New Goal"
                    show={showCreateGoal}
                    onClose={() => setShowCreateGoal(false)}
                  >
                    <CreateGoal
                      apiKey={props.apiKey}
                      postSubmit={() => {
                          setShowCreateGoal(false);
                          reload();
                      }}
                    />
                  </DisplayModal>
                </>}</Async.Fulfilled>
              </>}
            </Async>
          </Section>
        </Col>
      </Row>
    </Container>
  </DashboardLayout>
}

export default Dashboard;
