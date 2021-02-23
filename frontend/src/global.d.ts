declare global {
  type PasswordReset = {
    creationTime: number;
  }
  // changes with PasswordKind and Password in the future?
  type PasswordKind = "CHANGE" | "RESET" | "CANCEL";

  type Password = {
    passwordId: number,
    creationTime: number,
    creator: User,
    user: User,
    kind: "CANCEL" | "CHANGE",
    passwordReset: null,
  } | {
    passwordId: number,
    creationTime: number,
    creator: User,
    user: User,
    kind: "RESET",
    passwordReset: PasswordReset,
  }

  type VerificationChallenge = {
    creationTime: number,
    name: string,
    email: string,
  }

  type User = {
    userId: number,
    creationTime: number,
    name: string,
    email: string,
  }

  type SubscriptionKind = "VALID" | "CANCEL";

  type Subscription = {
    subscriptionId: number,
    creationTime: number,
    creator: User,
    subscriptionKind: SubscriptionKind,
    maxUses: number
  }

  type Invoice = { // Did not use yet
    invoiceId: number,
    creationTime: number,
    creator: User,
    subscriptionId: Subscription,
    amountCents: number
  }

  type ApiKeyKind = "VALID" | "CANCEL";

  type ApiKey = {
    apiKeyId: number,
    creationTime: number,
    creator: User,
    duration: number, // only valid if ApiKeyKind isn't CANCEL
    key: string, // only valid if ApiKeyKind isn't CANCEL
    apiKeyKind: ApiKeyKind,
  }

  interface AuthenticatedComponentProps {
    apiKey: ApiKey
    setApiKey: (data: ApiKey | null) => void
  }

  type Goal = {
    goalId: number,
    creationTime: number,
    creator: User
  }
  // changes: took Goal out of TimeUtilityFunction
  type TimeUtilityFunction = {
    timeUtilityFunctionId: number,
    creationTime: number,
    creator: User,
  }

  type TimeUtilityFunctionPoint = {
    timeUtilityFunctionPointId: number,
    creationTime: number,
    creator: User,
    timeUtilityFunction: TimeUtilityFunction,
    startTime: number,
    utils: number,
    active: boolean
  }

  type GoalDataStatusKind = "SUCCEED" | "FAIL" | "CANCEL" | "PENDING";

  type GoalData = {
    goalDataId: number,
    creationTime: number,
    creator: User,
    goal: Goal 
    name: string,
    description: string,
    timeUtilityFunction: TimeUtilityFunction,
    duration: number,
    status: GoalDataStatusKind
  }

  type GoalDependency = {
    goalDependencyId: number,
    creationTime: number,
    creator: User,
    goal: Goal, 
    dependentGoal: Goal 
  }

  type TaskStatusKind = "VALID" | "CANCEL";

  type Task = {
    taskId: number,
    creationTime: number,
    creator: User,
    goal: Goal, 
    startTime: number,
    duration: number,
    status: TaskStatusKind
  }

  type PastEvent = {
    pastEventId: number,
    creationTime: number,
    creator: User
  }

  type PastEventData = {
    pastEventDataId: number, 
    creationTime: number,
    creator: User,
    pastEvent: PastEvent, 
    startTime: number,
    duration: number,
    name: string,
    description: string,
    active: boolean
  }
}
export { }
