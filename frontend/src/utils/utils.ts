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

export interface UserGeneratedCode {
  userGeneratedCodeId: number,
  creationTime: number,
  creatorUserId: number,
  sourceCode: string,
  sourceLang: string,
  wasmCache: number[],
}

type GoalDataStatusKind = "SUCCEED" | "FAIL" | "CANCEL" | "PENDING";

export interface GoalData {
  goalDataId: number,
  creationTime: number,
  creatorUserId: number,
  goal: Goal
  name: string,
  durationEstimate: number | null,
  timeUtilityFunction: TimeUtilityFunction,
  status: GoalDataStatusKind
}

export interface GoalEvent {
  goalEventId: number,
  creationTime: number,
  creatorUserId: number,
  goal: Goal,
  startTime: number,
  endTime: number,
  active: boolean,
}

export interface GoalDependency {
  goalDependencyId: number,
  creationTime: number,
  creatorUserId: number,
  goal: Goal,
  dependent_goal: Goal,
  active: boolean,
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

export interface GoalTemplate {
  goalTemplateId: number,
  creationTime: number,
  creatorUserId: number,
}

export interface GoalTemplateData {
  goalTemplateDataId: number,
  creationTime: number,
  creatorUserId: number,
  goalTemplate: GoalTemplate,
  name: string,
  durationEstimate: number | null,
  userGeneratedCode: UserGeneratedCode,
  active: boolean,
}

export interface GoalTemplatePattern {
  goalTemplatePatternId: number,
  creationTime: number,
  creatorUserId: number,
  goalTemplate: GoalTemplate,
  pattern: string,
  active: boolean,
}

type NamedEntityKind =
  "DATE" |
  "TIME" |
  "MONEY" |
  "URL" |
  "PERSON" |
  "LOCATION" |
  "HASHTAG" |
  "EMOTICON" |
  "EMOJI" |
  "PROPN" |
  "VERB";

export interface NamedEntity {
  namedEntityId: number,
  creationTime: number,
  creatorUserId: number,
}

export interface NamedEntityData {
  namedEntityDataId: number,
  creationTime: number,
  creatorUserId: number,
  namedEntity: NamedEntity,
  name: string,
  kind: NamedEntityKind,
  active: boolean,
}

export interface NamedEntityPattern {
  namedEntityPatternId: number,
  creationTime: number,
  creatorUserId: number,
  namedEntity: NamedEntity,
  pattern: string,
  active: boolean,
}

export interface GoalEntityTag {
  goalEntityTagId: number,
  creationTime: number,
  creatorUserId: number,
  namedEntity: NamedEntity,
  goal: Goal,
  active: boolean,
}

export const TodoAppErrorCodes = [
  "NO_CAPABILITY",
  "GOAL_INTENT_NONEXISTENT",
  "GOAL_NONEXISTENT",
  "GOAL_EVENT_NONEXISTENT",
  "GOAL_TEMPLATE_NONEXISTENT",
  "EXTERNAL_EVENT_NONEXISTENT",
  "NAMED_ENTITY_NONEXISTENT",
  "USER_GENERATED_CODE_NONEXISTENT",
  "TIME_UTILITY_FUNCTION_NONEXISTENT",
  "TIME_UTILITY_FUNCTION_NOT_VALID",
  "NEGATIVE_START_TIME",
  "NEGATIVE_DURATION",
  "GOAL_FORMS_CYCLE",
  "DECODE_ERROR",
  "INTERNAL_SERVER_ERROR",
  "METHOD_NOT_ALLOWED",
  "UNAUTHORIZED",
  "BAD_REQUEST",
  "NOT_FOUND",
  "NETWORK",
  "UNKNOWN",
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
  durationEstimate?: number,
  timeUtilityFunctionId: number,
  goalIntentId?: number,
  timeSpan?: [startTime: number, endTime: number],
  apiKey: string,
}

export function goalNew(props: GoalNewProps): Promise<Result<GoalData, TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal/new", props);
}

export interface GoalDataNewProps {
  goalId: number,
  name: string,
  durationEstimate?: number,
  timeUtilityFunctionId: number,
  status: GoalDataStatusKind,
  apiKey: string,
}

export function goalDataNew(props: GoalDataNewProps): Promise<Result<GoalData, TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal_data/new", props);
}

export interface GoalEventNewProps {
  goalId: number,
  startTime: number,
  endTime: number,
  active: boolean,
  apiKey: string,
}

export function goalEventNew(props: GoalEventNewProps): Promise<Result<GoalEvent, TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal_event/new", props);
}


