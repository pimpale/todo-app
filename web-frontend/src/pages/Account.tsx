import React from 'react';
import { Form, Container } from 'react-bootstrap'

import UtilityWrapper from '../components/UtilityWrapper';

import DashboardLayout from '../components/DashboardLayout';
import {ManagePassword, ManageUserData } from '@innexgo/auth-react-components';
import { AuthenticatedComponentProps } from '@innexgo/auth-react-components';

function Account(props: AuthenticatedComponentProps) {
  // TODO actually add backend components to handle changing the name properly
  // Also, make the name and email and password changes into one box initially
  // Then, when you click on them to change, a modal should pop up
  // IMO this would look better than the tiny boxes we have now

  const [passwdSuccess, setPasswdSuccess] = React.useState(false);
  const [nameSuccess, setNameSuccess] = React.useState(false);
  return <DashboardLayout {...props}>
    <Container fluid className="py-4 px-4">
      <div className="mx-3 my-3">
        <UtilityWrapper title="Change Password">
          <span>
            Shows basic information about this course.
          </span>
          {passwdSuccess
            ? <Form.Text className="text-success">Password changed successfully</Form.Text>
            : <ManagePassword apiKey={props.apiKey} onSuccess={() => setPasswdSuccess(true)} />
          }
        </UtilityWrapper>
      </div>
      <div className="mx-3 my-3">
        <UtilityWrapper title="Change Name">
          <span>
            Change your name
          </span>
          {nameSuccess
            ? <Form.Text className="text-success">Name changed successfully</Form.Text>
            : <ManageUserData apiKey={props.apiKey} onSuccess={() => setNameSuccess(true)} />
          }
        </UtilityWrapper>
      </div>
    </Container>
  </DashboardLayout>
}

export default Account;
