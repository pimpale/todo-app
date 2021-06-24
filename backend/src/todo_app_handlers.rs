use super::Db;
use auth_service_api::client::AuthService;
use auth_service_api::response::AuthError;
use auth_service_api::response::User;

use todo_app_service_api::request;
use todo_app_service_api::response;

use super::todo_app_db_types::*;
use super::utils;

use super::external_event_data_service;
use super::external_event_service;
use super::goal_data_service;
use super::goal_intent_data_service;
use super::goal_intent_service;
use super::goal_service;
use super::time_utility_function_service;

use std::error::Error;

use super::Config;

fn report_postgres_err(e: tokio_postgres::Error) -> response::TodoAppError {
  utils::log(utils::Event {
    msg: e.to_string(),
    source: e.source().map(|e| e.to_string()),
    severity: utils::SeverityKind::Error,
  });
  response::TodoAppError::InternalServerError
}

fn report_auth_err(e: AuthError) -> response::TodoAppError {
  match e {
    AuthError::ApiKeyNonexistent => response::TodoAppError::Unauthorized,
    AuthError::ApiKeyUnauthorized => response::TodoAppError::Unauthorized,
    c => {
      let ae = match c {
        AuthError::InternalServerError => response::TodoAppError::InternalServerError,
        AuthError::MethodNotAllowed => response::TodoAppError::InternalServerError,
        AuthError::BadRequest => response::TodoAppError::InternalServerError,
        AuthError::NetworkError => response::TodoAppError::InternalServerError,
        _ => response::TodoAppError::Unknown,
      };

      utils::log(utils::Event {
        msg: ae.as_ref().to_owned(),
        source: Some(format!("auth service: {}", c.as_ref())),
        severity: utils::SeverityKind::Error,
      });

      ae
    }
  }
}

async fn fill_goal_intent(
  _con: &mut tokio_postgres::Client,
  goal_intent: GoalIntent,
) -> Result<response::GoalIntent, response::TodoAppError> {
  Ok(response::GoalIntent {
    goal_intent_id: goal_intent.goal_intent_id,
    creation_time: goal_intent.creation_time,
    creator_user_id: goal_intent.creator_user_id,
  })
}

async fn fill_goal_intent_data(
  con: &mut tokio_postgres::Client,
  goal_intent_data: GoalIntentData,
) -> Result<response::GoalIntentData, response::TodoAppError> {
  let goal_intent =
    goal_intent_service::get_by_goal_intent_id(con, goal_intent_data.goal_intent_id)
      .await
      .map_err(report_postgres_err)?
      .ok_or(response::TodoAppError::GoalIntentNonexistent)?;

  Ok(response::GoalIntentData {
    goal_intent_data_id: goal_intent_data.goal_intent_data_id,
    creation_time: goal_intent_data.creation_time,
    creator_user_id: goal_intent_data.creator_user_id,
    goal_intent: fill_goal_intent(con, goal_intent).await?,
    name: goal_intent_data.name,
    active: goal_intent_data.active,
  })
}

async fn fill_goal(
  con: &mut tokio_postgres::Client,
  goal: Goal,
) -> Result<response::Goal, response::TodoAppError> {
  let goal_intent = match goal.goal_intent_id {
    Some(goal_intent_id) => {
      let goal_intent = goal_intent_service::get_by_goal_intent_id(con, goal_intent_id)
        .await
        .map_err(report_postgres_err)?
        .ok_or(response::TodoAppError::GoalIntentNonexistent)?;

      Some(fill_goal_intent(con, goal_intent).await?)
    }
    _ => None,
  };

  Ok(response::Goal {
    goal_id: goal.goal_id,
    creation_time: goal.creation_time,
    creator_user_id: goal.creator_user_id,
    intent: goal_intent,
  })
}

