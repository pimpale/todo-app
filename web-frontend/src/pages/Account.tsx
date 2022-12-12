import React from 'react';
import { Async, AsyncProps } from 'react-async';

import ErrorMessage from '../components/ErrorMessage';
import update from 'immutability-helper';

import { Row, Container, Col, Spinner } from 'react-bootstrap';
import DashboardLayout from '../components/DashboardLayout';
import { Section, WidgetWrapper } from '@innexgo/common-react-components';

import { ApiKey, UserData, Email, userDataView, emailView } from '@innexgo/frontend-auth-api'

import { AuthenticatedComponentProps, ManageUserData } from '@innexgo/auth-react-components';

import { unwrap, getFirstOr } from '@innexgo/frontend-common';

type AccountData = {
  userData: UserData
  ownEmail: Email
}

const loadAccountData = async (props: AsyncProps<AccountData>) => {
  const userData = await userDataView({
    creatorUserId: [props.apiKey.creatorUserId],
    onlyRecent: true,
    apiKey: props.apiKey.key,
  })
    .then(unwrap)
    .then(x => getFirstOr(x, "NOT_FOUND"))
    .then(unwrap);

  const ownEmail = await emailView({
    creatorUserId: [props.apiKey.creatorUserId],
    toParent: false,
    onlyRecent: true,
    apiKey: props.apiKey.key,
  })
    .then(unwrap)
    .then(x => getFirstOr(x, "NOT_FOUND"))
    .then(unwrap);

  return {
    userData,
    ownEmail
  }
}

function AccountWrapper(props: AuthenticatedComponentProps) {
  return <DashboardLayout {...props}>
    <Container fluid className="py-4 px-4">
      <Async promiseFn={loadAccountData} apiKey={props.apiKey}>
        {({ setData }) => <>
          <Async.Pending>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </Async.Pending>
          <Async.Rejected>
            {e => <ErrorMessage error={e} />}
          </Async.Rejected>
          <Async.Fulfilled<AccountData>>{ad => <>
            <div className="mx-3 my-3">
              <WidgetWrapper title="My account">
                <span>Manage your account data</span>
                <ManageUserData
                  apiKey={props.apiKey}
                  userData={ad.userData}
                  email={ad.ownEmail}
                  setUserData={ud => setData(update(ad, { userData: { $set: ud } }))} />
              </WidgetWrapper>
            </div>
          </>}
          </Async.Fulfilled>
        </>}
      </Async>
    </Container>
  </DashboardLayout>
}

export default AccountWrapper;
