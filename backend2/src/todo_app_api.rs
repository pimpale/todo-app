use super::todo_app_handlers;
use super::utils;
use super::Config;
use super::Db;
use super::SERVICE_NAME;
use todo_app_service_api::response::TodoAppError;
use mail_service_api::client::MailService;
use std::collections::HashMap;
use std::convert::Infallible;
use std::future::Future;
use warp::http::StatusCode;
use warp::Filter;

/// The function that will show all ones to call
pub fn api(
  config: Config,
  db: Db,
  mail_service: MailService,
) -> impl Filter<Extract = impl warp::Reply, Error = Infallible> + Clone {
  // public API
  api_info()
    .or(adapter(
      config.clone(),
      db.clone(),
      mail_service.clone(),
      warp::path!("public" / "goal" / "new"),
      todo_app_handlers::goal_new,
    ))
    .or(adapter(
      config.clone(),
      db.clone(),
      mail_service.clone(),
      warp::path!("public" / "goal" / "new_scheduled"),
      todo_app_handlers::goal_new_scheduled,
    ))
    .or(adapter(
      config.clone(),
      db.clone(),
      mail_service.clone(),
      warp::path!("public" / "goal_data" / "new"),
      todo_app_handlers::goal_data_new,
    ))
    .or(adapter(
      config.clone(),
      db.clone(),
      mail_service.clone(),
      warp::path!("public" / "goal_data" / "new_scheduled"),
      todo_app_handlers::goal_data_new_scheduled,
    ))
    .or(adapter(
      config.clone(),
      db.clone(),
      mail_service.clone(),
      warp::path!("public" / "time_utility_function" / "new"),
      todo_app_handlers::time_utility_function_new,
    ))
    .or(adapter(
      config.clone(),
      db.clone(),
      mail_service.clone(),
      warp::path!("public" / "past_event" / "new"),
      todo_app_handlers::past_event_new,
    ))
    .or(adapter(
      config.clone(),
      db.clone(),
      mail_service.clone(),
      warp::path!("public" / "past_event_data" / "new"),
      todo_app_handlers::past_event_data_new,
    ))
    .or(adapter(
      config.clone(),
      db.clone(),
      mail_service.clone(),
      warp::path!("public" / "goal" / "view"),
      todo_app_handlers::goal_view,
    ))
    .or(adapter(
      config.clone(),
      db.clone(),
      mail_service.clone(),
      warp::path!("public" / "goal_data" / "view"),
      todo_app_handlers::goal_data_view,
    ))
    .or(adapter(
      config.clone(),
      db.clone(),
      mail_service.clone(),
      warp::path!("public" / "past_event" / "view"),
      todo_app_handlers::past_event_view,
    ))
    .or(adapter(
      config.clone(),
      db.clone(),
      mail_service.clone(),
      warp::path!("public" / "past_event_data" / "view"),
      todo_app_handlers::past_event_data_view,
    ))
    .or(adapter(
      config.clone(),
      db.clone(),
      mail_service.clone(),
      warp::path!("public" / "api_key" / "view"),
      todo_app_handlers::api_key_view,
    ))
      .recover(handle_rejection)
}

fn api_info() -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
  let mut info = HashMap::new();
  info.insert("version", "0.1");
  info.insert("name", SERVICE_NAME);
  warp::path!("info").map(move || warp::reply::json(&info))
}

// this function adapts a handler function to a warp filter
// it accepts an initial path filter
fn adapter<PropsType, ResponseType, F>(
  config: Config,
  db: Db,
  mail_service: MailService,
  filter: impl Filter<Extract = (), Error = warp::Rejection> + Clone,
  handler: fn(Config, Db, MailService, PropsType) -> F,
) -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone
where
  F: Future<Output = Result<ResponseType, TodoAppError>> + Send,
  PropsType: Send + serde::de::DeserializeOwned,
  ResponseType: Send + serde::ser::Serialize,
{
  // lets you pass in an arbitrary parameter
  fn with<T: Clone + Send>(t: T) -> impl Filter<Extract = (T,), Error = Infallible> + Clone {
    warp::any().map(move || t.clone())
  }

  filter
    .and(with(config))
    .and(with(db))
    .and(with(mail_service))
    .and(warp::body::json())
    .and_then(async move |config, db, mail_service, props| {
      handler(config, db, mail_service, props)
        .await
        .map_err(todo_app_error)
    })
    .map(|x| warp::reply::json(&Ok::<ResponseType, ()>(x)))
}

// This function receives a `Rejection` and tries to return a custom
// value, otherwise simply passes the rejection along.
async fn handle_rejection(err: warp::Rejection) -> Result<impl warp::Reply, Infallible> {
  let code;
  let message;

  if err.is_not_found() {
    code = StatusCode::NOT_FOUND;
    message = TodoAppError::NotFound;
  } else if err
    .find::<warp::filters::body::BodyDeserializeError>()
    .is_some()
  {
    message = TodoAppError::DecodeError;
    code = StatusCode::BAD_REQUEST;
  } else if err.find::<warp::reject::MethodNotAllowed>().is_some() {
    code = StatusCode::METHOD_NOT_ALLOWED;
    message = TodoAppError::MethodNotAllowed;
  } else if let Some(TodoAppErrorRejection(todo_app_error)) = err.find() {
    code = StatusCode::BAD_REQUEST;
    message = todo_app_error.clone();
  } else {
    // We should have expected this... Just log and say its a 500
    utils::log(utils::Event {
      msg: "intercepted unknown error kind".to_owned(),
      source: None,
      severity: utils::SeverityKind::Error,
    });
    code = StatusCode::INTERNAL_SERVER_ERROR;
    message = TodoAppError::Unknown;
  }

  Ok(warp::reply::with_status(
    warp::reply::json(&Err::<(), TodoAppError>(message)),
    code,
  ))
}

// This type represents errors that we can generate
// These will be automatically converted to a proper string later
#[derive(Debug)]
pub struct TodoAppErrorRejection(pub TodoAppError);
impl warp::reject::Reject for TodoAppErrorRejection {}

fn todo_app_error(todo_app_error: TodoAppError) -> warp::reject::Rejection {
  warp::reject::custom(TodoAppErrorRejection(todo_app_error))
}
