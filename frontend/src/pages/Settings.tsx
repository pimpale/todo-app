import React from 'react';
import { Popover, Form, Container } from 'react-bootstrap'

import UtilityWrapper from '../components/UtilityWrapper';

import DashboardLayout from '../components/DashboardLayout';
import CreatePassword from '../components/CreatePassword';
import { AuthenticatedComponentProps } from '@innexgo/frontend-auth-api';

function Settings(props: AuthenticatedComponentProps) {
  // TODO actually add backend components to handle changing the name properly
  // Also, make the name and email and password changes into one box initially
  // Then, when you click on them to change, a modal should pop up
  // IMO this would look better than the tiny boxes we have now

  const [passwdSuccess, setPasswdSuccess] = React.useState(false);
  return <DashboardLayout {...props}>
    <Container fluid className="py-4 px-4">
      <div className="mx-3 my-3">
        <UtilityWrapper title="Change Password">
          <span>
            Shows basic information about this course.
          </span>
          {passwdSuccess
            ? <Form.Text className="text-success">Password changed successfully</Form.Text>
            : <CreatePassword apiKey={props.apiKey} onSuccess={() => setPasswdSuccess(true)} />
          }
        </UtilityWrapper>
      </div>
    </Container>
  </DashboardLayout>
}

export default Settings;