async fn fill_goal_data(
  con: &mut tokio_postgres::Client,
  goal_data: GoalData,
) -> Result<response::GoalData, response::TodoAppError> {
  let goal = goal_service::get_by_goal_id(con, goal_data.goal_id)
    .await
    .map_err(report_postgres_err)?
    .ok_or(response::TodoAppError::GoalNonexistent)?;

  let time_utility_function = time_utility_function_service::get_by_time_utility_function_id(
    con,
    goal_data.time_utility_function_id,
  )
  .await
  .map_err(report_postgres_err)?
  .ok_or(response::TodoAppError::TimeUtilityFunctionNonexistent)?;

  let parent_goal = match goal_data.parent_goal_id {
    Some(parent_goal_id) => {
      let goal = goal_service::get_by_goal_id(con, parent_goal_id)
        .await
        .map_err(report_postgres_err)?
        .ok_or(response::TodoAppError::GoalNonexistent)?;

      Some(fill_goal(con, goal).await?)
    }
    _ => None,
  };

  Ok(response::GoalData {
    goal_data_id: goal_data.goal_data_id,
    creation_time: goal_data.creation_time,
    creator_user_id: goal_data.creator_user_id,
    goal: fill_goal(con, goal).await?,
    name: goal_data.name,
    tags: goal_data.tags,
    duration_estimate: goal_data.duration_estimate,
    time_utility_function: fill_time_utility_function(con, time_utility_function).await?,
    parent_goal,
    time_span: goal_data.time_span,
    status: goal_data.status,
  })
}

async fn fill_time_utility_function(
  _con: &mut tokio_postgres::Client,
  time_utility_function: TimeUtilityFunction,
) -> Result<response::TimeUtilityFunction, response::TodoAppError> {
  Ok(response::TimeUtilityFunction {
    time_utility_function_id: time_utility_function.time_utility_function_id,
    creation_time: time_utility_function.creation_time,
    creator_user_id: time_utility_function.creator_user_id,
    start_times: time_utility_function.start_times,
    utils: time_utility_function.utils,
  })
}

async fn fill_external_event(
  _con: &mut tokio_postgres::Client,
  external_event: ExternalEvent,
) -> Result<response::ExternalEvent, response::TodoAppError> {
  Ok(response::ExternalEvent {
    external_event_id: external_event.external_event_id,
    creation_time: external_event.creation_time,
    creator_user_id: external_event.creator_user_id,
  })
}

async fn fill_external_event_data(
  con: &mut tokio_postgres::Client,
  external_event_data: ExternalEventData,
) -> Result<response::ExternalEventData, response::TodoAppError> {
  let external_event =
    external_event_service::get_by_external_event_id(con, external_event_data.external_event_id)
      .await
      .map_err(report_postgres_err)?
      .ok_or(response::TodoAppError::GoalNonexistent)?;

  Ok(response::ExternalEventData {
    external_event_data_id: external_event_data.external_event_id,
    creation_time: external_event_data.creation_time,
    creator_user_id: external_event_data.creator_user_id,
    external_event: fill_external_event(con, external_event).await?,
    name: external_event_data.name,
    start_time: external_event_data.start_time,
    end_time: external_event_data.end_time,
    active: external_event_data.active,
  })
}

pub async fn get_user_if_api_key_valid(
  auth_service: &auth_service_api::client::AuthService,
  api_key: String,
) -> Result<User, response::TodoAppError> {
  auth_service
    .get_user_by_api_key_if_valid(api_key)
    .await
    .map_err(report_auth_err)
}

pub async fn external_event_new(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::ExternalEventNewProps,
) -> Result<response::ExternalEventData, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key).await?;

  // validate
  if props.start_time < 0 {
    return Err(response::TodoAppError::NegativeStartTime);
  }
  if props.start_time >= props.end_time {
    return Err(response::TodoAppError::NegativeDuration);
  }

  let con = &mut *db.lock().await;

  let mut sp = con.transaction().await.map_err(report_postgres_err)?;

  // create event
  let external_event = external_event_service::add(&mut sp, user.user_id)
    .await
    .map_err(report_postgres_err)?;

  // create data
  let external_event_data = external_event_data_service::add(
    &mut sp,
    user.user_id,
    external_event.external_event_id,
    props.name,
    props.start_time,
    props.end_time,
    true,
  )
  .await
  .map_err(report_postgres_err)?;

  sp.commit().await.map_err(report_postgres_err)?;

  // return json
  fill_external_event_data(con, external_event_data).await
}