export interface GoalDependencyNewProps {
  goalId: number,
  dependentGoalId: number,
  active: boolean,
  apiKey: string,
}

export function goalDependencyNew(props: GoalDependencyNewProps): Promise<Result<GoalDependency, TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal_dependency/new", props);
}


export interface GoalEntityTagNewProps {
  goalId: number,
  namedEntityId: number,
  active: boolean,
  apiKey: string,
}

export function goalEntityTagNew(props: GoalEntityTagNewProps): Promise<Result<GoalEntityTag, TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal_entity_tag/new", props);
}

export interface TimeUtilityFunctionNewProps {
  startTimes: number[],
  utils: number[],
  apiKey: string,
}

export function timeUtilityFunctionNew(props: TimeUtilityFunctionNewProps): Promise<Result<TimeUtilityFunction, TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/time_utility_function/new", props);
}

export interface UserGeneratedCodeNewProps {
  sourceCode: string,
  sourceLang: string,
  wasmCache: number[],
  apiKey: string,
}

export function userGeneratedCodeNew(props: UserGeneratedCodeNewProps): Promise<Result<UserGeneratedCode, TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/user_generated_code/new", props);
}

export interface GoalTemplateNewProps {
  name: string,
  durationEstimate?: number,
  userGeneratedCodeId: number,
  apiKey: string,
}

export function goalTemplateNew(props: GoalTemplateNewProps): Promise<Result<GoalTemplateData, TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal_template/new", props);
}


export interface GoalTemplateDataNewProps {
  goalTemplateId: number,
  name: string,
  durationEstimate?: number,
  userGeneratedCodeId: number,
  active: boolean,
  apiKey: string,
}

export function goalTemplateDataNew(props: GoalTemplateDataNewProps): Promise<Result<GoalTemplateData, TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal_template_data/new", props);
}

export interface GoalTemplatePatternNewProps {
  goalTemplateId: number,
  pattern: string,
  active: boolean,
  apiKey: string,
}

export function goalTemplatePatternNew(props: GoalTemplatePatternNewProps): Promise<Result<GoalTemplatePattern, TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal_template_pattern/new", props);
}


export interface NamedEntityNewProps {
  name: string,
  kind: NamedEntityKind,
  apiKey: string,
}

export function namedEntityNew(props: NamedEntityNewProps): Promise<Result<NamedEntity, TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/named_entity/new", props);
}


export interface NamedEntityDataNewProps {
  namedEntityId: number,
  name: string,
  kind: NamedEntityKind,
  active: boolean,
  apiKey: string,
}

export function namedEntityDataNew(props: NamedEntityDataNewProps): Promise<Result<NamedEntityData, TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/named_entity_data/new", props);
}

export interface NamedEntityPatternNewProps {
  namedEntityId: number,
  pattern: string,
  active: boolean,
  apiKey: string,
}

export function namedEntityPatternNew(props: NamedEntityPatternNewProps): Promise<Result<NamedEntityPattern, TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/named_entity_pattern/new", props);
}

export interface GoalIntentViewProps {
  goalIntentId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  apiKey: string,
}

export function goalIntentView(props: GoalIntentViewProps): Promise<Result<GoalIntent[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal_intent/view", props);
}

export interface GoalIntentDataViewProps {
  goalIntentDataId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  goalIntentId?: number[],
  name?: string[],
  responded?: boolean,
  active?: boolean,
  onlyRecent: boolean,
  apiKey: string,
}

export function goalIntentDataView(props: GoalIntentDataViewProps): Promise<Result<GoalIntentData[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal_intent_data/view", props);
}

export interface GoalViewProps {
  goalId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  goalIntentId?: number[],
  apiKey: string,
}

export function goalView(props: GoalViewProps): Promise<Result<Goal[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal/view", props);
}

export interface GoalDataViewProps {
  goalDataId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  goalId?: number[],
  name?: string[],
  minDurationEstimate?: number,
  maxDurationEstimate?: number,
  concrete?: boolean,
  timeUtilityFunctionId?: number[],
  status?: GoalDataStatusKind[],
  onlyRecent: boolean,
  goalIntentId?: number[],
  scheduled?: boolean,
  apiKey: string,
}


export function goalDataView(props: GoalDataViewProps): Promise<Result<GoalData[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal_data/view", props);
}

export interface GoalEventViewProps {
  goalEventId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  goalId?: number[],
  minStartTime?: number,
  maxStartTime?: number,
  minEndTime?: number,
  maxEndTime?: number,
  active?: boolean,
  onlyRecent: boolean,
  apiKey: string,
}

export function goalEventView(props: GoalEventViewProps): Promise<Result<GoalEvent[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal_event/view", props);
}

