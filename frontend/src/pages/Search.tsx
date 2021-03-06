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
import { Formik, FormikHelpers, FormikErrors } from 'formik'

type SearchProps = {
    apiKey: ApiKey;
    postSubmit: (a: GoalData[]) => void;
  }
  
  function SearchForm(props: SearchProps) {
    type SearchValue = {search:string}
  
    const onSubmit = async (values: SearchValue, fprops: FormikHelpers<SearchValue>) => {
  
      let errors: FormikErrors<SearchValue> = {};
  
      // Validate input
  
      let hasError = false;
      fprops.setErrors(errors);
      if (hasError) {
        return;
      }
  
      const maybeGoalData = await viewGoalData({
        creatorUserId: props.apiKey.creator.userId,
        onlyRecent: true,
        partialName: values.search,
        status: "PENDING",
        apiKey: props.apiKey.key,
      });
  
      if (isApiErrorCode(maybeGoalData)) {
        switch (maybeGoalData) {
          case "VERIFICATION_CHALLENGE_NONEXISTENT": {
            fprops.setStatus({
              failureResult: "This registration link is invalid.",
              successResult: ""
            });
            break;
          }
          case "VERIFICATION_CHALLENGE_TIMED_OUT": {
            fprops.setStatus({
              failureResult: "This registration link has timed out.",
              successResult: ""
            });
            break;
          }
          case "USER_EXISTENT": {
            fprops.setStatus({
              failureResult: "This user already exists.",
              successResult: ""
            });
            break;
          }
          default: {
            fprops.setStatus({
              failureResult: "An unknown or network error has occured while trying to register.",
              successResult: ""
            });
            break;
          }
        }
        return;
      }
  
      fprops.setStatus({
        failureResult: "",
        successResult: "User Created"
      });
      // execute callback
      props.postSubmit(maybeGoalData);
    }
  
    return <>
      <Formik<SearchValue>
        onSubmit={onSubmit}
        initialValues={{
          search: "",
        }}
        initialStatus={{
          failureResult: "",
          successResult: ""
        }}
      >
        {(fprops) => <>
          <Form
            noValidate
            onSubmit={fprops.handleSubmit} >
            <div hidden={fprops.status.successResult !== ""}>
            <Form.Group >
              <Form.Label >Name</Form.Label>
              <Form.Control
                name="search"
                type="text"
                placeholder="Search"
                value={fprops.values.search}
                onChange={e => fprops.setFieldValue("search", e.target.value)}
                isInvalid={!!fprops.errors.search}
              />
              <Form.Control.Feedback type="invalid">{fprops.errors.search}</Form.Control.Feedback>
            </Form.Group>
              <Button type="submit">Search</Button>
              <br />
              <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
            </div>
            <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
          </Form>
        </>}
      </Formik>
    </>
  }

function Search(props: AuthenticatedComponentProps) {
  
  const [search, setSearch] = React.useState<GoalData[]>([]);
  return <DashboardLayout {...props}>
    <Container fluid className="py-4 px-4">
        <SearchForm
        apiKey={props.apiKey}
        postSubmit={setSearch}/>
        {search.map(d =>
            <Card key={d.goalDataId}>
                <ManageGoal goalId={d.goal.goalId} apiKey={props.apiKey} />
            </Card>
        )}
    </Container>
  </DashboardLayout>
}

export default Search;