pub async fn external_event_data_new(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::ExternalEventDataNewProps,
) -> Result<response::ExternalEventData, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key).await?;

  // validate
  if props.start_time < 0 {
    return Err(response::TodoAppError::NegativeStartTime);
  }
  if props.start_time >= props.end_time {
    return Err(response::TodoAppError::NegativeDuration);
  }

  let con = &mut *db.lock().await;

  let mut sp = con.transaction().await.map_err(report_postgres_err)?;

  let external_event =
    external_event_service::get_by_external_event_id(&mut sp, props.external_event_id)
      .await
      .map_err(report_postgres_err)?
      .ok_or(response::TodoAppError::ExternalEventNonexistent)?;

  // validate event is owned by correct user
  if external_event.creator_user_id != user.user_id {
    return Err(response::TodoAppError::ExternalEventNonexistent);
  }

  // now we can update data
  let external_event_data = external_event_data_service::add(
    &mut sp,
    user.user_id,
    external_event.external_event_id,
    props.name,
    props.start_time,
    props.end_time,
    true,
  )
  .await
  .map_err(report_postgres_err)?;

  sp.commit().await.map_err(report_postgres_err)?;

  // return json
  fill_external_event_data(con, external_event_data).await
}

pub async fn goal_intent_new(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalIntentNewProps,
) -> Result<response::GoalIntentData, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key).await?;

  let con = &mut *db.lock().await;

  let mut sp = con.transaction().await.map_err(report_postgres_err)?;

  // create intent
  let goal_intent = goal_intent_service::add(&mut sp, user.user_id)
    .await
    .map_err(report_postgres_err)?;

  // create data
  let goal_intent_data = goal_intent_data_service::add(
    &mut sp,
    user.user_id,
    goal_intent.goal_intent_id,
    props.name,
    true,
  )
  .await
  .map_err(report_postgres_err)?;

  sp.commit().await.map_err(report_postgres_err)?;

  // return json
  fill_goal_intent_data(con, goal_intent_data).await
}

pub async fn goal_intent_data_new(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalIntentDataNewProps,
) -> Result<response::GoalIntentData, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key).await?;

  let con = &mut *db.lock().await;

  let mut sp = con.transaction().await.map_err(report_postgres_err)?;

  let goal_intent = goal_intent_service::get_by_goal_intent_id(&mut sp, props.goal_intent_id)
    .await
    .map_err(report_postgres_err)?
    .ok_or(response::TodoAppError::GoalIntentNonexistent)?;

  // validate intent is owned by correct user
  if goal_intent.creator_user_id != user.user_id {
    return Err(response::TodoAppError::GoalIntentNonexistent);
  }

  // now we can update data
  let goal_intent_data = goal_intent_data_service::add(
    &mut sp,
    user.user_id,
    goal_intent.goal_intent_id,
    props.name,
    props.active,
  )
  .await
  .map_err(report_postgres_err)?;

  sp.commit().await.map_err(report_postgres_err)?;

  // return json
  fill_goal_intent_data(con, goal_intent_data).await
}

pub async fn goal_new(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalNewProps,
) -> Result<response::GoalData, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key).await?;

  let con = &mut *db.lock().await;

  let mut sp = con.transaction().await.map_err(report_postgres_err)?;

  // validate start and end time
  if let Some((start_time, end_time)) = props.time_span {
    if start_time < 0 {
      return Err(response::TodoAppError::NegativeStartTime);
    }
    if start_time >= end_time {
      return Err(response::TodoAppError::NegativeDuration);
    }
  }

  // ensure time utility function exists and belongs to you
  let time_utility_function = time_utility_function_service::get_by_time_utility_function_id(
    &mut sp,
    props.time_utility_function_id,
  )
  .await
  .map_err(report_postgres_err)?
  .ok_or(response::TodoAppError::TimeUtilityFunctionNonexistent)?;
  // validate intent is owned by correct user
  if time_utility_function.creator_user_id != user.user_id {
    return Err(response::TodoAppError::TimeUtilityFunctionNonexistent);
  }

  // validate that parent exists and belongs to you
  if let Some(parent_goal_id) = props.parent_goal_id {
    let goal = goal_service::get_by_goal_id(&mut sp, parent_goal_id)
      .await
      .map_err(report_postgres_err)?
      .ok_or(response::TodoAppError::GoalNonexistent)?;
    // validate intent is owned by correct user
    if goal.creator_user_id != user.user_id {
      return Err(response::TodoAppError::GoalNonexistent);
    }
  }

  // validate that intent exists and belongs to you
  if let Some(goal_intent_id) = props.goal_intent_id {
    let goal_intent = goal_intent_service::get_by_goal_intent_id(&mut sp, goal_intent_id)
      .await
      .map_err(report_postgres_err)?
      .ok_or(response::TodoAppError::GoalIntentNonexistent)?;
    // validate intent is owned by correct user
    if goal_intent.creator_user_id != user.user_id {
      return Err(response::TodoAppError::GoalIntentNonexistent);
    }
  }

  // create goal
  let goal = goal_service::add(&mut sp, user.user_id, props.goal_intent_id)
    .await
    .map_err(report_postgres_err)?;

  // create goal data
  let goal_data = goal_data_service::add(
    &mut sp,
    user.user_id,
    goal.goal_id,
    props.name,
    props.tags,
    props.duration_estimate,
    props.time_utility_function_id,
    props.parent_goal_id,
    props.time_span,
    request::GoalDataStatusKind::Pending,
  )
  .await
  .map_err(report_postgres_err)?;

  sp.commit().await.map_err(report_postgres_err)?;

  // return json
  fill_goal_data(con, goal_data).await
}

