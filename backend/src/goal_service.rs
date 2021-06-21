use super::todo_app_db_types::*;
use super::utils::current_time_millis;
use todo_app_service_api::request;
use tokio_postgres::GenericClient;

impl From<tokio_postgres::row::Row> for Goal {
  // select * from goal order only, otherwise it will fail
  fn from(row: tokio_postgres::Row) -> Goal {
    Goal {
      goal_id: row.get("goal_id"),
      creation_time: row.get("creation_time"),
      creator_user_id: row.get("creator_user_id"),
      goal_intent_id: row.get("goal_intent_id"),
    }
  }
}

pub async fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
  goal_intent_id: Option<i64>,
) -> Result<Goal, tokio_postgres::Error> {
  let creation_time = current_time_millis();

  let goal_id = con
    .query_one(
      "INSERT INTO
       goal(
           creation_time,
           creator_user_id,
           goal_intent_id
       )
       VALUES($1, $2, $3)
       RETURNING goal_id
      ",
      &[&creation_time, &creator_user_id, &goal_intent_id],
    )
    .await?
    .get(0);

  // return goal
  Ok(Goal {
    goal_id,
    creation_time,
    creator_user_id,
    goal_intent_id,
  })
}

pub async fn get_by_goal_id(
  con: &mut impl GenericClient,
  goal_id: i64,
) -> Result<Option<Goal>, tokio_postgres::Error> {
  let result = con
    .query_opt("SELECT * FROM goal WHERE goal_id=$1", &[&goal_id])
    .await?
    .map(|x| x.into());

  Ok(result)
}

pub async fn query(
  con: &mut impl GenericClient,
  props: request::GoalViewProps,
) -> Result<Vec<Goal>, tokio_postgres::Error> {
  let sql = "SELECT g.* FROM goal g WHERE 1 = 1
     AND ($1::bigint IS NULL OR g.goal_id = $1)
     AND ($2::bigint IS NULL OR g.creation_time >= $2)
     AND ($3::bigint IS NULL OR g.creation_time <= $3)
     AND ($4::bigint IS NULL OR g.creator_user_id = $4)
     AND ($5::bigint IS NULL OR g.goal_intent_id = $5 IS TRUE)
     ORDER BY g.goal_id
     OFFSET $6,
     LIMIT $7";

  let stmnt = con.prepare(sql).await?;

  let results = con
    .query(
      &stmnt,
      &[
        &props.goal_id,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
        &props.goal_intent_id,
        &props.offset,
        &props.count,
      ],
    )
    .await?
    .into_iter()
    .map(|x| x.into())
    .collect();
  Ok(results)
}
