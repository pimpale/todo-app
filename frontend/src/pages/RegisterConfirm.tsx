import React from 'react';
import { Card, Button, Form } from "react-bootstrap";
import SimpleLayout from '../components/SimpleLayout';
import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { User, userNew} from '@innexgo/frontend-auth-api';
import { isErr } from '@innexgo/frontend-common';

type CreateUserProps = {
  verificationChallengeKey: string;
  postSubmit: (user: User) => void;
}

function CreateUser(props: CreateUserProps) {
  type CreateUserValue = {}

  const onSubmit = async (_: CreateUserValue,
    fprops: FormikHelpers<CreateUserValue>) => {

    let errors: FormikErrors<CreateUserValue> = {};

    // Validate input

    let hasError = false;
    fprops.setErrors(errors);
    if (hasError) {
      return;
    }

    const maybeUser = await userNew({
      verificationChallengeKey: props.verificationChallengeKey,
    });

    if (isErr(maybeUser)) {
      switch (maybeUser.Err) {
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
    props.postSubmit(maybeUser.Ok);
  }

  return <>
    <Formik<CreateUserValue>
      onSubmit={onSubmit}
      initialValues={{
        name: "",
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
            <Button type="submit">Complete Registration</Button>
            <br />
            <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          </div>
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      </>}
    </Formik>
  </>
}


function RegisterConfirm() {

  const [user, setUser] = React.useState<User | null>(null);

  return (
    <SimpleLayout>
      <div className="h-100 w-100 d-flex">
        <Card className="mx-auto my-auto">
          <Card.Body>
            <Card.Title>Complete Account Registration</Card.Title>
            {
              user !== null
                ? <Card.Text> Your account ({user.email}), has been created. Click <a href="/">here</a> to login.</Card.Text>
                : <CreateUser
                  verificationChallengeKey={new URLSearchParams(window.location.search).get("verificationChallengeKey") ?? ""}
                  postSubmit={(u: User) => setUser(u)}
                />
            }
          </Card.Body>
        </Card>
      </div>
    </SimpleLayout>
  )
}

export default RegisterConfirm;
