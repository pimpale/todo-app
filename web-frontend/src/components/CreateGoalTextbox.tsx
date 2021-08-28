import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Form } from "react-bootstrap";
import { timeUtilityFunctionNew, goalNew, GoalData , } from "@innexgo/frontend-todo-app-api";
import { TemplateData } from '../components/ManageGoalTemplate';
import { TagData } from '../components/ManageNamedEntity';
import { ApiKey } from '@innexgo/frontend-auth-api';
import { isErr, unwrap, throwException, nullToUndefined } from '@innexgo/frontend-common';
import parseDuration from 'parse-duration';
import { myItemOut, myColOut } from '../utils/utils';
import winkNlp from 'wink-nlp';
import model from 'wink-eng-lite-web-model';
import { casual } from 'chrono-node';

const builtinPatterns = [
  {
    name: "PARENT_GOAL",
    patterns: ["for [HASHTAG]",]
  },
  {
    name: "DURATION_ESTIMATE",
    patterns: ["for [DURATION]",]
  },
  {
    name: "GOAL_VALID_BEFORE_GOAL",
    patterns: ["before [HASHTAG]",]
  },
  {
    name: "GOAL_VALID_AFTER_GOAL",
    patterns: ["after [HASHTAG]",]
  },
  {
    name: "GOAL_VALID_BEFORE_TIME",
    patterns: [
      "[to|by|before] [DATE|TIME]",
      "[to|by|before] [TIME] [DATE]",
      "[to|by|before] [DATE] [TIME]",
    ]
  },
  {
    name: "GOAL_VALID_AFTER_TIME",
    patterns: [
      "[from|after] [DATE|TIME]",
      "[from|after] [TIME] [DATE]",
      "[from|after] [DATE] [TIME]",
    ]
  },
];

const builtinNlp = winkNlp(model);
builtinNlp.learnCustomEntities(builtinPatterns);


type CreateHybridGoalProps = {
  apiKey: ApiKey;
  tags: TagData[];
  templates: TemplateData[];
  postSubmit: (gd: GoalData) => void;
}

