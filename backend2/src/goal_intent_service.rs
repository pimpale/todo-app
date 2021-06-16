use super::todo_app_db_types::*;
use super::utils::current_time_millis;
use postgres::GenericClient;
use todo_app_service_api::request;

impl From<postgres::row::Row> for GoalIntent {
  // select * from goal_intent order only, otherwise it will fail
  fn from(row: postgres::row::Row) -> GoalIntent {
    GoalIntent {
      goal_intent_id: row.get("goal_intent_id"),
      creation_time: row.get("creation_time"),
      creator_user_id: row.get("creator_user_id"),
    }
  }
}

pub fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
) -> Result<GoalIntent, postgres::Error> {
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
    )?
    .get(0);

  // return goal_intent
  Ok(GoalIntent {
    goal_intent_id,
    creation_time,
    creator_user_id,
  })
}

pub fn get_by_goal_intent_id(
  con: &mut impl GenericClient,
  goal_intent_id: i64,
) -> Result<Option<GoalIntent>, postgres::Error> {
  let result = con
    .query_opt(
      "SELECT * FROM goal_intent WHERE goal_intent_id=$1",
      &[&goal_intent_id],
    )?
    .map(|x| x.into());

  Ok(result)
}

pub fn query(
  con: &mut impl GenericClient,
  props: request::GoalIntentViewProps,
) -> Result<Vec<GoalIntent>, postgres::Error> {
  let results = con
    .query(
      " SELECT g.* FROM goal_intent g WHERE 1 = 1,
        AND ($1 == NULL OR g.goal_intent_id = $1),
        AND ($2 == NULL OR g.creation_time = $2),
        AND ($3 == NULL OR g.creation_time >= $3),
        AND ($4 == NULL OR g.creation_time <= $4),
        AND ($5 == NULL OR g.creator_user_id = $5),
        ORDER BY g.goal_intent_id,
        LIMIT $6, $7,
      ",
      &[
        &props.goal_intent_id,
        &props.creation_time,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
        &props.offset,
        &props.count,
      ],
    )?
    .into_iter()
    .map(|row| row.into())
    .collect();

  Ok(results)
}