export interface GoalDependencyViewProps {
  goalDependencyId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  goalId?: number[],
  dependentGoalId?: number[],
  active?: boolean,
  onlyRecent: boolean,
  apiKey: string,
}

export function goalDependencyView(props: GoalDependencyViewProps): Promise<Result<GoalDependency[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal_dependency/view", props);
}

export interface GoalTemplateViewProps {
  goalTemplateId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  apiKey: string,
}

export function goalTemplateView(props: GoalTemplateViewProps): Promise<Result<GoalTemplate[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal_template/view", props);
}

export interface GoalTemplateDataViewProps {
  goalTemplateDataId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  goalTemplateId?: number[],
  name?: string[],
  minDurationEstimate?: number,
  maxDurationEstimate?: number,
  concrete?: boolean,
  userGeneratedCodeId?: number[],
  active?: boolean,
  onlyRecent: boolean,
  apiKey: string,
}

export function goalTemplateDataView(props: GoalTemplateDataViewProps): Promise<Result<GoalTemplateData[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal_template_data/view", props);
}

export interface GoalTemplatePatternViewProps {
  goalTemplatePatternId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  goalTemplateId?: number[],
  pattern?: string[],
  active?: boolean,
  onlyRecent: boolean,
  apiKey: string,
}

export function goalTemplatePatternView(props: GoalTemplatePatternViewProps): Promise<Result<GoalTemplatePattern[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/goal_template_pattern/view", props);
}

export interface ExternalEventViewProps {
  externalEventId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  apiKey: string,
}

export function externalEventView(props: ExternalEventViewProps): Promise<Result<ExternalEvent[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/external_event/view", props);
}

export interface ExternalEventDataViewProps {
  externalEventDataId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  externalEventId?: number[],
  name?: string[],
  minStartTime?: number,
  maxStartTime?: number,
  minEndTime?: number,
  maxEndTime?: number,
  active?: boolean,
  onlyRecent: boolean,
  apiKey: string,
}

export function externalEventDataView(props: ExternalEventDataViewProps): Promise<Result<ExternalEventData[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/external_event_data/view", props);
}

export interface TimeUtilityFunctionViewProps {
  timeUtilityFunctionId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  apiKey: string,
}

export function timeUtilityFunctionView(props: TimeUtilityFunctionViewProps): Promise<Result<TimeUtilityFunction[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/time_utility_function/view", props);
}

export interface UserGeneratedCodeViewProps {
  userGeneratedCodeId?: number[],
  minCreationUser?: number,
  maxCreationUser?: number,
  creatorUserId?: number[],
  sourceLang?: string[]
  apiKey: string,
}

export function userGeneratedCodeView(props: UserGeneratedCodeViewProps): Promise<Result<UserGeneratedCode[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/user_generated_code/view", props);
}

export interface NamedEntityViewProps {
  namedEntityId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  apiKey: string,
}

export function namedEntityView(props: NamedEntityViewProps): Promise<Result<NamedEntity[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/named_entity/view", props);
}

export interface NamedEntityDataViewProps {
  namedEntityDataId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  namedEntityId?: number[],
  name?: string[],
  kind?: NamedEntityKind[],
  active?: boolean,
  onlyRecent: boolean,
  apiKey: string,
}

export function namedEntityDataView(props: NamedEntityDataViewProps): Promise<Result<NamedEntityData[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/named_entity_data/view", props);
}

export interface NamedEntityPatternViewProps {
  namedEntityPatternId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  namedEntityId?: number[],
  pattern?: string[],
  active?: boolean,
  onlyRecent: boolean,
  apiKey: string,
}

export function namedEntityPatternView(props: NamedEntityPatternViewProps): Promise<Result<NamedEntityPattern[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/named_entity_pattern/view", props);
}

export interface GoalEntityTagViewProps {
  goalEntityTagId?: number[],
  minCreationTime?: number,
  maxCreationTime?: number,
  creatorUserId?: number[],
  namedEntityId?: number[],
  goalId?: number[],
  active?: boolean,
  onlyRecent: boolean,
  apiKey: string,
}

export function goalEntityTagView(props: GoalEntityTagViewProps): Promise<Result<GoalEntityTag[], TodoAppErrorCode>> {
  return fetchApiOrNetworkError("todo_app/named_entity_pattern/view", props);
}

export const INT_MAX: number = 999999999999999;

export const APP_NAME: string = "LifeSketch";
export const APP_SLOGAN: string = "Optimize your day.";


export const setHrMin = (d: Date, hr: number, min: number) => setMinutes(setHours(d, hr), min)
