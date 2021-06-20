declare global {

  interface GoalIntent {
    goalIntentId: number,
    creationTime: number,
    creatorUserId: number
  }

  interface GoalIntentData {
    goalIntentDataId: number,
    creationTime: number,
    creatorUserId: number,
    goalIntent: GoalIntent,
    name: string,
    active: boolean
  }

  interface Goal {
    goalId: number,
    creationTime: number,
    creatorUserId: number,
    intent?: GoalIntent
  }

  type TimeUtilityFunction = {
    timeUtilityFunctionId: number,
    creationTime: number,
    creatorUserId: number,
    start_time: number[],
    utils: number[],
  }

  type GoalDataStatusKind = "SUCCEED" | "FAIL" | "CANCEL" | "PENDING";

  type GoalData = {
    goalDataId: number,
    creationTime: number,
    creatorUserId: number,
    goal: Goal
    name: string,
    tags: string[],
    durationEstimate: number,
    timeUtilityFunction: TimeUtilityFunction,
    parentGoal?: Goal,
    time_span?: [start_time:number, end_time:number],
    status: GoalDataStatusKind
  }

  interface ExternalEvent {
    externalEventId: number,
    creationTime: number,
    creatorUserId: number
  }

  interface ExternalEventData {
    externalEventDataId: number,
    creationTime: number,
    creatorUserId: number,
    externalEvent: ExternalEvent,
    name: string,
    startTime: number,
    endTime: number,
    active: boolean
  }


}
export { }
