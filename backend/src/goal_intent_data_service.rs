use super::db_types::*;
use super::utils::current_time_millis;
use std::convert::From;
use tokio_postgres::GenericClient;

impl From<tokio_postgres::row::Row> for GoalIntentData {
  // select * from goal_intent_data order only, otherwise it will fail
  fn from(row: tokio_postgres::Row) -> GoalIntentData {
    GoalIntentData {
      goal_intent_data_id: row.get("goal_intent_data_id"),
      creation_time: row.get("creation_time"),
      creator_user_id: row.get("creator_user_id"),
      goal_intent_id: row.get("goal_intent_id"),
      name: row.get("name"),
      active: row.get("active"),
    }
  }
}

// TODO we need to figure out a way to make scheduled and unscheduled goals work better
pub async fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
  goal_intent_id: i64,
  name: String,
  active: bool,
) -> Result<GoalIntentData, tokio_postgres::Error> {
  let creation_time = current_time_millis();

  let goal_intent_data_id = con
    .query_one(
      "INSERT INTO
       goal_intent_data(
           creation_time,
           creator_user_id,
           goal_intent_id,
           name,
           active
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING goal_intent_data_id
      ",
      &[
        &creation_time,
        &creator_user_id,
        &goal_intent_id,
        &name,
        &active,
      ],
    )
    .await?
    .get(0);

  Ok(GoalIntentData {
    goal_intent_data_id,
    creation_time,
    creator_user_id,
    goal_intent_id,
    name,
    active,
  })
}

pub async fn get_by_goal_intent_data_id(
  con: &mut impl GenericClient,
  goal_intent_data_id: &i64,
) -> Result<Option<GoalIntentData>, tokio_postgres::Error> {
  let result = con
    .query_opt(
      "SELECT * FROM goal_intent_data WHERE goal_intent_data_id=$1",
      &[&goal_intent_data_id],
    )
    .await?
    .map(|x| x.into());

  Ok(result)
}

pub async fn query(
  con: &mut impl GenericClient,
  props: todo_app_service_api::request::GoalIntentDataViewProps,
) -> Result<Vec<GoalIntentData>, tokio_postgres::Error> {
  let sql = [
    if props.only_recent {
      "SELECT gid.* FROM recent_goal_intent_data gid"
    } else {
      "SELECT gid.* FROM goal_intent_data gid"
    },
    " WHERE 1 = 1",
    " AND ($1::bigint[] IS NULL OR gid.goal_intent_data_id = ANY($1))",
    " AND ($2::bigint   IS NULL OR gid.creation_time >= $2)",
    " AND ($3::bigint   IS NULL OR gid.creation_time <= $3)",
    " AND ($4::bigint[] IS NULL OR gid.creator_user_id = ANY($4))",
    " AND ($5::bigint[] IS NULL OR gid.goal_intent_id = ANY($5))",
    " AND ($6::text[]   IS NULL OR gid.name = ANY($6))",
    " AND ($7::bool     IS NULL OR gid.active = $7)",
    " ORDER BY gid.goal_intent_data_id",
  ]
  .join("\n");

  let stmnt = con.prepare(&sql).await?;

  let results = con
    .query(
      &stmnt,
      &[
        &props.goal_intent_data_id,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
        &props.goal_intent_id,
        &props.name,
        &props.active,
      ],
    )
    .await?
    .into_iter()
    .map(|row| row.into())
    .collect();

  Ok(results)
}
