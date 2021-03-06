import React from 'react'
import { Table, Button, Container, Card, Form, Tabs, Tab } from 'react-bootstrap';
import { Add } from '@material-ui/icons'
import { Async, AsyncProps } from 'react-async';

import DashboardLayout from '../components/DashboardLayout';
import Section from '../components/Section';
import Loader from '../components/Loader';
import DisplayModal from '../components/DisplayModal';
import { ViewUser, } from '../components/ViewData';
import CreateGoal from '../components/CreateGoal';
import CalendarSolver from '../components/CalendarSolver';
import ManageGoal from '../components/ManageGoal';
import { viewGoalData, isApiErrorCode, viewPastEventData } from '../utils/utils';
import format from "date-fns/format";

import SearchSingleGoal from '../components/SearchSingleGoal';

type DashboardData = {
  goalData: GoalData
}



const loadDashboardData = async (props: AsyncProps<DashboardData[]>) => {
  const maybeGoalData = await viewGoalData({
    creatorUserId: props.apiKey.creator.userId,
    onlyRecent: true,
    partialName: props.search,
    status: "PENDING",
    apiKey: props.apiKey.key,
  });
  
  if (isApiErrorCode(maybeGoalData)) {
    throw Error;
  }

  return maybeGoalData.map(goalData => ({ goalData:goalData }));
}

function Dashboard(props: AuthenticatedComponentProps) {

  return <DashboardLayout {...props}>
    <Container fluid className="py-4 px-4">
      <Async promiseFn={loadDashboardData} apiKey={props.apiKey}>
        {({ reload: reloadDashboardData }) => <>
          <Async.Pending><Loader /></Async.Pending>
          <Async.Rejected>
            <Form.Text className="text-danger">An unknown error has occured while loading data.</Form.Text>
          </Async.Rejected>
          <Async.Fulfilled<DashboardData[]>>{ddata => <>
            {ddata.map(d =>
              <Card key={d.goalData.goalDataId}>
                <ManageGoal goalId={d.goalData.goal.goalId} apiKey={props.apiKey} />
              </Card>
            )}
            <CalendarSolver goalData={ddata
              .map(d => d.goalData)
              .filter((gd): gd is GoalDataScheduled => gd.scheduled)
            }/>
          </>}
          </Async.Fulfilled>
        </>}
      </Async>
    </Container>
  </DashboardLayout>
}

export default Dashboard;
