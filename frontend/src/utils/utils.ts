import setHours from 'date-fns/setHours';
import setMinutes from 'date-fns/setMinutes';

import { fetchApi } from '@innexgo/frontend-common'

export const TodoAppErrorCodes = [
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
export type TodoAppErrorCode = typeof TodoAppErrorCodes[number];

export interface GoalIntentNewProps {
  name: string,
  apiKey: string,
}

export function goalIntentNew(props: GoalIntentNewProps): Promise<GoalIntentData | TodoAppErrorCode> {
  return fetchApi("todo_app/goal_intent/new", props);
}

export interface GoalIntentDataNewProps {
  goalIntentId: number,
  name: string,
  active: boolean,
  apiKey: string,
}

export function goalIntentDataNew(props: GoalIntentDataNewProps): Promise<GoalIntentData | TodoAppErrorCode> {
  return fetchApi("todo_app/goal_intent_data/new", props);
}

export interface GoalNewProps {
  name: string,
  durationEstimate: number,
  timeUtilityFunctionId: number,
  goalIntentId?: number,
  parentGoalId?: number,
  apiKey: string,
}

export function goalNew(props: GoalNewProps): Promise<GoalData | TodoAppErrorCode> {
  return fetchApi("todo_app/goal/new", props);
}

export interface GoalDataNewProps {
  goalId: number,
  name: string,
  durationEstimate: number,
  timeUtilityFunctionId: number,
  parentGoalId?: number,
  status: GoalDataStatusKind,
  apiKey: string,
}

export function goalDataNew(props: GoalDataNewProps): Promise<GoalData | TodoAppErrorCode> {
  return fetchApi("todo_app/goal_data/new", props);
}

export interface TimeUtilityFunctionNewProps {
  startTimes: number[],
  utils: number[],
  apiKey: string,
}

export function timeUtilityFunctionNew(props: TimeUtilityFunctionNewProps): Promise<TimeUtilityFunction | TodoAppErrorCode> {
  return fetchApi("todo_app/time_utility_function/new", props);
}

export interface TaskEventNewProps {
  goalId: number,
  startTime: number,
  duration: number,
  active: boolean,
  apiKey: string,
}

export function taskEventNew(props: TaskEventNewProps): Promise<TaskEvent | TodoAppErrorCode> {
  return fetchApi("todo_app/task_event/new", props);
}

export interface GoalIntentViewProps {
  goalIntentId?: number,
  creationTime?: number,
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number,
  offset?: number,
  count?: number,
  apiKey: string,
}

export function goalIntentView(props: GoalIntentViewProps): Promise<GoalIntent[] | TodoAppErrorCode> {
  return fetchApi("todo_app/goal_intent/view", props);
}

export interface GoalIntentDataViewProps {
  goalIntentDataId?: number,
  creationTime?: number,
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number,
  goalIntentId?: number,
  name?: string,
  partialName?: string,
  responded?: boolean,
  active?: boolean,
  onlyRecent: boolean,
  offset?: number,
  count?: number,
  apiKey: string,
}

export function goalIntentDataView(props: GoalIntentDataViewProps): Promise<GoalIntentData[] | TodoAppErrorCode> {
  return fetchApi("todo_app/goal_intent_data/view", props);
}

export interface GoalViewProps {
  goalId?: number,
  creationTime?: number,
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number,
  goalIntentId?: number,
  offset?: number,
  count?: number,
  apiKey: string,
}

export function goalView(props: GoalViewProps): Promise<Goal[] | TodoAppErrorCode> {
  return fetchApi("todo_app/goal/view", props);
}

export interface GoalDataViewProps {
  goalDataId?: number,
  creationTime?: number,
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number,
  goalId?: number,
  name?: string,
  partialName?: string,
  durationEstimate?: number,
  minDurationEstimate?: number,
  maxDurationEstimate?: number,
  timeUtilityFunctionId?: number,
  parentGoalId?: number,
  status?: GoalDataStatusKind,
  onlyRecent: boolean,
  goalIntentId?: number,
  scheduled?: boolean,
  offset?: number,
  count?: number,
  apiKey: string,
}


export function goalDataView(props: GoalDataViewProps): Promise<GoalData[] | TodoAppErrorCode> {
  return fetchApi("todo_app/goal_data/view", props);
}

export interface TaskEventViewProps {
  taskEventId?: number,
  creationTime?: number,
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number,
  goalId?: number,
  startTime?: number,
  minStartTime?: number,
  maxStartTime?: number,
  duration?: number,
  minDuration?: number,
  maxDuration?: number,
  active?: boolean,
  onlyRecent: boolean,
  offset?: number,
  count?: number,
  apiKey: string,
}


export function taskEventView(props: TaskEventViewProps): Promise<TaskEvent[] | TodoAppErrorCode> {
  return fetchApi("todo_app/task_event/view", props);
}

export interface TimeUtilityFunctionViewProps {
  timeUtilityFunctionId?: number,
  creationTime?: number,
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number,
  offset?: number,
  count?: number,
  apiKey: string,
}

export function timeUtilityFunctionView(props: TimeUtilityFunctionViewProps): Promise<TimeUtilityFunction[] | TodoAppErrorCode> {
  return fetchApi("todo_app/time_utility_function/view", props);
}

export function isTodoAppErrorCode(maybeTodoAppErrorCode: any): maybeTodoAppErrorCode is TodoAppErrorCode {
  return typeof maybeTodoAppErrorCode === 'string' && TodoAppErrorCodes.includes(maybeTodoAppErrorCode as any);
}

export const INT_MAX: number = 999999999999999;

export const APP_NAME: string = "4cast";
export const APP_SLOGAN: string = "Optimize Your Day";


export const setHrMin = (d: Date, hr: number, min: number) => setMinutes(setHours(d, hr), min)
