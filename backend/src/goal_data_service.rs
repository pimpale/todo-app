use super::todo_app_db_types::*;
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
      tags: row.get("tags"),
      duration_estimate: row.get("duration_estimate"),
      time_utility_function_id: row.get("time_utility_function_id"),
      parent_goal_id: row.get("parent_goal_id"),
      time_span: match (row.get("start_time"), row.get("end_time")) {
        (Some(start_time), Some(end_time)) => Some((start_time, end_time)),
        _ => None,
      },
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
  tags: Vec<String>,
  duration_estimate: i64,
  time_utility_function_id: i64,
  parent_goal_id: Option<i64>,
  time_span: Option<(i64, i64)>,
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
           tags,
           duration_estimate,
           time_utility_function_id,
           parent_goal_id,
           start_time,
           end_time,
           status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING goal_data_id
      ",
      &[
        &creation_time,
        &creator_user_id,
        &goal_id,
        &name,
        &tags,
        &duration_estimate,
        &time_utility_function_id,
        &parent_goal_id,
        &time_span.map(|x| x.0),
        &time_span.map(|x| x.1),
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
    tags,
    duration_estimate,
    time_utility_function_id,
    parent_goal_id,
    time_span,
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
    "SELECT gd.* FROM goal_data gd",
    " JOIN goal g ON gd.goal_id = g.goal_id",
    if props.only_recent {
      " INNER JOIN (SELECT max(goal_data_id) id FROM goal_data GROUP BY goal_id) maxids
        ON maxids.id = gd.goal_data_id"
    } else {
      ""
    },
    " WHERE 1 = 1",
    " AND ($1::bigint  IS NULL OR gd.goal_data_id = $1)",
    " AND ($2::bigint  IS NULL OR gd.creation_time >= $2)",
    " AND ($3::bigint  IS NULL OR gd.creation_time <= $3)",
    " AND ($4::bigint  IS NULL OR gd.creator_user_id = $4)",
    " AND ($5::bigint  IS NULL OR gd.goal_id = $5)",
    " AND ($6::text    IS NULL OR gd.name = $6)",
    " AND ($7::text    IS NULL OR gd.name LIKE CONCAT('%',$7,'%'))",
    " AND ($8::text[]  IS NULL OR gd.tags @> $8)",
    " AND ($9::bigint  IS NULL OR gd.duration_estimate >= $9)",
    " AND ($10::bigint IS NULL OR gd.duration_estimate <= $10)",
    " AND ($11::bigint IS NULL OR gd.time_utility_function_id = $11)",
    " AND ($12::bigint IS NULL OR gd.parent_goal_id = $12 IS TRUE)",
    " AND ($13::bigint IS NULL OR gd.start_time >= $13 IS TRUE)",
    " AND ($14::bigint IS NULL OR gd.start_time <= $14 IS TRUE)",
    " AND ($15::bigint IS NULL OR gd.end_time >= $15 IS TRUE)",
    " AND ($16::bigint IS NULL OR gd.end_time <= $16 IS TRUE)",
    " AND ($17::bigint IS NULL OR gd.status = $17)",
    " AND ($18::bigint IS NULL OR g.goal_intent_id = $18 IS TRUE)",
    " AND ($19::bool IS NULL OR gd.start_time IS NOT NULL = $19)",
    " ORDER BY gd.goal_data_id",
    " LIMIT $20",
    " OFFSET $21",
  ]
  .join("");

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
        &props.partial_name,
        &props.tags,
        &props.min_duration_estimate,
        &props.max_duration_estimate,
        &props.time_utility_function_id,
        &props.parent_goal_id,
        &props.min_start_time,
        &props.max_start_time,
        &props.min_end_time,
        &props.max_end_time,
        &props.status.map(|x| x as i64),
        &props.goal_intent_id,
        &props.scheduled,
        &props.count.unwrap_or(100),
        &props.offset.unwrap_or(0),
      ],
    )
    .await?
    .into_iter()
    .map(|row| row.into())
    .collect();

  Ok(results)
}
