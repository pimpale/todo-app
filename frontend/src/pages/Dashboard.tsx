import React from 'react'
import { Table, Button, Container, Card, Form, Tabs, Tab } from 'react-bootstrap';
import { Add } from '@material-ui/icons'
import { Async, AsyncProps } from 'react-async';

import DashboardLayout from '../components/DashboardLayout';
import Section from '../components/Section';
import Loader from '../components/Loader';
import DisplayModal from '../components/DisplayModal';
import { ViewUser, } from '../components/ViewData';
import CreateTask from '../components/CreateTask';
import ManageTask from '../components/ManageTask';
import { viewTask, viewGoalData, isApiErrorCode } from '../utils/utils';
import format from "date-fns/format";


type DashboardData = {
  goalData: GoalData
  task: Task | null
}


const loadDashboardData = async (props: AsyncProps<DashboardData[]>) => {

  const maybeGoalData = await viewGoalData({
    creatorUserId: props.apiKey.creator.userId,
    onlyRecent: true,
    status: "PENDING",
    apiKey: props.apiKey.key
  });

  if (isApiErrorCode(maybeGoalData)) {
    throw Error;
  }

  return await Promise.all(
    maybeGoalData.map(async gd => {
      const maybeTask = await viewTask({
        goalId: gd.goal.goalId,
        onlyRecent: true,
        status: "VALID",
        apiKey: props.apiKey.key
      });

      if (isApiErrorCode(maybeTask) || maybeTask.length === 0) {
        return {
          goalData: gd,
          task: null
        }
      } else {
        return {
          goalData: gd,
          task: maybeTask[0]
        }
      }
    }))
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
            {ddata
                .filter(d => d.task !== null)
                .map(d =>
              <Card>
                <ManageTask taskId={d.task!.taskId} apiKey={props.apiKey} />
              </Card>
            )}
          </>}
          </Async.Fulfilled>
        </>}
      </Async>
    </Container>
  </DashboardLayout>
}

export default Dashboard;
