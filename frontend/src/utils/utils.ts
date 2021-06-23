import setHours from 'date-fns/setHours';
import setMinutes from 'date-fns/setMinutes';

import { fetchApi, Result } from '@innexgo/frontend-common'

export interface GoalIntent {
  goalIntentId: number,
  creationTime: number,
  creatorUserId: number
}

export interface GoalIntentData {
  goalIntentDataId: number,
  creationTime: number,
  creatorUserId: number,
  goalIntent: GoalIntent,
  name: string,
  active: boolean
}

export interface Goal {
  goalId: number,
  creationTime: number,
  creatorUserId: number,
  intent?: GoalIntent
}

export interface TimeUtilityFunction {
  timeUtilityFunctionId: number,
  creationTime: number,
  creatorUserId: number,
  startTimes: number[],
  utils: number[],
}

type GoalDataStatusKind = "SUCCEED" | "FAIL" | "CANCEL" | "PENDING";

export interface GoalData {
  goalDataId: number,
  creationTime: number,
  creatorUserId: number,
  goal: Goal
  name: string,
  tags: string[],
  durationEstimate: number,
  timeUtilityFunction: TimeUtilityFunction,
  parentGoal?: Goal,
  timeSpan?: [startTime: number, endTime: number],
  status: GoalDataStatusKind
}

export interface ExternalEvent {
  externalEventId: number,
  creationTime: number,
  creatorUserId: number
}

export interface ExternalEventData {
  externalEventDataId: number,
  creationTime: number,
  creatorUserId: number,
  externalEvent: ExternalEvent,
  name: string,
  startTime: number,
  endTime: number,
  active: boolean
}







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

  "VERIFICATION_CHALLENGE_NONEXISTENT",
  "VERIFICATION_CHALLENGE_TIMED_OUT",

  "PASSWORD_RESET_NONEXISTENT",
  "PASSWORD_EXISTENT",
  "PASSWORD_RESET_TIMED_OUT",

  "EMAIL_RATELIMIT",
  "EMAIL_BLACKLISTED",

  "GOAL_NONEXISTENT",

  "GOAL_INTENT_NONEXISTENT",

  "EXTERNAL_EVENT_NONEXISTENT",

  "TIME_UTILITY_FUNCTION_NONEXISTENT",
  "TIME_UTILITY_FUNCTION_NOT_VALID",
  "NEGATIVE_START_TIME",
  "NEGATIVE_DURATION",

  "UNKNOWN",
  "NETWORK"
] as const;

// Creates a union type
export type TodoAppErrorCode = typeof TodoAppErrorCodes[number];

async function fetchApiOrNetworkError<T>(url: string, props: object): Promise<Result<T, TodoAppErrorCode>> {
  try {
    return await fetchApi(url, props);
  } catch (_) {
    return { Err: "NETWORK" };
  }
}


export interface ExternalEventNewProps {
  name: string,
  startTime: number,
  endTime: number,
  apiKey: string,
}

export function externalEventNew(props: ExternalEventNewProps): Promise<Result<ExternalEventData, TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/external_event/new", props);
}

export interface ExternalEventDataNewProps {
  externalEventId: number,
  name: string,
  startTime: number,
  endTime: number,
  active: boolean,
  apiKey: string,
}

export function externalEventDataNew(props: ExternalEventDataNewProps): Promise<Result<ExternalEventData, TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/external_event_data/new", props);
}

export interface GoalIntentNewProps {
  name: string,
  apiKey: string,
}

export function goalIntentNew(props: GoalIntentNewProps): Promise<Result<GoalIntentData, TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal_intent/new", props);
}

export interface GoalIntentDataNewProps {
  goalIntentId: number,
  name: string,
  active: boolean,
  apiKey: string,
}

export function goalIntentDataNew(props: GoalIntentDataNewProps): Promise<Result<GoalIntentData, TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal_intent_data/new", props);
}

