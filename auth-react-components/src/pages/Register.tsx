import React from 'react';
import { Card} from 'react-bootstrap'

import RegisterForm from '../components/RegisterForm';
import SimpleLayout from '../components/SimpleLayout';
import BrandedComponentProps from '../components/BrandedComponentProps';


function Register(props: BrandedComponentProps) {
  const [successful, setSuccess] = React.useState(false);
  return (
    <SimpleLayout branding={props.branding}>
      <div className="h-100 w-100 d-flex">
        <Card className="mx-auto my-auto">
          <Card.Body>
            <Card.Title>Register</Card.Title>
            {successful
              ? <> We've sent an email to verify your address. </>
              : <RegisterForm onSuccess={() => setSuccess(true)} />
            }
          </Card.Body>
        </Card>
      </div>
    </SimpleLayout>
  )
}

export default Register;
