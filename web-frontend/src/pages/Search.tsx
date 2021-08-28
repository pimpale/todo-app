import React from 'react'
import { TemplateData } from '../components/ManageGoalTemplate';
import { TagData } from '../components/ManageNamedEntity';
import { Loader } from '@innexgo/common-react-components';
import { Button, Container, Form, Row, Col } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout';
import { ManageGoalData } from '../components/ManageGoal';
import ManageGoalTable from '../components/ManageGoalTable';
import { Async, AsyncProps } from 'react-async';
import { GoalData, goalDataView, GoalEvent, goalEventView } from '@innexgo/frontend-todo-app-api';
import { isErr, unwrap } from '@innexgo/frontend-common';
import ErrorMessage from '../components/ErrorMessage';

import { ApiKey } from '@innexgo/frontend-auth-api';
import { AuthenticatedComponentProps } from '@innexgo/auth-react-components';

import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { namedEntityDataView, namedEntityPatternView, goalTemplateDataView, goalTemplatePatternView, } from '@innexgo/frontend-todo-app-api';

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
      creatorUserId: [props.apiKey.creatorUserId],
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

type SearchData = {
  tags: TagData[],
  templates: TemplateData[],
}

const loadSearchData = async (props: AsyncProps<SearchData>) => {
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
    tags,
    templates,
  }
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
          <Async promiseFn={loadSearchData} apiKey={props.apiKey}>
            <Async.Pending><Loader /></Async.Pending>
            <Async.Rejected>
              {e => <ErrorMessage error={e} />}
            </Async.Rejected>
            <Async.Fulfilled<SearchData>>{sd =>
              <ManageGoalTable
                data={searchResults}
                setData={setSearchResults}
                tags={sd.tags}
                templates={sd.templates}
                apiKey={props.apiKey}
                addable={false}
                mutable
                showInactive={false}
              />
            }</Async.Fulfilled>
          </Async>
        </Col>
      </Row>
    </Container>
  </DashboardLayout>
}

export default Search;
