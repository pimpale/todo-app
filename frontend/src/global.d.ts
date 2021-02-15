declare global {


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

  type PasswordReset = {
    creationTime: number;
  }

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

  type SubscriptionKind = "VALID" | "CANCEL";

  type Subscription = {
    subscriptionId:number,
    creationTime:number,
    creator:User,
    subscriptionKind:SubscriptionKind,
    maxUses:number
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
      creationTime:number,
      creator:User
  };

  type UtilDistribution = {
      utilDistributionId:number,
      creationTime:number,
      creator:User,
      goal:Goal
  }

  type UtilDistributionPoint = {
    utilDistributionPointId: number,
    creationTime: number,
    creator: User,
    utilTime: number,
    utils: number
  }

  type GoalData = {
    goalDataId: number,
    creationTime: number,
    creator: User,
    goal: Goal 
    name: string,
    description: string,
    utilDistribution: UtilDistribution,
    duration: number,
    status: "CANCELLED" | "SUCCEEDED" | "FAILED" | "UNRESOLVED"

  }

  type GoalDependency = {
    goalDependencyId: number,
    creationTime: number,
    creator: User,
    goal: Goal, 
    dependentGoal: Goal 
  }

  type Task = {
    taskId: number,
    creationTime: number,
    creator: User,
    goal: Goal, 
    startTime: number,
    duration: number
  }

  type event = {
    eventId: number,
    creationTime: number,
    creator: User
  }

  type eventData = {
    eventDataId: number,
    creationTime: number,
    creator: User,
    event: event, 
    active: boolean,
    hasTaskId: true,
    taskId: Task
  } | {
    eventDataId: number, 
    creationTime: number,
    creator: User,
    event: event, 
    active: boolean,
    hasTaskId: false,
    startTime: number,
    duration: number,
    name: string,
    description: string
  }

      
}
export { }
