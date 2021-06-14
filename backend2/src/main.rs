#![feature(async_closure)]
#![feature(never_type)]
use clap::Clap;
use rusqlite::Connection;
use std::sync::Arc;

use tokio::sync::Mutex;

mod utils;

use auth_service_api::client::AuthService;

// db web stuff
mod goal_intent_service;
mod goal_intent_data_service;
mod goal_service;
mod goal_data_service;
mod past_event_service;
mod time_utility_function_point_service;
mod time_utility_function_service;
mod todo_app_api;
mod todo_app_db_types;
mod todo_app_handlers;

static SERVICE_NAME: &str = "todo-app-service";

#[derive(Clap, Clone)]
struct Opts {
  #[clap(short, long)]
  site_external_url: String,
  #[clap(short, long)]
  database_url: String,
  #[clap(short, long)]
  auth_service_url: String,
  #[clap(short, long)]
  port: u16,
}

#[derive(Clone)]
pub struct Config {
  pub site_external_url: String,
}

pub type Db = Arc<Mutex<Connection>>;

#[tokio::main]
async fn main() {
  let Opts {
    database_url,
    site_external_url,
    auth_service_url,
    port,
  } = Opts::parse();

  let db: Db = Arc::new(Mutex::new(Connection::open(database_url).unwrap()));

  // open connection to auth service
  let auth_service = AuthService::new(&auth_service_url).await;

  let api = todo_app_api::api(
      Config { site_external_url },
      db,
      auth_service
  );

  warp::serve(api).run(([127, 0, 0, 1], port)).await;
}
