use super::Db;
use auth_service_api::client::AuthService;
use auth_service_api::response::AuthError;
use auth_service_api::response::User;

use todo_app_service_api::request;
use todo_app_service_api::response;

use super::todo_app_db_types::*;
use super::utils;

use super::goal_data_service;
use super::goal_intent_data_service;
use super::goal_intent_service;
use super::goal_service;
use super::task_event_service;
use super::time_utility_function_point_service;
use super::time_utility_function_service;

use std::error::Error;

use super::Config;

static FIFTEEN_MINUTES: u64 = 15 * 60 * 1000;

fn report_internal_err<E: std::error::Error>(e: E) -> response::TodoAppError {
  utils::log(utils::Event {
    msg: e.to_string(),
    source: e.source().map(|e| e.to_string()),
    severity: utils::SeverityKind::Error,
  });
  response::TodoAppError::Unknown
}

fn report_rusqlite_err(e: rusqlite::Error) -> response::TodoAppError {
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
      let ae = match e {
        AuthError::InternalServerError => response::TodoAppError::InternalServerError,
        AuthError::MethodNotAllowed => response::TodoAppError::InternalServerError,
        AuthError::BadRequest => response::TodoAppError::InternalServerError,
        AuthError::NetworkError => response::TodoAppError::InternalServerError,
        _ => response::TodoAppError::Unknown,
      };

      utils::log(utils::Event {
        msg: ae.as_ref().to_owned(),
        source: Some(format!("auth service: {}", e.as_ref())),
        severity: utils::SeverityKind::Error,
      });

      ae
    }
  }
}

fn fill_goal_intent(
  _con: &rusqlite::Connection,
  goal_intent: GoalIntent,
) -> Result<response::GoalIntent, response::TodoAppError> {
  Ok(response::GoalIntent {
    goal_intent_id: goal_intent.goal_intent_id,
    creation_time: goal_intent.creation_time,
    creator_user_id: goal_intent.creator_user_id,
  })
}

fn fill_goal_intent_data(
  con: &rusqlite::Connection,
  goal_intent_data: GoalIntentData,
) -> Result<response::GoalIntentData, response::TodoAppError> {
  Ok(response::GoalIntentData {
    goal_intent_data_id: goal_intent_data.goal_intent_data_id,
    creation_time: goal_intent_data.creation_time,
    creator_user_id: goal_intent_data.creator_user_id,
    goal_intent: fill_goal_intent(
      con,
      goal_intent_service::get_by_goal_intent_id(con, goal_intent_data.goal_intent_id)
        .map_err(report_rusqlite_err)?
        .ok_or(response::TodoAppError::GoalIntentNonexistent)?,
    )?,
    name: goal_intent_data.name,
    active: goal_intent_data.active,
  })
}

fn fill_goal(
  con: &rusqlite::Connection,
  goal: Goal,
) -> Result<response::Goal, response::TodoAppError> {
  Ok(response::Goal {
    goal_id: goal.goal_id,
    creation_time: goal.creation_time,
    creator_user_id: goal.creator_user_id,
    intent: match goal.goal_intent_id {
      Some(goal_intent_id) => Some(fill_goal_intent(
        con,
        goal_intent_service::get_by_goal_intent_id(con, goal_intent_id)
          .map_err(report_rusqlite_err)?
          .ok_or(response::TodoAppError::GoalIntentNonexistent)?,
      )?),
      _ => None,
    },
  })
}

fn fill_goal_data(
  con: &rusqlite::Connection,
  goal_data: GoalData,
) -> Result<response::GoalData, response::TodoAppError> {
  Ok(response::GoalData {
    goal_data_id: goal_data.goal_data_id,
    creation_time: goal_data.creation_time,
    creator_user_id: goal_data.creator_user_id,
    goal: fill_goal(
      con,
      goal_service::get_by_goal_id(con, goal_data.goal_id)
        .map_err(report_rusqlite_err)?
        .ok_or(response::TodoAppError::GoalNonexistent)?,
    )?,
    name: goal_data.name,
    duration_estimate: goal_data.duration_estimate,
    time_utility_function: fill_time_utility_function(
      con,
      time_utility_function_service::get_by_time_utility_function_id(
        con,
        goal_data.time_utility_function_id,
      )
      .map_err(report_rusqlite_err)?
      .ok_or(response::TodoAppError::TimeUtilityFunctionNonexistent)?,
    )?,
    parent_goal: match goal_data.parent_goal_id {
      Some(parent_goal_id) => Some(fill_goal(
        con,
        goal_service::get_by_goal_id(con, parent_goal_id)
          .map_err(report_rusqlite_err)?
          .ok_or(response::TodoAppError::GoalNonexistent)?,
      )?),
      _ => None,
    },
    status: goal_data.status,
  })
}

