use super::db_types::*;
use super::utils::current_time_millis;
use std::convert::From;
use tokio_postgres::GenericClient;

impl From<tokio_postgres::row::Row> for GoalTemplateData {
  // select * from goal_template_data order only, otherwise it will fail
  fn from(row: tokio_postgres::Row) -> GoalTemplateData {
    GoalTemplateData {
      goal_template_data_id: row.get("goal_template_data_id"),
      creation_time: row.get("creation_time"),
      creator_user_id: row.get("creator_user_id"),
      goal_template_id: row.get("goal_template_id"),
      name: row.get("name"),
      user_generated_code_id: row.get("user_generated_code_id"),
      active: row.get("active"),
    }
  }
}

// TODO we need to figure out a way to make scheduled and unscheduled goals work better
pub async fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
  goal_template_id: i64,
  name: String,
  user_generated_code_id: i64,
  active: bool,
) -> Result<GoalTemplateData, tokio_postgres::Error> {
  let creation_time = current_time_millis();

  let goal_template_data_id = con
    .query_one(
      "INSERT INTO
       goal_template_data(
           creation_time,
           creator_user_id,
           goal_template_id,
           name,
           user_generated_code_id,
           active
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING goal_template_data_id
      ",
      &[
        &creation_time,
        &creator_user_id,
        &goal_template_id,
        &name,
        &user_generated_code_id,
        &active,
      ],
    )
    .await?
    .get(0);

  Ok(GoalTemplateData {
    goal_template_data_id,
    creation_time,
    creator_user_id,
    goal_template_id,
    name,
    user_generated_code_id,
    active,
  })
}

pub async fn get_by_goal_template_data_id(
  con: &mut impl GenericClient,
  goal_template_data_id: &i64,
) -> Result<Option<GoalTemplateData>, tokio_postgres::Error> {
  let result = con
    .query_opt(
      "SELECT * FROM goal_template_data WHERE goal_template_data_id=$1",
      &[&goal_template_data_id],
    )
    .await?
    .map(|x| x.into());

  Ok(result)
}

pub async fn query(
  con: &mut impl GenericClient,
  props: todo_app_service_api::request::GoalTemplateDataViewProps,
) -> Result<Vec<GoalTemplateData>, tokio_postgres::Error> {
  let sql = [
    "SELECT gtd.* FROM goal_template_data gtd",
    if props.only_recent {
      " INNER JOIN
          (SELECT max(goal_template_data_id) id FROM goal_template_data GROUP BY goal_template_id) maxids
          ON maxids.id = gtd.goal_template_data_id"
    } else {
      ""
    },
    " WHERE 1 = 1",
    " AND ($1::bigint[]  IS NULL OR gtd.goal_template_data_id = ANY($1))",
    " AND ($2::bigint    IS NULL OR gtd.creation_time >= $2)",
    " AND ($3::bigint    IS NULL OR gtd.creation_time <= $3)",
    " AND ($4::bigint[]  IS NULL OR gtd.creator_user_id = ANY($4))",
    " AND ($5::bigint[]  IS NULL OR gtd.goal_template_id = ANY($5))",
    " AND ($6::text[]    IS NULL OR gtd.name = ANY($6))",
    " AND ($7::bigint[]  IS NULL OR gtd.user_generated_code_id = ANY($7))",
    " AND ($8::bool      IS NULL OR gtd.active = $8)",
    " ORDER BY gtd.goal_template_data_id",
  ]
  .join("\n");

  let stmnt = con.prepare(&sql).await?;

  let results = con
    .query(
      &stmnt,
      &[
        &props.goal_template_data_id,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
        &props.goal_template_id,
        &props.name,
        &props.user_generated_code_id,
        &props.active,
      ],
    )
    .await?
    .into_iter()
    .map(|row| row.into())
    .collect();

  Ok(results)
}
