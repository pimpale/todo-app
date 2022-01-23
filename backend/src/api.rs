use super::handlers;
use super::utils;
use super::Config;
use super::Db;
use super::SERVICE_NAME;
use auth_service_api::client::AuthService;
use std::convert::Infallible;
use std::future::Future;
use todo_app_service_api::response;
use todo_app_service_api::response::TodoAppError;
use warp::http::StatusCode;
use warp::Filter;

/// Helper to combine the multiple filters together with Filter::or, possibly boxing the types in
/// the process. This greatly helps the build times for `ipfs-http`.
/// https://github.com/seanmonstar/warp/issues/507#issuecomment-615974062
macro_rules! combine {
  ($x:expr, $($y:expr),+) => {{
      let filter = ($x).boxed();
      $( let filter = (filter.or($y)).boxed(); )+
      filter
  }}
}

/// The function that will show all ones to call
pub fn api(
    config: Config,
    db: Db,
    auth_service: AuthService,
) -> impl Filter<Extract = impl warp::Reply, Error = Infallible> + Clone {
    // public API
    combine!(
        api_info(),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "goal" / "new"),
            handlers::goal_new,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "goal_data" / "new"),
            handlers::goal_data_new,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "goal_dependency" / "new"),
            handlers::goal_dependency_new,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "goal_entity_tag" / "new"),
            handlers::goal_entity_tag_new,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "goal_event" / "new"),
            handlers::goal_event_new,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "goal_template" / "new"),
            handlers::goal_template_new,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "goal_template_data" / "new"),
            handlers::goal_template_data_new,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "goal_template_pattern" / "new"),
            handlers::goal_template_pattern_new,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "named_entity" / "new"),
            handlers::named_entity_new,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "named_entity_data" / "new"),
            handlers::named_entity_data_new,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "named_entity_pattern" / "new"),
            handlers::named_entity_pattern_new,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "user_generated_code" / "new"),
            handlers::user_generated_code_new,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "time_utility_function" / "new"),
            handlers::time_utility_function_new,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "external_event" / "new"),
            handlers::external_event_new,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "external_event_data" / "new"),
            handlers::external_event_data_new,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "goal" / "view"),
            handlers::goal_view,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "goal_data" / "view"),
            handlers::goal_data_view,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "external_event" / "view"),
            handlers::external_event_view,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "goal_event" / "view"),
            handlers::goal_event_view,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "goal_entity_tag" / "view"),
            handlers::goal_entity_tag_view,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "goal_dependency" / "view"),
            handlers::goal_dependency_view,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "named_entity" / "view"),
            handlers::named_entity_view,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "named_entity_data" / "view"),
            handlers::named_entity_data_view,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "named_entity_pattern" / "view"),
            handlers::named_entity_pattern_view,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "goal_template" / "view"),
            handlers::goal_template_view,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "goal_template_data" / "view"),
            handlers::goal_template_data_view,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "goal_template_pattern" / "view"),
            handlers::goal_template_pattern_view,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "external_event_data" / "view"),
            handlers::external_event_data_view,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "time_utility_function" / "view"),
            handlers::time_utility_function_view,
        ),
        adapter(
            config.clone(),
            db.clone(),
            auth_service.clone(),
            warp::path!("public" / "user_generated_code" / "view"),
            handlers::user_generated_code_view,
        )
    )
    .recover(handle_rejection)
}

fn api_info() -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone {
    let info = response::Info {
        service: SERVICE_NAME.to_owned(),
        version_major: 1,
        version_minor: 0,
        version_rev: 0,
    };
    warp::path!("public" / "info").map(move || warp::reply::json(&info))
}

// this function adapts a handler function to a warp filter
// it accepts an initial path filter
fn adapter<PropsType, ResponseType, F>(
    config: Config,
    db: Db,
    auth_service: AuthService,
    filter: impl Filter<Extract = (), Error = warp::Rejection> + Clone,
    handler: fn(Config, Db, AuthService, PropsType) -> F,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone
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
        .and(with(auth_service))
        .and(warp::body::json())
        .and_then(move |config, db, auth_service, props| async move {
            handler(config, db, auth_service, props)
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
            source: format!("{:#?}", err),
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