pub async fn goal_data_new(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalDataNewProps,
) -> Result<response::GoalData, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key).await?;

  let con = &mut *db.lock().await;

  let mut sp = con.transaction().await.map_err(report_postgres_err)?;

  // validate start and end time
  if let Some((start_time, end_time)) = props.time_span {
    if start_time < 0 {
      return Err(response::TodoAppError::NegativeStartTime);
    }
    if start_time >= end_time {
      return Err(response::TodoAppError::NegativeDuration);
    }
  }

  // ensure time utility function exists and belongs to you
  let time_utility_function = time_utility_function_service::get_by_time_utility_function_id(
    &mut sp,
    props.time_utility_function_id,
  )
  .await
  .map_err(report_postgres_err)?
  .ok_or(response::TodoAppError::TimeUtilityFunctionNonexistent)?;
  // validate intent is owned by correct user
  if time_utility_function.creator_user_id != user.user_id {
    return Err(response::TodoAppError::TimeUtilityFunctionNonexistent);
  }

  // validate that parent exists and belongs to you
  if let Some(parent_goal_id) = props.parent_goal_id {
    let goal = goal_service::get_by_goal_id(&mut sp, parent_goal_id)
      .await
      .map_err(report_postgres_err)?
      .ok_or(response::TodoAppError::GoalNonexistent)?;
    // validate intent is owned by correct user
    if goal.creator_user_id != user.user_id {
      return Err(response::TodoAppError::GoalNonexistent);
    }
  }

  // ensure that goal exists and belongs to you
  let goal = goal_service::get_by_goal_id(&mut sp, props.goal_id)
    .await
    .map_err(report_postgres_err)?
    .ok_or(response::TodoAppError::GoalNonexistent)?;
  // validate intent is owned by correct user
  if goal.creator_user_id != user.user_id {
    return Err(response::TodoAppError::GoalNonexistent);
  }

  // create goal data
  let goal_data = goal_data_service::add(
    &mut sp,
    user.user_id,
    goal.goal_id,
    props.name,
    props.tags,
    props.duration_estimate,
    props.time_utility_function_id,
    props.parent_goal_id,
    props.time_span,
    props.status,
  )
  .await
  .map_err(report_postgres_err)?;

  sp.commit().await.map_err(report_postgres_err)?;

  // return json
  fill_goal_data(con, goal_data).await
}

pub async fn time_utility_function_new(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::TimeUtilityFunctionNewProps,
) -> Result<response::TimeUtilityFunction, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key).await?;

  // check that utils length == start_times length
  if props.start_times.len() != props.utils.len() {
    return Err(response::TodoAppError::TimeUtilityFunctionNotValid);
  }

  let con = &mut *db.lock().await;

  // create tuf
  let time_utility_function =
    time_utility_function_service::add(con, user.user_id, props.start_times, props.utils)
      .await
      .map_err(report_postgres_err)?;

  // return json
  fill_time_utility_function(con, time_utility_function).await
}