fn fill_time_utility_function(
  _con: &rusqlite::Connection,
  time_utility_function: TimeUtilityFunction,
) -> Result<response::TimeUtilityFunction, response::TodoAppError> {
  Ok(response::TimeUtilityFunction {
    time_utility_function_id: time_utility_function.time_utility_function_id,
    creation_time: time_utility_function.creation_time,
    creator_user_id: time_utility_function.creator_user_id,
  })
}

fn fill_task_event(
  con: &rusqlite::Connection,
  task_event: TaskEvent,
  key: Option<String>,
) -> Result<response::TaskEvent, response::TodoAppError> {
  Ok(response::TaskEvent {
    task_event_id: task_event.task_event_id,
    creation_time: task_event.creation_time,
    creator_user_id: task_event.creator_user_id,
    goal: fill_goal(
      con,
      goal_service::get_by_goal_id(con, task_event.goal_id)
        .map_err(report_rusqlite_err)?
        .ok_or(response::TodoAppError::GoalNonexistent)?,
    )?,
    start_time: task_event.start_time,
    duration: task_event.duration,
    active: task_event.active,
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

pub async fn goal_intent_new(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalIntentNewProps,
) -> Result<response::GoalIntentData, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key).await?;

  let con = &mut *db.lock().await;

  let mut sp = con.savepoint().map_err(report_rusqlite_err)?;

  // create intent
  let goal_intent = goal_intent_service::add(&mut sp, user.user_id).map_err(report_rusqlite_err)?;

  // create data
  let goal_intent_data = goal_intent_data_service::add(
    &mut sp,
    user.user_id,
    goal_intent.goal_intent_id,
    props.name,
    true,
  )
  .map_err(report_rusqlite_err)?;

  sp.commit().map_err(report_rusqlite_err)?;

  // return json
  fill_goal_intent_data(con, goal_intent_data)
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

  let mut sp = con.savepoint().map_err(report_rusqlite_err)?;

  let goal_intent = goal_intent_service::get_by_goal_intent_id(&mut sp, props.goal_intent_id)
    .map_err(report_rusqlite_err)?
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
    true,
  )
  .map_err(report_rusqlite_err)?;

  sp.commit().map_err(report_rusqlite_err)?;

  // return json
  fill_goal_intent_data(con, goal_intent_data)
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

  let mut sp = con.savepoint().map_err(report_rusqlite_err)?;

  // ensure time utility function exists and belongs to you
  let time_utility_function = time_utility_function_service::get_by_time_utility_function_id(
    &mut sp,
    props.time_utility_function_id,
  )
  .map_err(report_rusqlite_err)?
  .ok_or(response::TodoAppError::TimeUtilityFunctionNonexistent)?;
  // validate intent is owned by correct user
  if time_utility_function.creator_user_id != user.user_id {
    return Err(response::TodoAppError::TimeUtilityFunctionNonexistent);
  }

  // validate that parent exists and belongs to you
  if let Some(parent_goal_id) = props.parent_goal_id {
    let goal = goal_service::get_by_goal_id(&mut sp, parent_goal_id)
      .map_err(report_rusqlite_err)?
      .ok_or(response::TodoAppError::GoalNonexistent)?;
    // validate intent is owned by correct user
    if goal.creator_user_id != user.user_id {
      return Err(response::TodoAppError::GoalNonexistent);
    }
  }

  // validate that intent exists and belongs to you
  if let Some(goal_intent_id) = props.goal_intent_id {
    let goal_intent = goal_intent_service::get_by_goal_intent_id(&mut sp, goal_intent_id)
      .map_err(report_rusqlite_err)?
      .ok_or(response::TodoAppError::GoalIntentNonexistent)?;
    // validate intent is owned by correct user
    if goal_intent.creator_user_id != user.user_id {
      return Err(response::TodoAppError::GoalIntentNonexistent);
    }
  }

  // create goal
  let goal =
    goal_service::add(&mut sp, user.user_id, props.goal_intent_id).map_err(report_rusqlite_err)?;

  // create goal data
  let goal_data = goal_data_service::add(
    &mut sp,
    user.user_id,
    goal.goal_id,
    props.name,
    props.duration_estimate,
    props.time_utility_function_id,
    props.parent_goal_id,
    request::GoalDataStatusKind::Pending,
  )
  .map_err(report_rusqlite_err)?;

  sp.commit().map_err(report_rusqlite_err)?;

  // return json
  fill_goal_data(con, goal_data)
}

