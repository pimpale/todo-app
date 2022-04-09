use super::db_types::*;
use todo_app_service_api::request;
use tokio_postgres::GenericClient;

impl From<tokio_postgres::row::Row> for Goal {
  // select * from goal order only, otherwise it will fail
  fn from(row: tokio_postgres::Row) -> Goal {
    Goal {
      goal_id: row.get("goal_id"),
      creation_time: row.get("creation_time"),
      creator_user_id: row.get("creator_user_id"),
    }
  }
}

pub async fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
) -> Result<Goal, tokio_postgres::Error> {

  let row = con
    .query_one(
      "INSERT INTO
       goal(
           creator_user_id
       )
       VALUES($1)
       RETURNING goal_id, creation_time
      ",
      &[&creator_user_id],
    )
    .await?;

  // return goal
  Ok(Goal {
    goal_id: row.get(0),
    creation_time: row.get(1),
    creator_user_id,
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
     ORDER BY g.goal_id
     ";

  let stmnt = con.prepare(sql).await?;

  let results = con
    .query(
      &stmnt,
      &[
        &props.goal_id,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
      ],
    )
    .await?
    .into_iter()
    .map(|x| x.into())
    .collect();
  Ok(results)
}
