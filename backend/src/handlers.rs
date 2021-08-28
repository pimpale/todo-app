use super::Db;
use auth_service_api::client::AuthService;
use auth_service_api::response::AuthError;
use auth_service_api::response::User;

use todo_app_service_api::request;
use todo_app_service_api::response;

use super::db_types::*;
use super::utils;

use super::external_event_data_service;
use super::external_event_service;
use super::goal_data_service;
use super::goal_dependency_service;
use super::goal_entity_tag_service;
use super::goal_event_service;
use super::goal_service;
use super::goal_template_data_service;
use super::goal_template_pattern_service;
use super::goal_template_service;
use super::named_entity_data_service;
use super::named_entity_pattern_service;
use super::named_entity_service;
use super::time_utility_function_service;
use super::user_generated_code_service;

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
        AuthError::Network => response::TodoAppError::InternalServerError,
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

async fn fill_goal(
  _con: &mut tokio_postgres::Client,
  goal: Goal,
) -> Result<response::Goal, response::TodoAppError> {
  Ok(response::Goal {
    goal_id: goal.goal_id,
    creation_time: goal.creation_time,
    creator_user_id: goal.creator_user_id,
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

  Ok(response::GoalData {
    goal_data_id: goal_data.goal_data_id,
    creation_time: goal_data.creation_time,
    creator_user_id: goal_data.creator_user_id,
    goal: fill_goal(con, goal).await?,
    name: goal_data.name,
    duration_estimate: goal_data.duration_estimate,
    time_utility_function: fill_time_utility_function(con, time_utility_function).await?,
    status: goal_data.status,
  })
}

async fn fill_goal_event(
  con: &mut tokio_postgres::Client,
  goal_event: GoalEvent,
) -> Result<response::GoalEvent, response::TodoAppError> {
  let goal = goal_service::get_by_goal_id(con, goal_event.goal_id)
    .await
    .map_err(report_postgres_err)?
    .ok_or(response::TodoAppError::GoalNonexistent)?;

  Ok(response::GoalEvent {
    goal_event_id: goal_event.goal_event_id,
    creation_time: goal_event.creation_time,
    creator_user_id: goal_event.creator_user_id,
    goal: fill_goal(con, goal).await?,
    start_time: goal_event.start_time,
    end_time: goal_event.end_time,
    active: goal_event.active,
  })
}

async fn fill_goal_dependency(
  con: &mut tokio_postgres::Client,
  goal_dependency: GoalDependency,
) -> Result<response::GoalDependency, response::TodoAppError> {
  let goal = goal_service::get_by_goal_id(con, goal_dependency.goal_id)
    .await
    .map_err(report_postgres_err)?
    .ok_or(response::TodoAppError::GoalNonexistent)?;

  let dependent_goal = goal_service::get_by_goal_id(con, goal_dependency.dependent_goal_id)
    .await
    .map_err(report_postgres_err)?
    .ok_or(response::TodoAppError::GoalNonexistent)?;

  Ok(response::GoalDependency {
    goal_dependency_id: goal_dependency.goal_dependency_id,
    creation_time: goal_dependency.creation_time,
    creator_user_id: goal_dependency.creator_user_id,
    goal: fill_goal(con, goal).await?,
    dependent_goal: fill_goal(con, dependent_goal).await?,
    active: goal_dependency.active,
  })
}

async fn fill_goal_entity_tag(
  con: &mut tokio_postgres::Client,
  goal_entity_tag: GoalEntityTag,
) -> Result<response::GoalEntityTag, response::TodoAppError> {
  let goal = goal_service::get_by_goal_id(con, goal_entity_tag.goal_id)
    .await
    .map_err(report_postgres_err)?
    .ok_or(response::TodoAppError::GoalNonexistent)?;

  let named_entity =
    named_entity_service::get_by_named_entity_id(con, goal_entity_tag.named_entity_id)
      .await
      .map_err(report_postgres_err)?
      .ok_or(response::TodoAppError::NamedEntityNonexistent)?;

  Ok(response::GoalEntityTag {
    goal_entity_tag_id: goal_entity_tag.goal_entity_tag_id,
    creation_time: goal_entity_tag.creation_time,
    creator_user_id: goal_entity_tag.creator_user_id,
    goal: fill_goal(con, goal).await?,
    named_entity: fill_named_entity(con, named_entity).await?,
    active: goal_entity_tag.active,
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

async fn fill_goal_template(
  _con: &mut tokio_postgres::Client,
  goal_template: GoalTemplate,
) -> Result<response::GoalTemplate, response::TodoAppError> {
  Ok(response::GoalTemplate {
    goal_template_id: goal_template.goal_template_id,
    creation_time: goal_template.creation_time,
    creator_user_id: goal_template.creator_user_id,
  })
}

async fn fill_goal_template_data(
  con: &mut tokio_postgres::Client,
  goal_template_data: GoalTemplateData,
) -> Result<response::GoalTemplateData, response::TodoAppError> {
  let goal_template =
    goal_template_service::get_by_goal_template_id(con, goal_template_data.goal_template_id)
      .await
      .map_err(report_postgres_err)?
      .ok_or(response::TodoAppError::GoalTemplateNonexistent)?;

  let user_generated_code = user_generated_code_service::get_by_user_generated_code_id(
    con,
    goal_template_data.user_generated_code_id,
  )
  .await
  .map_err(report_postgres_err)?
  .ok_or(response::TodoAppError::UserGeneratedCodeNonexistent)?;

  Ok(response::GoalTemplateData {
    goal_template_data_id: goal_template_data.goal_template_id,
    creation_time: goal_template_data.creation_time,
    creator_user_id: goal_template_data.creator_user_id,
    goal_template: fill_goal_template(con, goal_template).await?,
    name: goal_template_data.name,
    utility: goal_template_data.utility,
    duration_estimate: goal_template_data.duration_estimate,
    user_generated_code: fill_user_generated_code(con, user_generated_code).await?,
    active: goal_template_data.active,
  })
}

async fn fill_goal_template_pattern(
  con: &mut tokio_postgres::Client,
  goal_template_pattern: GoalTemplatePattern,
) -> Result<response::GoalTemplatePattern, response::TodoAppError> {
  let goal_template =
    goal_template_service::get_by_goal_template_id(con, goal_template_pattern.goal_template_id)
      .await
      .map_err(report_postgres_err)?
      .ok_or(response::TodoAppError::GoalTemplateNonexistent)?;

  Ok(response::GoalTemplatePattern {
    goal_template_pattern_id: goal_template_pattern.goal_template_id,
    creation_time: goal_template_pattern.creation_time,
    creator_user_id: goal_template_pattern.creator_user_id,
    goal_template: fill_goal_template(con, goal_template).await?,
    pattern: goal_template_pattern.pattern,
    active: goal_template_pattern.active,
  })
}

async fn fill_user_generated_code(
  _con: &mut tokio_postgres::Client,
  user_generated_code: UserGeneratedCode,
) -> Result<response::UserGeneratedCode, response::TodoAppError> {
  Ok(response::UserGeneratedCode {
    user_generated_code_id: user_generated_code.user_generated_code_id,
    creation_time: user_generated_code.creation_time,
    creator_user_id: user_generated_code.creator_user_id,
    source_code: user_generated_code.source_code,
    source_lang: user_generated_code.source_lang,
    wasm_cache: user_generated_code.wasm_cache,
  })
}

async fn fill_named_entity(
  _con: &mut tokio_postgres::Client,
  named_entity: NamedEntity,
) -> Result<response::NamedEntity, response::TodoAppError> {
  Ok(response::NamedEntity {
    named_entity_id: named_entity.named_entity_id,
    creation_time: named_entity.creation_time,
    creator_user_id: named_entity.creator_user_id,
  })
}

async fn fill_named_entity_data(
  con: &mut tokio_postgres::Client,
  named_entity_data: NamedEntityData,
) -> Result<response::NamedEntityData, response::TodoAppError> {
  let named_entity =
    named_entity_service::get_by_named_entity_id(con, named_entity_data.named_entity_id)
      .await
      .map_err(report_postgres_err)?
      .ok_or(response::TodoAppError::NamedEntityNonexistent)?;

  Ok(response::NamedEntityData {
    named_entity_data_id: named_entity_data.named_entity_id,
    creation_time: named_entity_data.creation_time,
    creator_user_id: named_entity_data.creator_user_id,
    named_entity: fill_named_entity(con, named_entity).await?,
    name: named_entity_data.name,
    kind: named_entity_data.kind,
    active: named_entity_data.active,
  })
}

async fn fill_named_entity_pattern(
  con: &mut tokio_postgres::Client,
  named_entity_pattern: NamedEntityPattern,
) -> Result<response::NamedEntityPattern, response::TodoAppError> {
  let named_entity =
    named_entity_service::get_by_named_entity_id(con, named_entity_pattern.named_entity_id)
      .await
      .map_err(report_postgres_err)?
      .ok_or(response::TodoAppError::NamedEntityNonexistent)?;

  Ok(response::NamedEntityPattern {
    named_entity_pattern_id: named_entity_pattern.named_entity_id,
    creation_time: named_entity_pattern.creation_time,
    creator_user_id: named_entity_pattern.creator_user_id,
    named_entity: fill_named_entity(con, named_entity).await?,
    pattern: named_entity_pattern.pattern,
    active: named_entity_pattern.active,
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

pub async fn goal_new(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalNewProps,
) -> Result<response::GoalData, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key).await?;

  // validate start and end time
  if let Some((start_time, end_time)) = props.time_span {
    if start_time < 0 {
      return Err(response::TodoAppError::NegativeStartTime);
    }
    if start_time >= end_time {
      return Err(response::TodoAppError::NegativeDuration);
    }
  }

  // validate duration if exists
  if let Some(duration_estimate) = props.duration_estimate {
    if duration_estimate <= 0 {
      return Err(response::TodoAppError::NegativeDuration);
    }
  }

  let con = &mut *db.lock().await;

  let mut sp = con.transaction().await.map_err(report_postgres_err)?;

  // ensure time utility function exists and belongs to you
  let time_utility_function = time_utility_function_service::get_by_time_utility_function_id(
    &mut sp,
    props.time_utility_function_id,
  )
  .await
  .map_err(report_postgres_err)?
  .ok_or(response::TodoAppError::TimeUtilityFunctionNonexistent)?;
  // validate tuf is owned by correct user
  if time_utility_function.creator_user_id != user.user_id {
    return Err(response::TodoAppError::TimeUtilityFunctionNonexistent);
  }

  // create goal
  let goal = goal_service::add(&mut sp, user.user_id)
    .await
    .map_err(report_postgres_err)?;

  // create goal data
  let goal_data = goal_data_service::add(
    &mut sp,
    user.user_id,
    goal.goal_id,
    props.name,
    props.duration_estimate,
    props.time_utility_function_id,
    request::GoalDataStatusKind::Pending,
  )
  .await
  .map_err(report_postgres_err)?;

  // create goal event if provided
  if let Some((start_time, end_time)) = props.time_span {
    let goal_event = goal_event_service::add(
      &mut sp,
      user.user_id,
      goal.goal_id,
      start_time,
      end_time,
      true,
    )
    .await
    .map_err(report_postgres_err)?;
  }

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

  // validate duration if exists
  if let Some(duration_estimate) = props.duration_estimate {
    if duration_estimate <= 0 {
      return Err(response::TodoAppError::NegativeDuration);
    }
  }

  let con = &mut *db.lock().await;

  let mut sp = con.transaction().await.map_err(report_postgres_err)?;

  // ensure time utility function exists and belongs to you
  let time_utility_function = time_utility_function_service::get_by_time_utility_function_id(
    &mut sp,
    props.time_utility_function_id,
  )
  .await
  .map_err(report_postgres_err)?
  .ok_or(response::TodoAppError::TimeUtilityFunctionNonexistent)?;
  // validate function is owned by correct user
  if time_utility_function.creator_user_id != user.user_id {
    return Err(response::TodoAppError::TimeUtilityFunctionNonexistent);
  }

  // ensure that goal exists and belongs to you
  let goal = goal_service::get_by_goal_id(&mut sp, props.goal_id)
    .await
    .map_err(report_postgres_err)?
    .ok_or(response::TodoAppError::GoalNonexistent)?;
  // validate goal is owned by correct user
  if goal.creator_user_id != user.user_id {
    return Err(response::TodoAppError::GoalNonexistent);
  }

  // create goal data
  let goal_data = goal_data_service::add(
    &mut sp,
    user.user_id,
    goal.goal_id,
    props.name,
    props.duration_estimate,
    props.time_utility_function_id,
    props.status,
  )
  .await
  .map_err(report_postgres_err)?;

  sp.commit().await.map_err(report_postgres_err)?;

  // return json
  fill_goal_data(con, goal_data).await
}

pub async fn goal_event_new(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalEventNewProps,
) -> Result<response::GoalEvent, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key).await?;

  // validate time
  if props.start_time < 0 {
    return Err(response::TodoAppError::NegativeStartTime);
  }
  if props.start_time >= props.end_time {
    return Err(response::TodoAppError::NegativeDuration);
  }

  let con = &mut *db.lock().await;

  let mut sp = con.transaction().await.map_err(report_postgres_err)?;

  // ensure that goal exists and belongs to you
  let goal = goal_service::get_by_goal_id(&mut sp, props.goal_id)
    .await
    .map_err(report_postgres_err)?
    .ok_or(response::TodoAppError::GoalNonexistent)?;
  // validate goal is owned by correct user
  if goal.creator_user_id != user.user_id {
    return Err(response::TodoAppError::GoalNonexistent);
  }

  // create goal event
  let goal_event = goal_event_service::add(
    &mut sp,
    user.user_id,
    props.goal_id,
    props.start_time,
    props.end_time,
    props.active,
  )
  .await
  .map_err(report_postgres_err)?;

  sp.commit().await.map_err(report_postgres_err)?;

  // return json
  fill_goal_event(con, goal_event).await
}

pub async fn goal_dependency_new(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalDependencyNewProps,
) -> Result<response::GoalDependency, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key).await?;

  let con = &mut *db.lock().await;

  let mut sp = con.transaction().await.map_err(report_postgres_err)?;

  // ensure that goal exists and belongs to you
  let goal = goal_service::get_by_goal_id(&mut sp, props.goal_id)
    .await
    .map_err(report_postgres_err)?
    .ok_or(response::TodoAppError::GoalNonexistent)?;
  // validate goal is owned by correct user
  if goal.creator_user_id != user.user_id {
    return Err(response::TodoAppError::GoalNonexistent);
  }

  let dependent_goal = goal_service::get_by_goal_id(&mut sp, props.dependent_goal_id)
    .await
    .map_err(report_postgres_err)?
    .ok_or(response::TodoAppError::GoalNonexistent)?;
  // validate goal is owned by correct user
  if dependent_goal.creator_user_id != user.user_id {
    return Err(response::TodoAppError::GoalNonexistent);
  }

  // create goal dependency
  let goal_dependency = goal_dependency_service::add(
    &mut sp,
    user.user_id,
    props.goal_id,
    props.dependent_goal_id,
    props.active,
  )
  .await
  .map_err(report_postgres_err)?;

  sp.commit().await.map_err(report_postgres_err)?;

  // return json
  fill_goal_dependency(con, goal_dependency).await
}

pub async fn goal_template_new(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalTemplateNewProps,
) -> Result<response::GoalTemplateData, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key).await?;

  // validate duration if exists
  if let Some(duration_estimate) = props.duration_estimate {
    if duration_estimate <= 0 {
      return Err(response::TodoAppError::NegativeDuration);
    }
  }

  let con = &mut *db.lock().await;

  let mut sp = con.transaction().await.map_err(report_postgres_err)?;

  // ensure user generated code exists and belongs to you
  let user_generated_code = user_generated_code_service::get_by_user_generated_code_id(
    &mut sp,
    props.user_generated_code_id,
  )
  .await
  .map_err(report_postgres_err)?
  .ok_or(response::TodoAppError::UserGeneratedCodeNonexistent)?;
  // validate goal is owned by correct user
  if user_generated_code.creator_user_id != user.user_id {
    return Err(response::TodoAppError::UserGeneratedCodeNonexistent);
  }

  // create goal_template
  let goal_template = goal_template_service::add(&mut sp, user.user_id)
    .await
    .map_err(report_postgres_err)?;

  // create goal_template data
  let goal_template_data = goal_template_data_service::add(
    &mut sp,
    user.user_id,
    goal_template.goal_template_id,
    props.name,
    // TODO prevent negative utility somehow
    props.utility,
    props.duration_estimate,
    props.user_generated_code_id,
    true,
  )
  .await
  .map_err(report_postgres_err)?;

  sp.commit().await.map_err(report_postgres_err)?;

  // return json
  fill_goal_template_data(con, goal_template_data).await
}

