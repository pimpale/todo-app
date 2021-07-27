use super::db_types::*;
use super::utils::current_time_millis;
use std::convert::From;
use tokio_postgres::GenericClient;

impl From<tokio_postgres::row::Row> for GoalEvent {
  // select * from goal_event order only, otherwise it will fail
  fn from(row: tokio_postgres::Row) -> GoalEvent {
    GoalEvent {
      goal_event_id: row.get("goal_event_id"),
      creation_time: row.get("creation_time"),
      creator_user_id: row.get("creator_user_id"),
      goal_id: row.get("goal_id"),
      start_time: row.get("start_time"),
      end_time: row.get("end_time"),
      active: row.get("active"),
    }
  }
}

// TODO we need to figure out a way to make scheduled and unscheduled goals work better
pub async fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
  goal_id: i64,
  start_time: i64,
  end_time: i64,
  active: bool,
) -> Result<GoalEvent, tokio_postgres::Error> {
  let creation_time = current_time_millis();

  let goal_event_id = con
    .query_one(
      "INSERT INTO
       goal_event(
           creation_time,
           creator_user_id,
           goal_id,
           start_time,
           end_time,
           active
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING goal_event_id
      ",
      &[
        &creation_time,
        &creator_user_id,
        &goal_id,
        &start_time,
        &end_time,
        &active,
      ],
    )
    .await?
    .get(0);

  Ok(GoalEvent {
    goal_event_id,
    creation_time,
    creator_user_id,
    goal_id,
    start_time,
    end_time,
    active,
  })
}

pub async fn get_by_goal_event_id(
  con: &mut impl GenericClient,
  goal_event_id: &i64,
) -> Result<Option<GoalEvent>, tokio_postgres::Error> {
  let result = con
    .query_opt(
      "SELECT * FROM goal_event WHERE goal_event_id=$1",
      &[&goal_event_id],
    )
    .await?
    .map(|x| x.into());

  Ok(result)
}

pub async fn query(
  con: &mut impl GenericClient,
  props: todo_app_service_api::request::GoalEventViewProps,
) -> Result<Vec<GoalEvent>, tokio_postgres::Error> {
  let sql = [
    if props.only_recent {
      "SELECT ge.* FROM recent_goal_event ge"
    } else {
      "SELECT ge.* FROM goal_event ge"
    },
    " WHERE 1 = 1",
    " AND ($1::bigint[] IS NULL OR ge.goal_event_id = ANY($1))",
    " AND ($2::bigint   IS NULL OR ge.creation_time >= $2)",
    " AND ($3::bigint   IS NULL OR ge.creation_time <= $3)",
    " AND ($4::bigint[] IS NULL OR ge.creator_user_id = ANY($4))",
    " AND ($5::bigint[] IS NULL OR ge.goal_id = ANY($5))",
    " AND ($6::bigint   IS NULL OR ge.start_time >= $6)",
    " AND ($7::bigint   IS NULL OR ge.start_time <= $7)",
    " AND ($8::bigint   IS NULL OR ge.end_time >= $8)",
    " AND ($9::bigint   IS NULL OR ge.end_time <= $9)",
    " AND ($10::bool    IS NULL OR ge.active = $10)",
    " ORDER BY ge.goal_event_id",
  ]
  .join("\n");

  let stmnt = con.prepare(&sql).await?;

  let results = con
    .query(
      &stmnt,
      &[
        &props.goal_event_id,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
        &props.goal_id,
        &props.min_start_time,
        &props.max_start_time,
        &props.min_end_time,
        &props.max_end_time,
        &props.active,
      ],
    )
    .await?
    .into_iter()
    .map(|row| row.into())
    .collect();

  Ok(results)
}
