declare global {


  type VerificationChallenge = {
    creationTime: number,
    name: string,
    email: string,
  }

  type User = {
    userId: number,
    creationTime: number,
    kind: UserKind,
    name: string,
    email: string,
  }

  type PasswordReset = {
    creationTime: long;
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

      
}
export { }
