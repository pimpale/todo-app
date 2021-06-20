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
    durationEstimate: number,
    timeUtilityFunction: TimeUtilityFunction,
    parentGoal?: Goal,
    status: GoalDataStatusKind
  }

  type TaskEvent = {
    taskEventId: number,
    creationTime: number,
    creatorUserId: number,
    goal: Goal,
    startTime: number,
    duration: number,
    active: boolean
  }
}
export { }