pub async fn goal_template_data_new(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalTemplateDataNewProps,
) -> Result<response::GoalTemplateData, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key).await?;

  // validate duration if exists
  if let Some(duration_estimate) = props.duration_estimate {
    if duration_estimate <= 0 {
      return Err(response::TodoAppError::NegativeDuration);
    }
  }

  let con = &mut *db.lock().await;

  let mut sp = con.transaction().await.map_err(report_postgres_err)?;

  // ensure user generated code exists and belongs to you
  let user_generated_code = user_generated_code_service::get_by_user_generated_code_id(
    &mut sp,
    props.user_generated_code_id,
  )
  .await
  .map_err(report_postgres_err)?
  .ok_or(response::TodoAppError::UserGeneratedCodeNonexistent)?;
  // validate code is owned by correct user
  if user_generated_code.creator_user_id != user.user_id {
    return Err(response::TodoAppError::UserGeneratedCodeNonexistent);
  }

  // validate that parent template exists and belongs to you
  let goal_template =
    goal_template_service::get_by_goal_template_id(&mut sp, props.goal_template_id)
      .await
      .map_err(report_postgres_err)?
      .ok_or(response::TodoAppError::GoalTemplateNonexistent)?;
  // validate template is owned by correct user
  if goal_template.creator_user_id != user.user_id {
    return Err(response::TodoAppError::GoalTemplateNonexistent);
  }

  // create goal_template data
  let goal_template_data = goal_template_data_service::add(
    &mut sp,
    user.user_id,
    props.goal_template_id,
    props.name,
    // TODO prevent negative utility somehow
    props.utility,
    props.duration_estimate,
    props.user_generated_code_id,
    props.active,
  )
  .await
  .map_err(report_postgres_err)?;

  sp.commit().await.map_err(report_postgres_err)?;

  // return json
  fill_goal_template_data(con, goal_template_data).await
}

