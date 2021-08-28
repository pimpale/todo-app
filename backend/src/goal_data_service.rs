use super::db_types::*;
use super::utils::current_time_millis;
use std::convert::TryInto;
use todo_app_service_api::request;
use tokio_postgres::GenericClient;

impl From<tokio_postgres::row::Row> for GoalData {
  // select * from goal_data order only, otherwise it will fail
  fn from(row: tokio_postgres::Row) -> GoalData {
    GoalData {
      goal_data_id: row.get("goal_data_id"),
      creation_time: row.get("creation_time"),
      creator_user_id: row.get("creator_user_id"),
      goal_id: row.get("goal_id"),
      name: row.get("name"),
      duration_estimate: row.get("duration_estimate"),
      time_utility_function_id: row.get("time_utility_function_id"),
      status: (row.get::<_, i64>("status") as u8).try_into().unwrap(),
    }
  }
}

// TODO we need to figure out a way to make scheduled and unscheduled goals work better
pub async fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
  goal_id: i64,
  name: String,
  duration_estimate: Option<i64>,
  time_utility_function_id: i64,
  status: request::GoalDataStatusKind,
) -> Result<GoalData, tokio_postgres::Error> {
  let creation_time = current_time_millis();

  let goal_data_id = con
    .query_one(
      "INSERT INTO
       goal_data(
           creation_time,
           creator_user_id,
           goal_id,
           name,
           duration_estimate,
           time_utility_function_id,
           status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING goal_data_id
      ",
      &[
        &creation_time,
        &creator_user_id,
        &goal_id,
        &name,
        &duration_estimate,
        &time_utility_function_id,
        &(status.clone() as i64),
      ],
    )
    .await?
    .get(0);

  // return goal_data
  Ok(GoalData {
    goal_data_id,
    creation_time,
    creator_user_id,
    goal_id,
    name,
    duration_estimate,
    time_utility_function_id,
    status,
  })
}

pub async fn get_by_goal_data_id(
  con: &mut impl GenericClient,
  goal_data_id: i64,
) -> Result<Option<GoalData>, tokio_postgres::Error> {
  let result = con
    .query_opt(
      "SELECT * FROM goal_data WHERE goal_data_id=$1",
      &[&goal_data_id],
    )
    .await?
    .map(|x| x.into());
  Ok(result)
}

pub async fn query(
  con: &mut impl GenericClient,
  props: todo_app_service_api::request::GoalDataViewProps,
) -> Result<Vec<GoalData>, tokio_postgres::Error> {
  let sql = [
    if props.only_recent {
      "SELECT gd.* FROM recent_goal_data gd"
    } else {
      "SELECT gd.* FROM goal_data gd"
    },
    " INNER JOIN goal g ON gd.goal_id = g.goal_id",
    " LEFT JOIN recent_goal_event ge ON ge.goal_id = gd.goal_id",
    " WHERE 1 = 1",
    " AND ($1::bigint[]  IS NULL OR gd.goal_data_id = ANY($1))",
    " AND ($2::bigint    IS NULL OR gd.creation_time >= $2)",
    " AND ($3::bigint    IS NULL OR gd.creation_time <= $3)",
    " AND ($4::bigint[]  IS NULL OR gd.creator_user_id = ANY($4))",
    " AND ($5::bigint[]  IS NULL OR gd.goal_id = ANY($5))",
    " AND ($6::text[]    IS NULL OR gd.name = ANY($6))",
    " AND ($7::bigint    IS NULL OR gd.duration_estimate >= $7)",
    " AND ($8::bigint    IS NULL OR gd.duration_estimate <= $8)",
    " AND ($9::bool      IS NULL OR gd.duration_estimate IS NOT NULL)",
    " AND ($10::bigint[] IS NULL OR gd.time_utility_function_id = ANY($10))",
    " AND ($11::bigint[] IS NULL OR gd.status = ANY($11))",
    " AND ($12::bool     IS NULL OR (ge.active IS TRUE) = $12)",
    " ORDER BY gd.goal_data_id",
  ]
  .join("\n");

  let stmnt = con.prepare(&sql).await?;

  let results = con
    .query(
      &stmnt,
      &[
        &props.goal_data_id,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
        &props.goal_id,
        &props.name,
        &props.min_duration_estimate,
        &props.max_duration_estimate,
        &props.concrete,
        &props.time_utility_function_id,
        &props
          .status
          .map(|x| x.into_iter().map(|x| x as i64).collect::<Vec<i64>>()),
        &props.scheduled,
      ],
    )
    .await?
    .into_iter()
    .map(|row| row.into())
    .collect();

  Ok(results)
}
