import React from 'react'
import { Button, Container, Form, Row, Col } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout';
import ManageGoalTable from '../components/ManageGoalTable';
import { GoalData, goalDataView } from '../utils/utils';
import { isErr } from '@innexgo/frontend-common';

import { ApiKey, AuthenticatedComponentProps } from '@innexgo/frontend-auth-api';

import { Formik, FormikHelpers, FormikErrors } from 'formik'

type SearchProps = {
  apiKey: ApiKey;
  postSubmit: (a: GoalData[]) => void;
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
      creatorUserId: props.apiKey.creator.userId,
      onlyRecent: true,
      partialName: values.search,
      status: "PENDING",
      apiKey: props.apiKey.key,
    });

    if (isErr(maybeGoalData)) {
      switch (maybeGoalData.Err) {
        case "API_KEY_UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out.",
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
      successResult: "Successfully searched"
    });
    // execute callback
    props.postSubmit(maybeGoalData.Ok);
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
  const [search, setSearch] = React.useState<GoalData[]>([]);
  return <DashboardLayout {...props}>
    <Container fluid className="py-4 px-4">
      <SearchForm
        apiKey={props.apiKey}
        postSubmit={setSearch}
      />
      <Row className="justify-content-md-center">
        <Col md={8}>
          <ManageGoalTable
            goalData={search}
            setGoalData={setSearch}
            apiKey={props.apiKey}
            addable={false}
            mutable
          />
        </Col>
      </Row>
    </Container>
  </DashboardLayout>
}

export default Search;
