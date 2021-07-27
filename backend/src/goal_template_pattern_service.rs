use super::db_types::*;
use super::utils::current_time_millis;
use std::convert::From;
use tokio_postgres::GenericClient;

impl From<tokio_postgres::row::Row> for GoalTemplatePattern {
  // select * from goal_template_pattern order only, otherwise it will fail
  fn from(row: tokio_postgres::Row) -> GoalTemplatePattern {
    GoalTemplatePattern {
      goal_template_pattern_id: row.get("goal_template_pattern_id"),
      creation_time: row.get("creation_time"),
      creator_user_id: row.get("creator_user_id"),
      goal_template_id: row.get("goal_template_id"),
      pattern: row.get("pattern"),
      active: row.get("active"),
    }
  }
}

// TODO we need to figure out a way to make scheduled and unscheduled goals work better
pub async fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
  goal_template_id: i64,
  pattern: String,
  active: bool,
) -> Result<GoalTemplatePattern, tokio_postgres::Error> {
  let creation_time = current_time_millis();

  let goal_template_pattern_id = con
    .query_one(
      "INSERT INTO
       goal_template_pattern(
           creation_time,
           creator_user_id,
           goal_template_id,
           pattern,
           active
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING goal_template_pattern_id
      ",
      &[
        &creation_time,
        &creator_user_id,
        &goal_template_id,
        &pattern,
        &active,
      ],
    )
    .await?
    .get(0);

  Ok(GoalTemplatePattern {
    goal_template_pattern_id,
    creation_time,
    creator_user_id,
    goal_template_id,
    pattern,
    active,
  })
}

pub async fn get_by_goal_template_pattern_id(
  con: &mut impl GenericClient,
  goal_template_pattern_id: &i64,
) -> Result<Option<GoalTemplatePattern>, tokio_postgres::Error> {
  let result = con
    .query_opt(
      "SELECT * FROM goal_template_pattern WHERE goal_template_pattern_id=$1",
      &[&goal_template_pattern_id],
    )
    .await?
    .map(|x| x.into());

  Ok(result)
}

pub async fn query(
  con: &mut impl GenericClient,
  props: todo_app_service_api::request::GoalTemplatePatternViewProps,
) -> Result<Vec<GoalTemplatePattern>, tokio_postgres::Error> {
  let sql = [
    if props.only_recent {
      "SELECT gtp.* FROM recent_goal_template_pattern gtp"
    } else {
      "SELECT gtp.* FROM goal_template_pattern gtp"
    },
    " WHERE 1 = 1",
    " AND ($1::bigint[]  IS NULL OR gtp.goal_template_pattern_id = ANY($1))",
    " AND ($2::bigint    IS NULL OR gtp.creation_time >= $2)",
    " AND ($3::bigint    IS NULL OR gtp.creation_time <= $3)",
    " AND ($4::bigint[]  IS NULL OR gtp.creator_user_id = ANY($4))",
    " AND ($5::bigint[]  IS NULL OR gtp.goal_template_id = ANY($5))",
    " AND ($6::text[]    IS NULL OR gtp.pattern = ANY($6))",
    " AND ($7::bool      IS NULL OR gtp.active = $7)",
    " ORDER BY gtp.goal_template_pattern_id",
  ]
  .join("\n");

  let stmnt = con.prepare(&sql).await?;

  let results = con
    .query(
      &stmnt,
      &[
        &props.goal_template_pattern_id,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
        &props.goal_template_id,
        &props.pattern,
        &props.active,
      ],
    )
    .await?
    .into_iter()
    .map(|row| row.into())
    .collect();

  Ok(results)
}