pub async fn goal_template_pattern_new(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalTemplatePatternNewProps,
) -> Result<response::GoalTemplatePattern, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key).await?;

  let con = &mut *db.lock().await;

  let mut sp = con.transaction().await.map_err(report_postgres_err)?;

  // validate that parent template exists and belongs to you
  let goal_template =
    goal_template_service::get_by_goal_template_id(&mut sp, props.goal_template_id)
      .await
      .map_err(report_postgres_err)?
      .ok_or(response::TodoAppError::GoalTemplateNonexistent)?;
  // validate template is owned by correct user
  if goal_template.creator_user_id != user.user_id {
    return Err(response::TodoAppError::GoalTemplateNonexistent);
  }

  // create goal_template pattern
  let goal_template_pattern = goal_template_pattern_service::add(
    &mut sp,
    user.user_id,
    props.goal_template_id,
    props.pattern,
    props.active,
  )
  .await
  .map_err(report_postgres_err)?;

  sp.commit().await.map_err(report_postgres_err)?;

  // return json
  fill_goal_template_pattern(con, goal_template_pattern).await
}

pub async fn goal_entity_tag_new(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalEntityTagNewProps,
) -> Result<response::GoalEntityTag, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key).await?;

  let con = &mut *db.lock().await;

  let mut sp = con.transaction().await.map_err(report_postgres_err)?;

  // validate that goal exists and belongs to you
  let goal = goal_service::get_by_goal_id(&mut sp, props.goal_id)
    .await
    .map_err(report_postgres_err)?
    .ok_or(response::TodoAppError::GoalNonexistent)?;
  // validate entity is owned by correct user
  if goal.creator_user_id != user.user_id {
    return Err(response::TodoAppError::GoalNonexistent);
  }

  // validate that named  entity exists and belongs to you
  let named_entity = named_entity_service::get_by_named_entity_id(&mut sp, props.named_entity_id)
    .await
    .map_err(report_postgres_err)?
    .ok_or(response::TodoAppError::NamedEntityNonexistent)?;
  // validate entity is owned by correct user
  if named_entity.creator_user_id != user.user_id {
    return Err(response::TodoAppError::NamedEntityNonexistent);
  }

  // create goal_entity tag
  let goal_entity_tag = goal_entity_tag_service::add(
    &mut sp,
    user.user_id,
    props.named_entity_id,
    props.goal_id,
    props.active,
  )
  .await
  .map_err(report_postgres_err)?;

  sp.commit().await.map_err(report_postgres_err)?;

  // return json
  fill_goal_entity_tag(con, goal_entity_tag).await
}

