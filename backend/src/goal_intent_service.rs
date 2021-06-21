use super::todo_app_db_types::*;
use super::utils::current_time_millis;
use tokio_postgres::GenericClient;
use todo_app_service_api::request;

impl From<tokio_postgres::row::Row> for GoalIntent {
  // select * from goal_intent order only, otherwise it will fail
  fn from(row: tokio_postgres::row::Row) -> GoalIntent {
    GoalIntent {
      goal_intent_id: row.get("goal_intent_id"),
      creation_time: row.get("creation_time"),
      creator_user_id: row.get("creator_user_id"),
    }
  }
}

pub async fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
) -> Result<GoalIntent, tokio_postgres::Error> {
  let creation_time = current_time_millis();

  let goal_intent_id = con
    .query_one(
      "INSERT INTO
       goal_intent(
           creation_time,
           creator_user_id
       )
       VALUES($1, $2)
       RETURNING goal_intent_id
      ",
      &[&creation_time, &creator_user_id],
    ).await?
    .get(0);

  // return goal_intent
  Ok(GoalIntent {
    goal_intent_id,
    creation_time,
    creator_user_id,
  })
}

pub async fn get_by_goal_intent_id(
  con: &mut impl GenericClient,
  goal_intent_id: i64,
) -> Result<Option<GoalIntent>, tokio_postgres::Error> {
  let result = con
    .query_opt(
      "SELECT * FROM goal_intent WHERE goal_intent_id=$1",
      &[&goal_intent_id],
    ).await?
    .map(|x| x.into());

  Ok(result)
}

pub async fn query(
  con: &mut impl GenericClient,
  props: request::GoalIntentViewProps,
) -> Result<Vec<GoalIntent>, tokio_postgres::Error> {
  let results = con
    .query(
      " SELECT gi.* FROM goal_intent gi WHERE 1 = 1
        AND ($1::bigint IS NULL OR gi.goal_intent_id = $1)
        AND ($2::bigint IS NULL OR gi.creation_time >= $2)
        AND ($3::bigint IS NULL OR gi.creation_time <= $3)
        AND ($4::bigint IS NULL OR gi.creator_user_id = $4)
        ORDER BY gi.goal_intent_id
        LIMIT $5
        OFFSET $6
      ",
      &[
        &props.goal_intent_id,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
        &props.count.unwrap_or(100),
        &props.offset.unwrap_or(0),
      ],
    ).await?
    .into_iter()
    .map(|row| row.into())
    .collect();

  Ok(results)
}