pub async fn external_event_view(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::ExternalEventViewProps,
) -> Result<Vec<response::ExternalEvent>, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key.clone()).await?;

  let con = &mut *db.lock().await;
  // get users
  let external_events = external_event_service::query(con, props)
    .await
    .map_err(report_postgres_err)?;

  // return external_events
  let mut resp_external_events = vec![];
  for u in external_events
    .into_iter()
    .filter(|u| u.creator_user_id == user.user_id)
  {
    resp_external_events.push(fill_external_event(con, u).await?);
  }

  Ok(resp_external_events)
}

pub async fn external_event_data_view(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::ExternalEventDataViewProps,
) -> Result<Vec<response::ExternalEventData>, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key.clone()).await?;

  let con = &mut *db.lock().await;
  // get users
  let external_event_data = external_event_data_service::query(con, props)
    .await
    .map_err(report_postgres_err)?;
  // return users
  // return external_event_datas
  let mut resp_external_event_datas = vec![];
  for u in external_event_data
    .into_iter()
    .filter(|u| u.creator_user_id == user.user_id)
  {
    resp_external_event_datas.push(fill_external_event_data(con, u).await?);
  }

  Ok(resp_external_event_datas)
}
pub async fn goal_intent_view(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalIntentViewProps,
) -> Result<Vec<response::GoalIntent>, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key.clone()).await?;

  let con = &mut *db.lock().await;
  // get users
  let goal_intents = goal_intent_service::query(con, props)
    .await
    .map_err(report_postgres_err)?;

  // return goal_intents
  let mut resp_goal_intents = vec![];
  for u in goal_intents
    .into_iter()
    .filter(|u| u.creator_user_id == user.user_id)
  {
    resp_goal_intents.push(fill_goal_intent(con, u).await?);
  }

  Ok(resp_goal_intents)
}

pub async fn goal_intent_data_view(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalIntentDataViewProps,
) -> Result<Vec<response::GoalIntentData>, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key.clone()).await?;

  let con = &mut *db.lock().await;
  // get users
  let goal_intent_data = goal_intent_data_service::query(con, props)
    .await
    .map_err(report_postgres_err)?;
  // return users
  // return goal_intent_datas
  let mut resp_goal_intent_datas = vec![];
  for u in goal_intent_data
    .into_iter()
    .filter(|u| u.creator_user_id == user.user_id)
  {
    resp_goal_intent_datas.push(fill_goal_intent_data(con, u).await?);
  }

  Ok(resp_goal_intent_datas)
}

pub async fn goal_view(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalViewProps,
) -> Result<Vec<response::Goal>, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key.clone()).await?;

  let con = &mut *db.lock().await;
  // get users
  let goals = goal_service::query(con, props)
    .await
    .map_err(report_postgres_err)?;

  // return goals
  let mut resp_goals = vec![];
  for u in goals
    .into_iter()
    .filter(|u| u.creator_user_id == user.user_id)
  {
    resp_goals.push(fill_goal(con, u).await?);
  }

  Ok(resp_goals)
}

pub async fn goal_data_view(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalDataViewProps,
) -> Result<Vec<response::GoalData>, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key.clone()).await?;

  let con = &mut *db.lock().await;
  // get users
  let goal_data = goal_data_service::query(con, props)
    .await
    .map_err(report_postgres_err)?;

  // return goal_datas
  let mut resp_goal_datas = vec![];
  for u in goal_data
    .into_iter()
    .filter(|u| u.creator_user_id == user.user_id)
  {
    resp_goal_datas.push(fill_goal_data(con, u).await?);
  }

  Ok(resp_goal_datas)
}

pub async fn time_utility_function_view(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::TimeUtilityFunctionViewProps,
) -> Result<Vec<response::TimeUtilityFunction>, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key.clone()).await?;

  let con = &mut *db.lock().await;
  // get users
  let time_utility_function = time_utility_function_service::query(con, props)
    .await
    .map_err(report_postgres_err)?;
  // return time_utility_functions
  let mut resp_time_utility_functions = vec![];
  for u in time_utility_function
    .into_iter()
    .filter(|u| u.creator_user_id == user.user_id)
  {
    resp_time_utility_functions.push(fill_time_utility_function(con, u).await?);
  }

  Ok(resp_time_utility_functions)
}