pub async fn named_entity_new(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::NamedEntityNewProps,
) -> Result<response::NamedEntityData, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key).await?;

  let con = &mut *db.lock().await;

  let mut sp = con.transaction().await.map_err(report_postgres_err)?;

  // create named_entity
  let named_entity = named_entity_service::add(&mut sp, user.user_id)
    .await
    .map_err(report_postgres_err)?;

  // create named_entity data
  let named_entity_data = named_entity_data_service::add(
    &mut sp,
    user.user_id,
    named_entity.named_entity_id,
    props.name,
    props.kind,
    true,
  )
  .await
  .map_err(report_postgres_err)?;

  sp.commit().await.map_err(report_postgres_err)?;

  // return json
  fill_named_entity_data(con, named_entity_data).await
}

pub async fn named_entity_data_new(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::NamedEntityDataNewProps,
) -> Result<response::NamedEntityData, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key).await?;

  let con = &mut *db.lock().await;

  let mut sp = con.transaction().await.map_err(report_postgres_err)?;

  // validate that parent entity exists and belongs to you
  let named_entity = named_entity_service::get_by_named_entity_id(&mut sp, props.named_entity_id)
    .await
    .map_err(report_postgres_err)?
    .ok_or(response::TodoAppError::NamedEntityNonexistent)?;
  // validate entity is owned by correct user
  if named_entity.creator_user_id != user.user_id {
    return Err(response::TodoAppError::NamedEntityNonexistent);
  }

  // create named_entity data
  let named_entity_data = named_entity_data_service::add(
    &mut sp,
    user.user_id,
    props.named_entity_id,
    props.name,
    props.kind,
    props.active,
  )
  .await
  .map_err(report_postgres_err)?;

  sp.commit().await.map_err(report_postgres_err)?;

  // return json
  fill_named_entity_data(con, named_entity_data).await
}

