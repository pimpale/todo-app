
use super::db_types::*;
use super::utils::current_time_millis;
use tokio_postgres::GenericClient;
use todo_app_service_api::request;

impl From<tokio_postgres::row::Row> for GoalTemplate {
  // select * from goal_template order only, otherwise it will fail
  fn from(row: tokio_postgres::row::Row) -> GoalTemplate {
    GoalTemplate {
      goal_template_id: row.get("goal_template_id"),
      creation_time: row.get("creation_time"),
      creator_user_id: row.get("creator_user_id"),
    }
  }
}

pub async fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
) -> Result<GoalTemplate, tokio_postgres::Error> {
  let creation_time = current_time_millis();

  let goal_template_id = con
    .query_one(
      "INSERT INTO
       goal_template(
           creation_time,
           creator_user_id
       )
       VALUES($1, $2)
       RETURNING goal_template_id
      ",
      &[&creation_time, &creator_user_id],
    ).await?
    .get(0);

  // return goal_template
  Ok(GoalTemplate {
    goal_template_id,
    creation_time,
    creator_user_id,
  })
}

pub async fn get_by_goal_template_id(
  con: &mut impl GenericClient,
  goal_template_id: i64,
) -> Result<Option<GoalTemplate>, tokio_postgres::Error> {
  let result = con
    .query_opt(
      "SELECT * FROM goal_template WHERE goal_template_id=$1",
      &[&goal_template_id],
    ).await?
    .map(|x| x.into());

  Ok(result)
}

pub async fn query(
  con: &mut impl GenericClient,
  props: request::GoalTemplateViewProps,
) -> Result<Vec<GoalTemplate>, tokio_postgres::Error> {
  let results = con
    .query(
      "
        SELECT gt.* FROM goal_template gt WHERE 1 = 1
        AND ($1::bigint[] IS NULL OR gt.goal_template_id = ANY($1))
        AND ($2::bigint   IS NULL OR gt.creation_time >= $2)
        AND ($3::bigint   IS NULL OR gt.creation_time <= $3)
        AND ($4::bigint[] IS NULL OR gt.creator_user_id = ANY($4))
        ORDER BY gt.goal_template_id
      ",
      &[
        &props.goal_template_id,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
      ],
    ).await?
    .into_iter()
    .map(|row| row.into())
    .collect();

  Ok(results)
}
