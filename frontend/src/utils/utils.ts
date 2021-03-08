import setHours from 'date-fns/setHours';
import setMinutes from 'date-fns/setMinutes';

/**
 * Returns a promise that will be resolved in some milliseconds
 * use await sleep(some milliseconds)
 * @param {int} ms milliseconds to sleep for
 * @return {Promise<void>} a promise that will resolve in ms milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function staticUrl() {
  return window.location.protocol + "//" + window.location.host;
}

export function apiUrl() {
  return staticUrl() + '/api';
}

function getFormData(data: object) {
  const formData = new FormData();
  Object.keys(data).forEach(key => formData.append(key, (data as any)[key]));
  return formData;
}

// This function is guaranteed to only return ApiErrorCode | object
async function fetchApi(url: string, data: FormData) {
  // Catch all errors and always return a response
  const resp = await (async () => {
    try {
      return await fetch(`${apiUrl()}/${url}`, {
        method: 'POST',
        body: data
      });
    } catch (e) {
      return new Response('"NETWORK"', { status: 400 })
    }
  })();

  try {
    let objResp = await resp.json();
    return objResp;
  } catch (e) {
    return "UNKNOWN";
  }
}

export const ApiErrorCodes = [
  "OK",
  "NOT_FOUND",
  "NO_CAPABILITY",

  "API_KEY_UNAUTHORIZED",
  "API_KEY_NONEXISTENT",

  "PASSWORD_INCORRECT",
  "PASSWORD_INSECURE",
  "PASSWORD_CANNOT_CREATE_FOR_OTHERS",

  "USER_NONEXISTENT",
  "USER_EXISTENT",
  "USER_NAME_EMPTY",
  "USER_EMAIL_EMPTY",
  "USER_EMAIL_INVALIDATED",
  "USER_KIND_INVALID",

  "SUBSCRIPTION_NONEXISTENT",
  "SUBSCRIPTION_EXPIRED",
  "SUBSCRIPTION_UNAUTHORIZED",
  "SUBSCRIPTION_LIMITED",

  "VERIFICATION_CHALLENGE_NONEXISTENT",
  "VERIFICATION_CHALLENGE_TIMED_OUT",

  "PASSWORD_RESET_NONEXISTENT",
  "PASSWORD_EXISTENT",
  "PASSWORD_RESET_TIMED_OUT",

  "EMAIL_RATELIMIT",
  "EMAIL_BLACKLISTED",

  "GOAL_NONEXISTENT",

  "PAST_EVENT_NONEXISTENT",

  "TIME_UTILITY_FUNCTION_NONEXISTENT",
  "TIME_UTILITY_FUNCTION_NOT_VALID",
  "NEGATIVE_START_TIME",
  "NEGATIVE_DURATION",
  "CANNOT_ALTER_PAST",

  "UNKNOWN",
  "NETWORK"
] as const;

// Creates a union type
export type ApiErrorCode = typeof ApiErrorCodes[number];

export type NewValidApiKeyProps = {
  userEmail: string,
  userPassword: string,
  duration: number,
}

export async function newValidApiKey(props: NewValidApiKeyProps): Promise<ApiKey | ApiErrorCode> {
  return await fetchApi("apiKey/newValid/", getFormData(props));
}

export type NewCancelApiKeyProps = {
  apiKeyToCancel: string,
  apiKey: string,
}

export async function newApiKeyCancel(props: NewCancelApiKeyProps): Promise<ApiKey | ApiErrorCode> {
  return await fetchApi("apiKey/newCancel/", getFormData(props));
}

export type NewVerificationChallengeProps = {
  userName: string,
  userEmail: string,
  userPassword: string,
};

export async function newVerificationChallenge(props: NewVerificationChallengeProps): Promise<VerificationChallenge | ApiErrorCode> {
  return await fetchApi("verificationChallenge/new/", getFormData(props));
}

export type NewUserProps = {
  verificationChallengeKey: string,
};

export async function newUser(props: NewUserProps): Promise<User | ApiErrorCode> {
  return await fetchApi("user/new/", getFormData(props));
}

export type NewPasswordResetProps = {
  userEmail: string,
};

export async function newPasswordReset(props: NewPasswordResetProps): Promise<PasswordReset | ApiErrorCode> {
  return await fetchApi("passwordReset/new/", getFormData(props));
}

export type NewSubscriptionProps = {
  subscriptionKind: SubscriptionKind,
  apiKey: string
}

export async function newSubscription(props: NewSubscriptionProps): Promise<Subscription | ApiErrorCode> {
  return await fetchApi("subscription/new/", getFormData(props));
}

export type NewChangePasswordProps = {
  userId: number,
  oldPassword: string,
  newPassword: string,
  apiKey: string
}

export async function newChangePassword(props: NewChangePasswordProps): Promise<Password | ApiErrorCode> {
  return await fetchApi("password/newChange/", getFormData(props));
}

export type NewCancelPasswordProps = {
  userId: number,
  apiKey: string
}

export async function newCancelPassword(props: NewCancelPasswordProps): Promise<Password | ApiErrorCode> {
  return await fetchApi("password/newCancel/", getFormData(props));
}


export type NewResetPasswordProps = {
  passwordResetKey: string,
  newPassword: string
}

export async function newResetPassword(props: NewResetPasswordProps): Promise<Password | ApiErrorCode> {
  return await fetchApi("password/newReset/", getFormData(props));
}

export type NewGoalProps = {
  name: string, //
  description: string, //
  durationEstimate: number, //
  timeUtilityFunctionId: number, //
  scheduled: boolean, //
  startTime: number, //
  duration: number, //
  apiKey: string
}

export async function newGoal(props: NewGoalProps): Promise<GoalData | ApiErrorCode> {
  return await fetchApi("goal/new/", getFormData(props));
}

export type NewGoalDataProps = {
  goalId: number, //
  name: string, //
  description: string, //
  durationEstimate: number, //
  timeUtilityFunctionId: number, //
  scheduled: boolean, //
  startTime: number, //
  duration: number, //
  status: GoalDataStatusKind, //
  apiKey: string
}

export async function newGoalData(props: NewGoalDataProps): Promise<GoalDataUnscheduled | ApiErrorCode> {
  return await fetchApi("goalData/new/", getFormData(props));
}

export type NewTimeUtilityFunctionProps = {
  startTimes: number[], //
  utils: number[], //
  apiKey: string
}

export async function newTimeUtilityFunction(props: NewTimeUtilityFunctionProps): Promise<TimeUtilityFunction | ApiErrorCode> {
  return await fetchApi("timeUtilityFunction/new/", getFormData(props));
}

export type NewPastEventProps = {
  name: string, //
  description: string, //
  startTime: number, //
  duration: number, //
  apiKey: string
}

export async function newPastEvent(props: NewPastEventProps): Promise<PastEventData | ApiErrorCode> {
  return await fetchApi("pastEvent/new/", getFormData(props));
}

export type NewPastEventDataProps = {
  pastEventId:number, //
  name:string, //
  description: string, //
  startTime:number, //
  duration:number, //
  active:boolean, //
  apiKey:string
}

export async function newPastEventData(props: NewPastEventDataProps): Promise<PastEventData | ApiErrorCode> {
  return await fetchApi("pastEventData/new/", getFormData(props));
}

export type ViewSubscriptionProps = {
  subscriptionId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  creatorUserId?: number, //
  subscriptionKind?: SubscriptionKind, //
  maxUses?: number, //
  onlyRecent?: boolean, //
  offset?: number,
  count?: number,
  apiKey: string,
}

export async function viewSubscription(props: ViewSubscriptionProps): Promise<Subscription[] | ApiErrorCode> {
  return await fetchApi("subscription/", getFormData(props));
}

export type ViewUserProps = {
  userId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  userName?: string, //
  partialUserName?: string, //
  userEmail?: string, //
  offset?: number,
  count?: number,
  apiKey: string,
}


export async function viewUser(props: ViewUserProps): Promise<User[] | ApiErrorCode> {
  return await fetchApi("user/", getFormData(props));
}

export type ViewPasswordProps = {
  passwordId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  creatorUserId?: number, //
  userId?: number, //
  passwordKind?: PasswordKind, //
  onlyRecent?: boolean,
  offset?: number,
  count?: number,
  apiKey: string,
}

export async function viewPassword(props: ViewPasswordProps): Promise<Password[] | ApiErrorCode> {
  return await fetchApi("password/", getFormData(props));
}


export type ViewApiKeyProps = {
  apiKeyId?: number, //
  creatorUserId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  duration?: number, //
  minDuration?: number, //
  maxDuration?: number, //
  apiKeyKind?: ApiKeyKind, //
  onlyRecent?: boolean, //
  offset?: number,
  count?: number,
  apiKey: string,
}

export async function viewApiKey(props: ViewApiKeyProps): Promise<ApiKey[] | ApiErrorCode> {
  return await fetchApi("apiKey/", getFormData(props));
}

export type ViewGoalProps = {
  goalId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  creatorUserId?: number, //
  offset?: number,
  count?: number,
  apiKey: string,
}

export async function viewGoal(props: ViewGoalProps): Promise<Goal[] | ApiErrorCode> {
  return await fetchApi("goal/", getFormData(props));
}



export type ViewGoalDataProps = {
  goalDataId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  creatorUserId?: number, //
  goalId?: number,
  name?: string,
  partialName?: string,
  description?: string,
  partialDescription?: string,
  durationEstimate?: number,
  minDurationEstimate?: number,
  maxDurationEstimate?: number,
  timeUtilityFunctionId?: number,
  scheduled?: boolean,
  startTime?: number,
  minStartTime?: number,
  maxStartTime?: number,
  duration?: number,
  minDuration?: number,
  maxDuration?: number,
  status?: GoalDataStatusKind,
  onlyRecent?: boolean,
  offset?: number,
  count?: number,
  apiKey: string,
}

export async function viewGoalData(props: ViewGoalDataProps): Promise<GoalData[] | ApiErrorCode> {
  return await fetchApi("goalData/", getFormData(props));
}

export type ViewPastEventProps = {
  pastEventId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  creatorUserId?: number, //
  offset?: number,
  count?: number,
  apiKey: string,
}

export async function viewPastEvent(props: ViewPastEventProps): Promise<PastEvent[] | ApiErrorCode> {
  return await fetchApi("pastEvent/", getFormData(props));
}

export type ViewPastEventDataProps = {
  pastEventDataId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  creatorUserId?: number, //
  pastEventId?: number,
  name?: string,
  partialName?: string,
  description?: string,
  partialDescription?: string,
  startTime?: number,
  minStartTime?: number,
  maxStartTime?: number,
  duration?: number,
  minDuration?: number,
  maxDuration?: number,
  active?: boolean,
  onlyRecent?: boolean,
  offset?: number,
  count?: number,
  apiKey: string,
}

export async function viewPastEventData(props: ViewPastEventDataProps): Promise<PastEventData[] | ApiErrorCode> {
  return await fetchApi("pastEventData/", getFormData(props));
}

export type ViewTimeUtilityFunctionProps = {
  timeUtilityFunctionId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  creatorUserId?: number, //
  offset?: number,
  count?: number,
  apiKey: string,
}

export async function viewTimeUtilityFunction(props: ViewTimeUtilityFunctionProps): Promise<TimeUtilityFunction[] | ApiErrorCode> {
  return await fetchApi("timeUtilityFunction/", getFormData(props));
}

export type ViewTimeUtilityFunctionPointProps = {
  timeUtilityFunctionPointId?: number, //
  creationTime?: number, //
  minCreationTime?: number, //
  maxCreationTime?: number, //
  creatorUserId?: number, //
  timeUtilityFunctionId?: number,
  startTime?: number,
  minStartTime?: number,
  maxStartTime?: number,
  utils?: number,
  minUtils?: number,
  maxUtils?: number,
  offset?: number,
  count?: number,
  apiKey: string,
}

export async function viewTimeUtilityFunctionPoint(props: ViewTimeUtilityFunctionPointProps): Promise<TimeUtilityFunctionPoint[] | ApiErrorCode> {
  return await fetchApi("timeUtilityFunctionPoint/", getFormData(props));
}

export function isApiErrorCode(maybeApiErrorCode: any): maybeApiErrorCode is ApiErrorCode {
  return typeof maybeApiErrorCode === 'string' && ApiErrorCodes.includes(maybeApiErrorCode as any);
}

export const INT_MAX: number = 999999999999999;

export const isPasswordValid = (pass: string) => pass.length >= 8 && /\d/.test(pass);

export const setHrMin = (d:Date,hr:number, min:number) => setMinutes(setHours(d, hr), min)

// from here:
// https://stackoverflow.com/questions/40929260/find-last-index-of-element-inside-array-by-certain-condition

/**
* Returns the index of the last element in the array where predicate is true, and -1
* otherwise.
* @param array The source array to search in
* @param predicate find calls predicate once for each element of the array, in descending
* order, until it finds one where predicate returns true. If such an element is found,
* findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
*/
export function findLastIndex<T>(array: Array<T>, predicate: (value: T, index: number, obj: T[]) => boolean): number {
    let l = array.length;
    while (l--) {
        if (predicate(array[l], l, array))
            return l;
    }
    return -1;
}