pub async fn goal_data_new(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalIntentDataNewProps,
) -> Result<response::GoalIntentData, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key).await?;

  let con = &mut *db.lock().await;

  let mut sp = con.savepoint().map_err(report_rusqlite_err)?;

  let goal = goal_service::add(&mut sp, user.user_id).map_err(report_rusqlite_err)?;

  // validate intent is owned by correct user
  if goal.creator_user_id != user.user_id {
    return Err(response::TodoAppError::GoalIntentNonexistent);
  }

  // now we can update data
  let goal_data = goal_data_service::add(&mut sp, user.user_id, goal.goal_id, props.name, true)
    .map_err(report_rusqlite_err)?;

  sp.commit().map_err(report_rusqlite_err)?;

  // return json
  fill_goal_data(con, goal_data)
}

pub async fn password_new_reset(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::PasswordNewResetProps,
) -> Result<response::Password, response::TodoAppError> {
  // no api key verification needed

  let con = &mut *db.lock().await;

  // get password reset
  let psr = password_reset_service::get_by_password_reset_key_hash(
    con,
    &utils::hash_str(&props.password_reset_key),
  )
  .map_err(report_rusqlite_err)?
  .ok_or(response::TodoAppError::PasswordResetNonexistent)?;

  // deny if we alread created a password from this reset
  if password_service::exists_by_password_reset_key_hash(con, &psr.password_reset_key_hash)
    .map_err(report_rusqlite_err)?
  {
    return Err(response::TodoAppError::PasswordExistent);
  }

  // deny if timed out
  if FIFTEEN_MINUTES as i64 + psr.creation_time < utils::current_time_millis() {
    return Err(response::TodoAppError::PasswordResetTimedOut);
  }

  // reject insecure passwords
  if !utils::is_secure_password(&props.new_password) {
    return Err(response::TodoAppError::PasswordInsecure);
  }

  // attempt to hash password
  let new_password_hash = utils::hash_password(&props.new_password).map_err(report_internal_err)?;

  let mut sp = con.savepoint().map_err(report_rusqlite_err)?;

  // create password
  let password = password_service::add(
    &mut sp,
    psr.creator_user_id,
    request::PasswordKind::Reset,
    new_password_hash,
    psr.password_reset_key_hash,
  )
  .map_err(report_rusqlite_err)?;

  sp.commit().map_err(report_rusqlite_err)?;

  fill_password(con, password)
}

pub async fn password_new_cancel(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::PasswordNewCancelProps,
) -> Result<response::Password, response::TodoAppError> {
  let con = &mut *db.lock().await;

  // api key verification required
  let creator_key = get_user_if_api_key_valid(con, &props.api_key)?;

  let mut sp = con.savepoint().map_err(report_rusqlite_err)?;

  // create password
  let password = password_service::add(
    &mut sp,
    creator_key.creator_user_id,
    request::PasswordKind::Cancel,
    String::new(),
    String::new(),
  )
  .map_err(report_rusqlite_err)?;

  sp.commit().map_err(report_rusqlite_err)?;

  fill_password(con, password)
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
  let goal_intents = goal_intent_service::query(con, props).map_err(report_rusqlite_err)?;
  // return users
  goal_intents
    .into_iter()
    .map(|u| fill_goal_intent(con, u))
    .collect()
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
  .map_err(report_rusqlite_err)?;
  // return users
  goal_intent_data
    .into_iter()
    .map(|u| fill_goal_intent_data(con, u))
    .collect()
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
  let goals = goal_service::query(con, props).map_err(report_rusqlite_err)?;
  // return users
  goals
    .into_iter()
    .map(|u| fill_goal(con, u))
    .collect()
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
  .map_err(report_rusqlite_err)?;
  // return users
  goal_data
    .into_iter()
    .map(|u| fill_goal_data(con, u))
    .collect()
}

