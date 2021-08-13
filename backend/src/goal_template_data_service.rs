use super::db_types::*;
use super::utils::current_time_millis;
use std::convert::From;
use tokio_postgres::GenericClient;

impl From<tokio_postgres::row::Row> for GoalTemplateData {
  // select * from goal_template_data order only, otherwise it will fail
  fn from(row: tokio_postgres::Row) -> GoalTemplateData {
    GoalTemplateData {
      goal_template_data_id: row.get("goal_template_data_id"),
      creation_time: row.get("creation_time"),
      creator_user_id: row.get("creator_user_id"),
      goal_template_id: row.get("goal_template_id"),
      name: row.get("name"),
      utility: row.get("utility"),
      duration_estimate: row.get("duration_estimate"),
      user_generated_code_id: row.get("user_generated_code_id"),
      active: row.get("active"),
    }
  }
}

// TODO we need to figure out a way to make scheduled and unscheduled goals work better
pub async fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
  goal_template_id: i64,
  name: String,
  utility: i64,
  duration_estimate: Option<i64>,
  user_generated_code_id: i64,
  active: bool,
) -> Result<GoalTemplateData, tokio_postgres::Error> {
  let creation_time = current_time_millis();

  let goal_template_data_id = con
    .query_one(
      "INSERT INTO
       goal_template_data(
           creation_time,
           creator_user_id,
           goal_template_id,
           name,
           utility,
           duration_estimate,
           user_generated_code_id,
           active
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING goal_template_data_id
      ",
      &[
        &creation_time,
        &creator_user_id,
        &goal_template_id,
        &name,
        &utility,
        &duration_estimate,
        &user_generated_code_id,
        &active,
      ],
    )
    .await?
    .get(0);

  Ok(GoalTemplateData {
    goal_template_data_id,
    creation_time,
    creator_user_id,
    goal_template_id,
    name,
    utility,
    user_generated_code_id,
    duration_estimate,
    active,
  })
}

pub async fn get_by_goal_template_data_id(
  con: &mut impl GenericClient,
  goal_template_data_id: &i64,
) -> Result<Option<GoalTemplateData>, tokio_postgres::Error> {
  let result = con
    .query_opt(
      "SELECT * FROM goal_template_data WHERE goal_template_data_id=$1",
      &[&goal_template_data_id],
    )
    .await?
    .map(|x| x.into());

  Ok(result)
}

pub async fn query(
  con: &mut impl GenericClient,
  props: todo_app_service_api::request::GoalTemplateDataViewProps,
) -> Result<Vec<GoalTemplateData>, tokio_postgres::Error> {
  let sql = [
    if props.only_recent {
      "SELECT gtd.* FROM recent_goal_template_data gtd"
    } else {
      "SELECT gtd.* FROM goal_template_data gtd"
    },
    " WHERE 1 = 1",
    " AND ($1::bigint[]  IS NULL OR gtd.goal_template_data_id = ANY($1))",
    " AND ($2::bigint    IS NULL OR gtd.creation_time >= $2)",
    " AND ($3::bigint    IS NULL OR gtd.creation_time <= $3)",
    " AND ($4::bigint[]  IS NULL OR gtd.creator_user_id = ANY($4))",
    " AND ($5::bigint[]  IS NULL OR gtd.goal_template_id = ANY($5))",
    " AND ($6::text[]    IS NULL OR gtd.name = ANY($6))",
    " AND ($7::bigint    IS NULL OR gtd.utility >= $7)",
    " AND ($8::bigint    IS NULL OR gtd.utility <= $8)",
    " AND ($9::bigint    IS NULL OR gtd.duration_estimate >= $9)",
    " AND ($10::bigint   IS NULL OR gtd.duration_estimate <= $10)",
    " AND ($11::bool     IS NULL OR gtd.duration_estimate IS NOT NULL)",
    " AND ($12::bigint[] IS NULL OR gtd.user_generated_code_id = ANY($12))",
    " AND ($13::bool     IS NULL OR gtd.active = $13)",
    " ORDER BY gtd.goal_template_data_id",
  ]
  .join("\n");

  let stmnt = con.prepare(&sql).await?;

  let results = con
    .query(
      &stmnt,
      &[
        &props.goal_template_data_id,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
        &props.goal_template_id,
        &props.name,
        &props.min_utility,
        &props.max_utility,
        &props.min_duration_estimate,
        &props.max_duration_estimate,
        &props.concrete,
        &props.user_generated_code_id,
        &props.active,
      ],
    )
    .await?
    .into_iter()
    .map(|row| row.into())
    .collect();

  Ok(results)
}
