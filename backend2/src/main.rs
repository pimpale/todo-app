#![feature(async_closure)]
#![feature(never_type)]
use clap::Clap;
use tokio_postgres::{Client, NoTls};
use std::sync::Arc;

use tokio::sync::Mutex;

mod utils;

use auth_service_api::client::AuthService;

// db web stuff
mod goal_intent_service;
mod goal_intent_data_service;
mod goal_service;
mod goal_data_service;
mod time_utility_function_service;
mod task_event_service;
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

pub type Db = Arc<Mutex<Client>>;

#[tokio::main]
async fn main() -> Result<(), tokio_postgres::Error> {
  let Opts {
    database_url,
    site_external_url,
    auth_service_url,
    port,
  } = Opts::parse();

  let (client, connection) = tokio_postgres::connect(&database_url, NoTls).await?;

  // The connection object performs the actual communication with the database,
  // so spawn it off to run on its own.
  tokio::spawn(async move {
    if let Err(e) = connection.await {
      eprintln!("connection error: {}", e);
    }
  });

  let db: Db = Arc::new(Mutex::new(client));

  // open connection to auth service
  let auth_service = AuthService::new(&auth_service_url).await;

  let api = todo_app_api::api(
      Config { site_external_url },
      db,
      auth_service
  );

  warp::serve(api).run(([0, 0, 0, 0], port)).await;

  Ok(())
}
