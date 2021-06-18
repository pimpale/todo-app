use super::todo_app_db_types::*;
use super::utils::current_time_millis;
use tokio_postgres::GenericClient;
use std::convert::TryInto;
use todo_app_service_api::request;

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
      parent_goal_id: row.get("parent_goal_id"),
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
  duration_estimate: i64,
  time_utility_function_id: i64,
  parent_goal_id: Option<i64>,
  status: request::GoalDataStatusKind,
) -> Result<GoalData, tokio_postgres::Error> {
  let creation_time = current_time_millis();

  let goal_data_id = con.query_one(
    "INSERT INTO
     goal_data(
         creation_time,
         creator_user_id,
         goal_id,
         name,
         duration_estimate,
         time_utility_function_id,
         parent_goal_id,
         status
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING goal_data_id
    ",
    &[
      &creation_time,
      &creator_user_id,
      &goal_id,
      &name,
      &duration_estimate,
      &time_utility_function_id,
      &parent_goal_id,
      &(status.clone() as i64)
    ],
  ).await?.get(0);

  // return goal_data
  Ok(GoalData {
    goal_data_id,
    creation_time,
    creator_user_id,
    goal_id,
    name,
    duration_estimate,
    time_utility_function_id,
    parent_goal_id,
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
    ).await?
    .map(|x| x.into());
  Ok(result)
}

pub async fn query(
  con: &mut impl GenericClient,
  props: todo_app_service_api::request::GoalDataViewProps,
) -> Result<Vec<GoalData>, tokio_postgres::Error> {
  let sql = [
    "SELECT gd.* FROM goal_data gd",
    " JOIN goal g ON gd.goal_id = g.goal_id",
    if props.only_recent {
        " INNER JOIN (SELECT max(goal_data_id) id FROM goal_data GROUP BY goal_id) maxids
        ON maxids.id = gd.goal_data_id"
    } else {
        ""
    },
    " WHERE 1 = 1",
    " AND ($1  == NULL OR gd.goal_data_id = $1)",
    " AND ($2  == NULL OR gd.creation_time = $2)",
    " AND ($3  == NULL OR gd.creation_time >= $3)",
    " AND ($4  == NULL OR gd.creation_time <= $4)",
    " AND ($5  == NULL OR gd.creator_user_id = $5)",
    " AND ($6  == NULL OR gd.goal_id = $6)",
    " AND ($7  == NULL OR gd.name = $7)",
    " AND ($8  == NULL OR gd.partial_name LIKE CONCAT('%',$8,'%'))",
    " AND ($9  == NULL OR gd.duration_estimate = $9)",
    " AND ($10 == NULL OR gd.duration_estimate >= $10)",
    " AND ($11 == NULL OR gd.duration_estimate <= $11)",
    " AND ($12 == NULL OR gd.time_utility_function_id = $12)",
    " AND ($13 == NULL OR gd.parent_goal_id = $13)",
    " AND ($14 == NULL OR gd.status = $14)",
    " AND ($15 == NULL OR g.goal_intent_id = $15)",
    " ORDER BY gd.goal_data_id",
    " LIMIT $16, $17",
  ]
  .join("");

  let stmnt = con.prepare(&sql).await?;

  let results = con
    .query(
        &stmnt,

        & [
        &props.goal_data_id,
        &props.creation_time,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
        &props.goal_id,
        &props.name,
        &props.partial_name,
        &props.duration_estimate,
        &props.min_duration_estimate,
        &props.max_duration_estimate,
        &props.time_utility_function_id,
        &props.parent_goal_id,
        &props.status.map(|x| x as i64),
        &props.goal_intent_id,
        &props.offset,
        &props.count,
    ]).await?
    .into_iter()
    .map(|row| row.into())
    .collect();

  Ok(results)
}
