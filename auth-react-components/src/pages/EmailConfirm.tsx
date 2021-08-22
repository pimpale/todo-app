import React from 'react';
import { Card, Button, Form } from "react-bootstrap";
import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Email, emailNew } from '@innexgo/frontend-auth-api';
import { isErr } from '@innexgo/frontend-common';
import { SimpleLayout, BrandedComponentProps } from '@innexgo/common-react-components';

type CreateEmailProps = {
  verificationChallengeKey: string;
  postSubmit: (email: Email) => void;
}

function CreateEmail(props: CreateEmailProps) {
  type CreateEmailValue = {}

  const onSubmit = async (_: CreateEmailValue,
    fprops: FormikHelpers<CreateEmailValue>) => {

    let errors: FormikErrors<CreateEmailValue> = {};

    // Validate input

    let hasError = false;
    fprops.setErrors(errors);
    if (hasError) {
      return;
    }

    const maybeEmail = await emailNew({
      verificationChallengeKey: props.verificationChallengeKey,
    });

    if (isErr(maybeEmail)) {
      switch (maybeEmail.Err) {
        case "VERIFICATION_CHALLENGE_NONEXISTENT": {
          fprops.setStatus({
            failureResult: "This link is invalid.",
            successResult: ""
          });
          break;
        }
        case "VERIFICATION_CHALLENGE_USED": {
          fprops.setStatus({
            failureResult: "This link has already been used.",
            successResult: ""
          });
          break;
        }
        case "VERIFICATION_CHALLENGE_WRONG_KIND": {
          fprops.setStatus({
            failureResult: "This link is the wrong kind.",
            successResult: ""
          });
          break;
        }
        case "VERIFICATION_CHALLENGE_TIMED_OUT": {
          fprops.setStatus({
            failureResult: "This link has timed out.",
            successResult: ""
          });
          break;
        }
        case "EMAIL_EXISTENT": {
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
      successResult: "Email Created"
    });
    // execute callback
    props.postSubmit(maybeEmail.Ok);
  }

  return <>
    <Formik<CreateEmailValue>
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


function EmailConfirm(props: BrandedComponentProps) {

  const [email, setEmail] = React.useState<Email | null>(null);

  return (
    <SimpleLayout branding={props.branding}>
      <div className="h-100 w-100 d-flex">
        <Card className="mx-auto my-auto">
          <Card.Body>
            <Card.Title>Change Email</Card.Title>
            {
              email !== null
                ? <Card.Text> Your email ({email.verificationChallenge.email}), has been confirmed. Click <a href="/">here</a> to login.</Card.Text>
                : <CreateEmail
                  verificationChallengeKey={
                    (new URLSearchParams(window.location.search).get("verificationChallengeKey") ?? "")
                      .replace(' ', '+')
                  }
                  postSubmit={e => setEmail(e)}
                />
            }
          </Card.Body>
        </Card>
      </div>
    </SimpleLayout>
  )
}

export default EmailConfirm;