pub async fn named_entity_pattern_new(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::NamedEntityPatternNewProps,
) -> Result<response::NamedEntityPattern, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key).await?;

  let con = &mut *db.lock().await;

  let mut sp = con.transaction().await.map_err(report_postgres_err)?;

  // validate that parent entity exists and belongs to you
  let named_entity = named_entity_service::get_by_named_entity_id(&mut sp, props.named_entity_id)
    .await
    .map_err(report_postgres_err)?
    .ok_or(response::TodoAppError::NamedEntityNonexistent)?;
  // validate entity is owned by correct user
  if named_entity.creator_user_id != user.user_id {
    return Err(response::TodoAppError::NamedEntityNonexistent);
  }

  // create named_entity pattern
  let named_entity_pattern = named_entity_pattern_service::add(
    &mut sp,
    user.user_id,
    props.named_entity_id,
    props.pattern,
    props.active,
  )
  .await
  .map_err(report_postgres_err)?;

  sp.commit().await.map_err(report_postgres_err)?;

  // return json
  fill_named_entity_pattern(con, named_entity_pattern).await
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
pub async fn user_generated_code_new(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::UserGeneratedCodeNewProps,
) -> Result<response::UserGeneratedCode, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key).await?;

  let con = &mut *db.lock().await;

  // create ugc
  let user_generated_code = user_generated_code_service::add(
    con,
    user.user_id,
    props.source_code,
    props.source_lang,
    props.wasm_cache,
  )
  .await
  .map_err(report_postgres_err)?;

  // return json
  fill_user_generated_code(con, user_generated_code).await
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

