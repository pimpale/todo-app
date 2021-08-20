import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Col, Row, Card, Button, Form } from "react-bootstrap";
import { goalNew, GoalData, timeUtilityFunctionNew, } from "@innexgo/frontend-todo-app-api";
import { ApiKey } from '@innexgo/frontend-auth-api';
import UtilityPicker from "../components/UtilityPicker"
import parseDuration from 'parse-duration';
import formatDuration from 'date-fns/formatDuration';
import intervalToDuration from 'date-fns/intervalToDuration';
import { isErr } from '@innexgo/frontend-common';


type CreateGoalProps = {
  span?: [startTime: number, endTime: number];
  apiKey: ApiKey;
  postSubmit: (gd:GoalData) => void;
}

function CreateGoal(props: CreateGoalProps) {
  type CreateGoalValue = {
    name: string,
    durationEstimate: string,
    points: { x: number, y: number }[]
  }

  const onSubmit = async (values: CreateGoalValue,
    fprops: FormikHelpers<CreateGoalValue>) => {

    let errors: FormikErrors<CreateGoalValue> = {};

    // Validate input

    let hasError = false;
    if (values.name === "") {
      errors.name = "Please enter an event name";
      hasError = true;
    }

    const durationEstimate = parseDuration(values.durationEstimate);

    if (durationEstimate === null) {
      errors.durationEstimate = "Invalid duration estimate";
      hasError = true;
    }

    fprops.setErrors(errors);
    if (hasError) {
      return;
    }

    const maybeTimeUtilFunction = await timeUtilityFunctionNew({
      startTimes: values.points.map(p => p.x),
      utils: values.points.map(p => p.y),
      apiKey: props.apiKey.key,
    })

    if (isErr(maybeTimeUtilFunction)) {
      switch (maybeTimeUtilFunction.Err) {
        case "UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "Unable to authenticate request. Please relogin.",
            successResult: ""
          });
          break;
        }
        case "TIME_UTILITY_FUNCTION_NOT_VALID": {
          fprops.setErrors({
            points: "Utility function is invalid."
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while trying to create utility function.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    let tuf = maybeTimeUtilFunction.Ok;


    let maybeGoalData = await goalNew({
      name: values.name,
      durationEstimate: durationEstimate!,
      timeUtilityFunctionId: tuf.timeUtilityFunctionId,
      timeSpan: props.span,
      apiKey: props.apiKey.key,
    })


    if (isErr(maybeGoalData)) {
      switch (maybeGoalData.Err) {
        case "UNAUTHORIZED": {
          fprops.setStatus({
            failureResult: "You have been automatically logged out. Please relogin.",
            successResult: ""
          });
          break;
        }
        default: {
          fprops.setStatus({
            failureResult: "An unknown or network error has occured while trying to create goal.",
            successResult: ""
          });
          break;
        }
      }
      return;
    }

    fprops.setStatus({
      failureResult: "",
      successResult: "Goal Created"
    });
    // execute callback
    props.postSubmit(maybeGoalData.Ok);
  }


  return <>
    <Formik<CreateGoalValue>
      onSubmit={onSubmit}
      initialValues={{
        name: "",
        durationEstimate: formatDuration(
          props.span
            ? intervalToDuration({
              start: props.span[0],
              end: props.span[1]
            })
            : {
              minutes: 30,
            }
        ),
        points: [],
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
            <Form.Group>
              <Card>
                <Card.Body>
                  <UtilityPicker
                    span={props.span}
                    points={fprops.values.points}
                    setPoints={e => fprops.setFieldValue('points', e)}
                    mutable
                  />
                </Card.Body>
              </Card>
              <Form.Text className="text-danger">{fprops.errors.points}</Form.Text>
            </Form.Group>
            <Row>
              <Form.Group as={Col}>
                <Form.Control
                  name="name"
                  type="text"
                  placeholder="Goal Name"
                  as="input"
                  value={fprops.values.name}
                  onChange={e => fprops.setFieldValue('name', e.target.value)}
                  isInvalid={!!fprops.errors.name}
                />
                <Form.Control.Feedback type="invalid">{fprops.errors.name}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Control
                  name="durationEstimate"
                  type="text"
                  placeholder="Estimated Duration"
                  as="input"
                  value={fprops.values.durationEstimate}
                  onChange={e => fprops.setFieldValue('durationEstimate', e.target.value)}
                  isInvalid={!!fprops.errors.durationEstimate}
                />
                <Form.Control.Feedback type="invalid">{fprops.errors.durationEstimate}</Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Button type="submit">Submit Form</Button>
            <br />
            <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          </div>
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      </>}
    </Formik>
  </>
}

export default CreateGoal;
