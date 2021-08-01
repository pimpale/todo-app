use super::db_types::*;
use super::utils::current_time_millis;
use std::convert::From;
use tokio_postgres::GenericClient;

impl From<tokio_postgres::row::Row> for GoalEntityTag {
  // select * from goal_entity_tag order only, otherwise it will fail
  fn from(row: tokio_postgres::Row) -> GoalEntityTag {
    GoalEntityTag {
      goal_entity_tag_id: row.get("goal_entity_tag_id"),
      creation_time: row.get("creation_time"),
      creator_user_id: row.get("creator_user_id"),
      named_entity_id: row.get("named_entity_id"),
      goal_id: row.get("goal_id"),
      active: row.get("active"),
    }
  }
}

pub async fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
  named_entity_id: i64,
  goal_id: i64,
  active: bool,
) -> Result<GoalEntityTag, tokio_postgres::Error> {
  let creation_time = current_time_millis();

  let goal_entity_tag_id = con
    .query_one(
      "INSERT INTO
       goal_entity_tag(
           creation_time,
           creator_user_id,
           named_entity_id,
           goal_id,
           active
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING goal_entity_tag_id
      ",
      &[
        &creation_time,
        &creator_user_id,
        &named_entity_id,
        &goal_id,
        &active,
      ],
    )
    .await?
    .get(0);

  Ok(GoalEntityTag {
    goal_entity_tag_id,
    creation_time,
    creator_user_id,
    named_entity_id,
    goal_id,
    active,
  })
}

pub async fn get_by_goal_entity_tag_id(
  con: &mut impl GenericClient,
  goal_entity_tag_id: &i64,
) -> Result<Option<GoalEntityTag>, tokio_postgres::Error> {
  let result = con
    .query_opt(
      "SELECT * FROM goal_entity_tag WHERE goal_entity_tag_id=$1",
      &[&goal_entity_tag_id],
    )
    .await?
    .map(|x| x.into());

  Ok(result)
}

pub async fn query(
  con: &mut impl GenericClient,
  props: todo_app_service_api::request::GoalEntityTagViewProps,
) -> Result<Vec<GoalEntityTag>, tokio_postgres::Error> {
  let sql = [
    if props.only_recent {
      "SELECT get.* FROM recent_goal_entity_tag get"
    } else {
      "SELECT get.* FROM goal_entity_tag get"
    },
    " WHERE 1 = 1",
    " AND ($1::bigint[]  IS NULL OR get.goal_entity_tag_id = ANY($1))",
    " AND ($2::bigint    IS NULL OR get.creation_time >= $2)",
    " AND ($3::bigint    IS NULL OR get.creation_time <= $3)",
    " AND ($4::bigint[]  IS NULL OR get.creator_user_id = ANY($4))",
    " AND ($5::bigint[]  IS NULL OR get.named_entity_id = ANY($5))",
    " AND ($6::bigint[]  IS NULL OR get.goal_id = ANY($6))",
    " AND ($7::bool      IS NULL OR get.active = $7)",
    " ORDER BY get.goal_entity_tag_id",
  ]
  .join("\n");

  let stmnt = con.prepare(&sql).await?;

  let results = con
    .query(
      &stmnt,
      &[
        &props.goal_entity_tag_id,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
        &props.named_entity_id,
        &props.goal_id,
        &props.active,
      ],
    )
    .await?
    .into_iter()
    .map(|row| row.into())
    .collect();

  Ok(results)
}