export interface GoalNewProps {
  name: string,
  tags: string[],
  durationEstimate: number,
  timeUtilityFunctionId: number,
  goalIntentId?: number,
  parentGoalId?: number,
  timeSpan?: [startTime: number, endTime: number],
  apiKey: string,
}

export function goalNew(props: GoalNewProps): Promise<Result<GoalData, TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal/new", props);
}

export interface GoalDataNewProps {
  goalId: number,
  name: string,
  tags: string[],
  durationEstimate: number,
  timeUtilityFunctionId: number,
  parentGoalId?: number,
  timeSpan?: [startTime: number, endTime: number],
  status: GoalDataStatusKind,
  apiKey: string,
}

export function goalDataNew(props: GoalDataNewProps): Promise<Result<GoalData, TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal_data/new", props);
}

export interface TimeUtilityFunctionNewProps {
  startTimes: number[],
  utils: number[],
  apiKey: string,
}

export function timeUtilityFunctionNew(props: TimeUtilityFunctionNewProps): Promise<Result<TimeUtilityFunction, TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/time_utility_function/new", props);
}


export interface GoalIntentViewProps {
  goalIntentId?: number,
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number,
  offset?: number,
  count?: number,
  apiKey: string,
}

export function goalIntentView(props: GoalIntentViewProps): Promise<Result<GoalIntent[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal_intent/view", props);
}

export interface GoalIntentDataViewProps {
  goalIntentDataId?: number,
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

export function goalIntentDataView(props: GoalIntentDataViewProps): Promise<Result<GoalIntentData[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal_intent_data/view", props);
}

export interface GoalViewProps {
  goalId?: number,
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number,
  goalIntentId?: number,
  offset?: number,
  count?: number,
  apiKey: string,
}

export function goalView(props: GoalViewProps): Promise<Result<Goal[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal/view", props);
}

export interface GoalDataViewProps {
  goalDataId?: number,
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number,
  goalId?: number,
  name?: string,
  partialName?: string,
  minDurationEstimate?: number,
  maxDurationEstimate?: number,
  timeUtilityFunctionId?: number,
  parentGoalId?: number,
  minStartTime?: number,
  maxStartTime?: number,
  minEndTime?: number,
  maxEndTime?: number,
  status?: GoalDataStatusKind,
  onlyRecent: boolean,
  goalIntentId?: number,
  scheduled?: boolean,
  offset?: number,
  count?: number,
  apiKey: string,
}


export function goalDataView(props: GoalDataViewProps): Promise<Result<GoalData[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal_data/view", props);
}

export interface ExternalEventViewProps {
  externalEventId?: number,
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number,
  offset?: number,
  count?: number,
  apiKey: string,
}

export function externalEventView(props: ExternalEventViewProps): Promise<Result<ExternalEvent[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/external_event/view", props);
}

export interface ExternalEventDataViewProps {
  externalEventDataId?: number,
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number,
  externalEventId?: number,
  name?: string,
  partialName?: string,
  minStartTime?: number,
  maxStartTime?: number,
  minEndTime?: number,
  maxEndTime?: number,
  active?: boolean,
  onlyRecent: boolean,
  offset?: number,
  count?: number,
  apiKey: string,
}

export function externalEventDataView(props: ExternalEventDataViewProps): Promise<Result<ExternalEventData[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/external_event_data/view", props);
}

export interface TimeUtilityFunctionViewProps {
  timeUtilityFunctionId?: number,
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number,
  offset?: number,
  count?: number,
  apiKey: string,
}

export function timeUtilityFunctionView(props: TimeUtilityFunctionViewProps): Promise<Result<TimeUtilityFunction[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/time_utility_function/view", props);
}

export const INT_MAX: number = 999999999999999;

export const APP_NAME: string = "4cast";
export const APP_SLOGAN: string = "Optimize Your Day";


export const setHrMin = (d: Date, hr: number, min: number) => setMinutes(setHours(d, hr), min)