function CreateHybridGoal(props: CreateHybridGoalProps) {

  type CreateHybridGoalValue = {
    name: string,
  }

  const onSubmit = async (values: CreateHybridGoalValue,
    fprops: FormikHelpers<CreateHybridGoalValue>) => {
    try {

      if (values.name === "") {
        throw new Error("Please enter an event name");
      }

      const templateNlp = winkNlp(model);
      templateNlp.learnCustomEntities(
        props.templates.map((x, i) => ({
          name: (i + 1).toString(), // we add 1 to work around a bug in winkjs, `0` is not a valid name
          patterns: x.gtp.map(x => x.pattern)
        }))
      );

      templateNlp.readDoc(values.name).customEntities().each(x => console.log(x.out()));
      builtinNlp.readDoc(values.name).customEntities().each(x => console.log(x.out()));

      // get the first template
      const maybeTemplateItem = templateNlp.readDoc(values.name).customEntities().itemAt(0);
      const template = maybeTemplateItem === undefined
        ? undefined
        : props.templates[parseInt(myItemOut(maybeTemplateItem, templateNlp.its.detail).type, 10) - 1].gtd;

      // get the data specified in the class
      let ds = myColOut(builtinNlp.readDoc(values.name).customEntities(), builtinNlp.its.detail, builtinNlp.as.array)

      let rawAfterGoal = ds
        .filter(d => d.type === "GOAL_VALID_AFTER_GOAL")
        .map(d => d.value.split("#")[1])[0] // extract everything right of hashtag

      let rawBeforeGoal = ds
        .filter(d => d.type === "GOAL_VALID_BEFORE_GOAL")
        .map(d => d.value.split("#")[1])[0] // extract everything right of hashtag

      let rawParentGoal = ds
        .filter(d => d.type === "PARENT_GOAL")
        .map((d, i) => i === 0
          ? d.value.split("#")[1] // extract everything right of hashtag
          : throwException(Error("Duplicate parent goal."))
        )[0]

      let rawAfterTime = ds
        .filter(d => d.type === "GOAL_VALID_AFTER_TIME")
        .map((d, i) => i === 0
          ? d.value.slice(d.value.indexOf(" ") + 1) //  extract everything right of the first space
          : throwException(Error("Duplicate goal beginline."))
        )[0]

      let rawBeforeTime = ds
        .filter(d => d.type === "GOAL_VALID_BEFORE_TIME")
        .map((d, i) => i === 0
          ? d.value.slice(d.value.indexOf(" ") + 1) //  extract everything right of the first space
          : throwException(Error("Duplicate goal deadline."))
        )[0]

      let rawDurationEstimate = ds
        .filter(d => d.type === "DURATION_ESTIMATE")
        .map((d, i) => i === 0
          ? d.value.slice(d.value.indexOf(" ") + 1) //  extract everything right of the first space
          : throwException(Error("Duplicate duration estimate."))
        )[0]

      // duration estimate:
      // null means abstract
      let durationEstimate =
        template?.durationEstimate === undefined
          ? 1000 * 60 * 60
          : template.durationEstimate
        ;

      if (rawDurationEstimate !== undefined) {
        // prevent null template
        if (template?.durationEstimate === null) {
          throw Error(`The goal template "${template.name}" is abstract and can't be assigned a duration.`);
        }

        const d = parseDuration(rawDurationEstimate);

        if (d === null) {
          throw Error(`Couldn't parse duration string "${rawDurationEstimate}"`);
        }

        durationEstimate = d;
      }

      // time utility function

      let minTime: number | null = null;
      let maxTime: number | null = null;

      if (rawAfterTime !== undefined) {
        const d = casual.parseDate(rawAfterTime, new Date(), { forwardDate: true });

        if (d === null) {
          throw Error(`Couldn't parse date string "${rawAfterTime}"`);
        }
        // this is the min time the goal may be scheduled
        minTime = d.valueOf();
      }


      if (rawBeforeTime !== undefined) {
        const d = casual.parseDate(rawBeforeTime, new Date(), { forwardDate: true });

        if (d === null) {
          throw Error(`Couldn't parse date string "${rawBeforeTime}"`);
        }
        // this is the max time the goal may be scheduled
        maxTime = d.valueOf();
      }


      // now construct time utility function
      const startTimes: number[] = [];
      const utils: number[] = [];

      if (minTime === null && maxTime === null) {
        // start one time
        startTimes.push(Date.now());
        utils.push(100);
      } else {
        if (minTime !== null) {
          // push zero for starttime
          startTimes.push(minTime - 1);
          utils.push(0);
          // push 100 for endtime
          startTimes.push(minTime);
          utils.push(100);
        }
        if (maxTime !== null) {
          // push 100 for before deadline
          startTimes.push(maxTime);
          utils.push(100);
          // push zero for deadline
          startTimes.push(maxTime + 1);
          utils.push(0);
        }
      }

      const tuf = await timeUtilityFunctionNew({
        startTimes,
        utils,
        apiKey: props.apiKey.key
      }).then(unwrap);

      let maybeGoalData = await goalNew({
        name: values.name,
        durationEstimate: nullToUndefined(durationEstimate),
        timeUtilityFunctionId: tuf.timeUtilityFunctionId,
        apiKey: props.apiKey.key
      });

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

      // clear input
      fprops.setFieldValue("name", "");
      // execute callback
      props.postSubmit(maybeGoalData.Ok);
    } catch (e: any) {
      let errors: FormikErrors<CreateHybridGoalValue> = {};
      errors.name = (e as Error).message;
      fprops.setErrors(errors);
    }
  }


  return <>
    <Formik<CreateHybridGoalValue>
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
          <Form.Text className="text-danger">{fprops.status.failureResult}</Form.Text>
          <Form.Text className="text-success">{fprops.status.successResult}</Form.Text>
        </Form>
      </>}
    </Formik>
  </>
}

export default CreateHybridGoal;
