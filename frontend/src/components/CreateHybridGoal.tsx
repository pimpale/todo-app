import { Formik, FormikHelpers, FormikErrors } from 'formik'
import { Form } from "react-bootstrap";
import { goalIntentNew, GoalIntentData, } from "../utils/utils";
import { TemplateData } from '../components/ManageGoalTemplate';
import { TagData } from '../components/ManageNamedEntity';
import { ApiKey } from '@innexgo/frontend-auth-api';
import { isErr, throwException } from '@innexgo/frontend-common';
import parseDuration from 'parse-duration';
import { myItemOut, myColOut } from '../utils/nlphelpers';
import winkNlp from 'wink-nlp';
import model from 'wink-eng-lite-web-model';
import { strict } from 'chrono-node';

const builtinPatterns = [
  {
    name: "BEFORE_GOAL",
    patterns: ["before [HASHTAG]",]
  },
  {
    name: "AFTER_GOAL",
    patterns: ["after [HASHTAG]",]
  },
  {
    name: "PARENT_GOAL",
    patterns: ["for [HASHTAG]",]
  },
  {
    name: "BEFORE_TIME",
    patterns: [
      "[to|by|before] [DATE|TIME]",
      "[to|by|before] [TIME] [DATE]",
      "[to|by|before] [DATE] [TIME]",
    ]
  },
  {
    name: "AFTER_TIME",
    patterns: [
      "[from|after] [DATE|TIME]",
      "[from|after] [TIME] [DATE]",
      "[from|after] [DATE] [TIME]",
    ]
  },
  {
    name: "DURATION_ESTIMATE",
    patterns: ["for [DURATION]",]
  }
];

const builtinNlp = winkNlp(model);
builtinNlp.learnCustomEntities(builtinPatterns);


type CreateHybridGoalProps = {
  apiKey: ApiKey;
  tags: TagData[];
  templates: TemplateData[];
  postSubmit: (gid: GoalIntentData) => void;
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
          name: (i+1).toString(), // we add 1 to work around a bug in winkjs, `0` is not a valid name
          patterns: x.gtp.map(x => x.pattern)
        }))
      );

      templateNlp.readDoc(values.name).customEntities().each(x => console.log(x.out()));

      // get the first template
      const maybeTemplateItem = templateNlp.readDoc(values.name).customEntities().itemAt(0);
      const template = maybeTemplateItem === undefined
        ? undefined
        : props.templates[parseInt(myItemOut(maybeTemplateItem, templateNlp.its.detail).type, 10) - 1].gtd;

      // get the data specified in the class
      let ds = myColOut(builtinNlp.readDoc(values.name).customEntities(), builtinNlp.its.detail, builtinNlp.as.array)

      let rawAfterGoal = ds
        .filter(d => d.type === "AFTER_GOAL")
        .map(d => d.value.split("#")[1])[0] // extract everything right of hashtag

      let rawBeforeGoal = ds
        .filter(d => d.type === "BEFORE_GOAL")
        .map(d => d.value.split("#")[1])[0] // extract everything right of hashtag

      let rawParentGoal = ds
        .filter(d => d.type === "PARENT_GOAL")
        .map((d, i) => i === 0
          ? d.value.split("#")[1] // extract everything right of hashtag
          : throwException(Error("Duplicate parent goal."))
        )[0]

      let rawAfterTime = ds
        .filter(d => d.type === "AFTER_TIME")
        .map((d, i) => i === 0
          ? d.value.slice(d.value.indexOf(" ") + 1) //  extract everything right of the first space
          : throwException(Error("Duplicate goal beginline."))
        )[0]

      let rawBeforeTime = ds
        .filter(d => d.type === "BEFORE_TIME")
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
      // undefined means no data
      let durationEstimate: number | null | undefined = template?.durationEstimate;

      if (rawDurationEstimate !== undefined) {
        // prevent null template
        if (durationEstimate === null) {
          throw Error(`The goal template "${template?.name}" is abstract and can't be assigned a duration.`);
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

      if (rawBeforeTime !== undefined) {
        const d = strict.parseDate(rawBeforeTime, new Date(), {forwardDate: true});

        if (d === null) {
          throw Error(`Couldn't parse date string "${rawBeforeTime}"`);
        }

         console.log(d);

        minTime = d.valueOf();
      }

      if (rawAfterTime !== undefined) {
         console.log("got here");
        const d = strict.parseDate(rawAfterTime, new Date(), {forwardDate: true});
         console.log("got here2");

        if (d === null) {
          throw Error(`Couldn't parse date string "${rawAfterTime}"`);
        }

         console.log(d);

        maxTime = d.valueOf();
      }

      console.log(minTime);
      console.log(maxTime);
      console.log(durationEstimate);

      let maybeGoalIntentData = await goalIntentNew({
        name: values.name,
        apiKey: props.apiKey.key,
      });

      if (isErr(maybeGoalIntentData)) {
        switch (maybeGoalIntentData.Err) {
          case "UNAUTHORIZED": {
            fprops.setStatus({
              failureResult: "You have been automatically logged out. Please relogin.",
              successResult: ""
            });
            break;
          }
          default: {
            fprops.setStatus({
              failureResult: "An unknown or network error has occured while trying to create goal intent.",
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
      props.postSubmit(maybeGoalIntentData.Ok);
    } catch (e:any) {
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