pub async fn goal_template_view(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalTemplateViewProps,
) -> Result<Vec<response::GoalTemplate>, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key.clone()).await?;

  let con = &mut *db.lock().await;
  // get users
  let goal_templates = goal_template_service::query(con, props)
    .await
    .map_err(report_postgres_err)?;

  // return goal_templates
  let mut resp_goal_templates = vec![];
  for u in goal_templates
    .into_iter()
    .filter(|u| u.creator_user_id == user.user_id)
  {
    resp_goal_templates.push(fill_goal_template(con, u).await?);
  }

  Ok(resp_goal_templates)
}

pub async fn goal_template_data_view(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalTemplateDataViewProps,
) -> Result<Vec<response::GoalTemplateData>, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key.clone()).await?;

  let con = &mut *db.lock().await;
  // get users
  let goal_template_data = goal_template_data_service::query(con, props)
    .await
    .map_err(report_postgres_err)?;

  // return goal_template_datas
  let mut resp_goal_template_datas = vec![];
  for u in goal_template_data
    .into_iter()
    .filter(|u| u.creator_user_id == user.user_id)
  {
    resp_goal_template_datas.push(fill_goal_template_data(con, u).await?);
  }

  Ok(resp_goal_template_datas)
}

pub async fn goal_template_pattern_view(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalTemplatePatternViewProps,
) -> Result<Vec<response::GoalTemplatePattern>, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key.clone()).await?;

  let con = &mut *db.lock().await;
  // get users
  let goal_template_pattern = goal_template_pattern_service::query(con, props)
    .await
    .map_err(report_postgres_err)?;

  // return goal_template_patterns
  let mut resp_goal_template_patterns = vec![];
  for u in goal_template_pattern
    .into_iter()
    .filter(|u| u.creator_user_id == user.user_id)
  {
    resp_goal_template_patterns.push(fill_goal_template_pattern(con, u).await?);
  }

  Ok(resp_goal_template_patterns)
}

