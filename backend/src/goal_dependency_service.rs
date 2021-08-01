use super::db_types::*;
use super::utils::current_time_millis;
use std::convert::From;
use tokio_postgres::GenericClient;

impl From<tokio_postgres::row::Row> for GoalDependency {
  // select * from goal_dependency order only, otherwise it will fail
  fn from(row: tokio_postgres::Row) -> GoalDependency {
    GoalDependency {
      goal_dependency_id: row.get("goal_dependency_id"),
      creation_time: row.get("creation_time"),
      creator_user_id: row.get("creator_user_id"),
      goal_id: row.get("goal_id"),
      dependent_goal_id: row.get("dependent_goal_id"),
      active: row.get("active"),
    }
  }
}

pub async fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
  goal_id: i64,
  dependent_goal_id: i64,
  active: bool,
) -> Result<GoalDependency, tokio_postgres::Error> {
  let creation_time = current_time_millis();

  let goal_dependency_id = con
    .query_one(
      "INSERT INTO
       goal_dependency(
           creation_time,
           creator_user_id,
           goal_id,
           dependent_goal_id,
           active
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING goal_dependency_id
      ",
      &[
        &creation_time,
        &creator_user_id,
        &goal_id,
        &dependent_goal_id,
        &active,
      ],
    )
    .await?
    .get(0);

  Ok(GoalDependency {
    goal_dependency_id,
    creation_time,
    creator_user_id,
    goal_id,
    dependent_goal_id,
    active,
  })
}

pub async fn get_by_goal_dependency_id(
  con: &mut impl GenericClient,
  goal_dependency_id: &i64,
) -> Result<Option<GoalDependency>, tokio_postgres::Error> {
  let result = con
    .query_opt(
      "SELECT * FROM goal_dependency WHERE goal_dependency_id=$1",
      &[&goal_dependency_id],
    )
    .await?
    .map(|x| x.into());

  Ok(result)
}

pub async fn query(
  con: &mut impl GenericClient,
  props: todo_app_service_api::request::GoalDependencyViewProps,
) -> Result<Vec<GoalDependency>, tokio_postgres::Error> {
  let sql = [
    if props.only_recent {
      "SELECT gd.* FROM recent_goal_dependency gd"
    } else {
      "SELECT gd.* FROM goal_dependency gd"
    },
    " WHERE 1 = 1",
    " AND ($1::bigint[]  IS NULL OR gd.goal_dependency_id = ANY($1))",
    " AND ($2::bigint    IS NULL OR gd.creation_time >= $2)",
    " AND ($3::bigint    IS NULL OR gd.creation_time <= $3)",
    " AND ($4::bigint[]  IS NULL OR gd.creator_user_id = ANY($4))",
    " AND ($5::bigint[]  IS NULL OR gd.goal_id = ANY($5))",
    " AND ($6::bigint[]  IS NULL OR gd.dependent_goal_id = ANY($6))",
    " AND ($7::bool      IS NULL OR gd.active = $7)",
    " ORDER BY gd.goal_dependency_id",
  ]
  .join("\n");

  let stmnt = con.prepare(&sql).await?;

  let results = con
    .query(
      &stmnt,
      &[
        &props.goal_dependency_id,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
        &props.goal_id,
        &props.dependent_goal_id,
        &props.active,
      ],
    )
    .await?
    .into_iter()
    .map(|row| row.into())
    .collect();

  Ok(results)
}
