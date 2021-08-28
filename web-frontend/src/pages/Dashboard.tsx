import { Row, Container, Col } from 'react-bootstrap';
import { Async, AsyncProps } from 'react-async';
import update from 'immutability-helper';
import { Loader, Section } from '@innexgo/common-react-components';
import ErrorMessage from '../components/ErrorMessage';
import DashboardLayout from '../components/DashboardLayout';
import { TemplateData } from '../components/ManageGoalTemplate';
import { TagData } from '../components/ManageNamedEntity';
import ManageGoalTable from '../components/ManageGoalTable';
import { ManageGoalData } from '../components/ManageGoal';
import { goalDataView, goalEventView, namedEntityDataView, namedEntityPatternView, goalTemplateDataView, goalTemplatePatternView, } from '@innexgo/frontend-todo-app-api';
import { unwrap } from '@innexgo/frontend-common';

import {AuthenticatedComponentProps} from '@innexgo/auth-react-components';

type DashboardData = {
  data: ManageGoalData[],
  tags: TagData[],
  templates: TemplateData[],
}

const loadDashboardData = async (props: AsyncProps<DashboardData>) => {

  const goalData =
    await goalDataView({
      creatorUserId: [props.apiKey.creatorUserId],
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


  // join goal data to goal events
  const data = goalData.map(gd => ({
    gd,
    ge: goalEvents.find(ge => ge.goal.goalId === gd.goal.goalId)
  }));

  const goalTemplateData = await goalTemplateDataView({
    creatorUserId: [props.apiKey.creatorUserId],
    active: true,
    onlyRecent: true,
    apiKey: props.apiKey.key,
  })
    .then(unwrap)

  const namedEntityData = await namedEntityDataView({
    creatorUserId: [props.apiKey.creatorUserId],
    active: true,
    onlyRecent: true,
    apiKey: props.apiKey.key,
  })
    .then(unwrap)

  const namedEntityPatterns = await namedEntityPatternView({
    namedEntityId: namedEntityData.map(gtd => gtd.namedEntity.namedEntityId),
    active: true,
    onlyRecent: true,
    apiKey: props.apiKey.key
  })
    .then(unwrap);

  // group patterns by tag
  const tags = namedEntityData.map(ned => ({
    ned,
    nep: namedEntityPatterns.filter(nep => nep.namedEntity.namedEntityId === ned.namedEntity.namedEntityId)
  }));

  const goalTemplatePatterns = await goalTemplatePatternView({
    goalTemplateId: goalTemplateData.map(gtd => gtd.goalTemplate.goalTemplateId),
    active: true,
    onlyRecent: true,
    apiKey: props.apiKey.key
  })
    .then(unwrap);

  // group patterns by template
  const templates = goalTemplateData.map(gtd => ({
    gtd,
    gtp: goalTemplatePatterns.filter(gtp => gtp.goalTemplate.goalTemplateId === gtd.goalTemplate.goalTemplateId)
  }));

  return {
    data,
    tags,
    templates,
  }
}

function Dashboard(props: AuthenticatedComponentProps) {
  return <DashboardLayout {...props}>
    <Container fluid className="py-4 px-4">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Section id="goalIntents" name="My Goals">
            <Async promiseFn={loadDashboardData} apiKey={props.apiKey}>
              {({ setData }) => <>
                <Async.Pending><Loader /></Async.Pending>
                <Async.Rejected>
                  {e => <ErrorMessage error={e} />}
                </Async.Rejected>
                <Async.Fulfilled<DashboardData>>{dd =>
                  <ManageGoalTable
                    data={dd.data}
                    setData={(d) => setData(update(dd, { data: { $set: d } }))}
                    tags={dd.tags}
                    templates={dd.templates}
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