pub async fn goal_event_view(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalEventViewProps,
) -> Result<Vec<response::GoalEvent>, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key.clone()).await?;

  let con = &mut *db.lock().await;
  // get users
  let goal_event = goal_event_service::query(con, props)
    .await
    .map_err(report_postgres_err)?;

  // return goal_events
  let mut resp_goal_events = vec![];
  for u in goal_event
    .into_iter()
    .filter(|u| u.creator_user_id == user.user_id)
  {
    resp_goal_events.push(fill_goal_event(con, u).await?);
  }

  Ok(resp_goal_events)
}

pub async fn goal_dependency_view(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalDependencyViewProps,
) -> Result<Vec<response::GoalDependency>, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key.clone()).await?;

  let con = &mut *db.lock().await;
  // get users
  let goal_dependency = goal_dependency_service::query(con, props)
    .await
    .map_err(report_postgres_err)?;

  // return goal_dependencys
  let mut resp_goal_dependencys = vec![];
  for u in goal_dependency
    .into_iter()
    .filter(|u| u.creator_user_id == user.user_id)
  {
    resp_goal_dependencys.push(fill_goal_dependency(con, u).await?);
  }

  Ok(resp_goal_dependencys)
}

pub async fn goal_entity_tag_view(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::GoalEntityTagViewProps,
) -> Result<Vec<response::GoalEntityTag>, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key.clone()).await?;

  let con = &mut *db.lock().await;
  // get users
  let goal_entity_tag = goal_entity_tag_service::query(con, props)
    .await
    .map_err(report_postgres_err)?;

  // return goal_entity_tags
  let mut resp_goal_entity_tags = vec![];
  for u in goal_entity_tag
    .into_iter()
    .filter(|u| u.creator_user_id == user.user_id)
  {
    resp_goal_entity_tags.push(fill_goal_entity_tag(con, u).await?);
  }

  Ok(resp_goal_entity_tags)
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

