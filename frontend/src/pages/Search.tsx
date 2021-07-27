import React from 'react'
import { Button, Container, Form, Row, Col } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout';
import { ManageGoalData } from '../components/ManageGoal';
import ManageGoalTable from '../components/ManageGoalTable';
import { GoalData, goalDataView, GoalEvent, goalEventView } from '../utils/utils';
import { isErr, unwrap } from '@innexgo/frontend-common';

import { ApiKey, AuthenticatedComponentProps } from '@innexgo/frontend-auth-api';

import { Formik, FormikHelpers, FormikErrors } from 'formik'

type SearchProps = {
  apiKey: ApiKey;
  postSubmit: (a: { gd: GoalData, ge: GoalEvent | undefined }[]) => void;
}

function SearchForm(props: SearchProps) {
  type SearchValue = { search: string }

  const onSubmit = async (values: SearchValue, fprops: FormikHelpers<SearchValue>) => {

    let errors: FormikErrors<SearchValue> = {};

    // Validate input

    let hasError = false;
    fprops.setErrors(errors);
    if (hasError) {
      return;
    }

    const maybeGoalData = await goalDataView({
      creatorUserId: [props.apiKey.creator.userId],
      status: ["PENDING"],
      onlyRecent: true,
      apiKey: props.apiKey.key,
    });

    if (isErr(maybeGoalData)) {
      switch (maybeGoalData.Err) {
        case "UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while trying to update goal.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    const goalData = maybeGoalData.Ok
      // filter for name match
      .filter(gd => gd.name.includes(values.search));

    const goalEvents = await goalEventView({
      goalId: goalData.map(gd => gd.goal.goalId),
      onlyRecent: true,
      apiKey: props.apiKey.key
    }).then(unwrap);

    const data = goalData
      // join goal event
      .map(gd => ({ gd, ge: goalEvents.find(ge => ge.goal.goalId === gd.goal.goalId) }));


    // execute callback
    props.postSubmit(data);

    fprops.setStatus({
      failureResult: "",
      successResult: "Successfully searched"
    });
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
          <Form.Group >
            <h4>Search by Name</h4>
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
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      </>}
    </Formik>
  </>
}

function Search(props: AuthenticatedComponentProps) {
  const [searchResults, setSearchResults] = React.useState<ManageGoalData[]>([]);
  return <DashboardLayout {...props}>
    <Container fluid className="py-4 px-4">
      <SearchForm
        apiKey={props.apiKey}
        postSubmit={setSearchResults}
      />
      <Row className="justify-content-md-center">
        <Col md={8}>
          <ManageGoalTable
            data={searchResults}
            setData={setSearchResults}
            apiKey={props.apiKey}
            addable={false}
            mutable
            showInactive={false}
          />
        </Col>
      </Row>
    </Container>
  </DashboardLayout>
}

export default Search;