pub async fn user_generated_code_view(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::UserGeneratedCodeViewProps,
) -> Result<Vec<response::UserGeneratedCode>, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key.clone()).await?;

  let con = &mut *db.lock().await;
  // get users
  let user_generated_code = user_generated_code_service::query(con, props)
    .await
    .map_err(report_postgres_err)?;
  // return user_generated_codes
  let mut resp_user_generated_codes = vec![];
  for u in user_generated_code
    .into_iter()
    .filter(|u| u.creator_user_id == user.user_id)
  {
    resp_user_generated_codes.push(fill_user_generated_code(con, u).await?);
  }

  Ok(resp_user_generated_codes)
}

pub async fn named_entity_view(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::NamedEntityViewProps,
) -> Result<Vec<response::NamedEntity>, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key.clone()).await?;

  let con = &mut *db.lock().await;
  // get users
  let named_entitys = named_entity_service::query(con, props)
    .await
    .map_err(report_postgres_err)?;

  // return named_entitys
  let mut resp_named_entitys = vec![];
  for u in named_entitys
    .into_iter()
    .filter(|u| u.creator_user_id == user.user_id)
  {
    resp_named_entitys.push(fill_named_entity(con, u).await?);
  }

  Ok(resp_named_entitys)
}

pub async fn named_entity_data_view(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::NamedEntityDataViewProps,
) -> Result<Vec<response::NamedEntityData>, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key.clone()).await?;

  let con = &mut *db.lock().await;
  // get users
  let named_entity_data = named_entity_data_service::query(con, props)
    .await
    .map_err(report_postgres_err)?;

  // return named_entity_datas
  let mut resp_named_entity_datas = vec![];
  for u in named_entity_data
    .into_iter()
    .filter(|u| u.creator_user_id == user.user_id)
  {
    resp_named_entity_datas.push(fill_named_entity_data(con, u).await?);
  }

  Ok(resp_named_entity_datas)
}

pub async fn named_entity_pattern_view(
  _config: Config,
  db: Db,
  auth_service: AuthService,
  props: request::NamedEntityPatternViewProps,
) -> Result<Vec<response::NamedEntityPattern>, response::TodoAppError> {
  // validate api key
  let user = get_user_if_api_key_valid(&auth_service, props.api_key.clone()).await?;

  let con = &mut *db.lock().await;
  // get users
  let named_entity_pattern = named_entity_pattern_service::query(con, props)
    .await
    .map_err(report_postgres_err)?;

  // return named_entity_patterns
  let mut resp_named_entity_patterns = vec![];
  for u in named_entity_pattern
    .into_iter()
    .filter(|u| u.creator_user_id == user.user_id)
  {
    resp_named_entity_patterns.push(fill_named_entity_pattern(con, u).await?);
  }

  Ok(resp_named_entity_patterns)
}
