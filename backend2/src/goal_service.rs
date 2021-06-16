use super::todo_app_db_types::*;
use super::utils::current_time_millis;
use postgres::GenericClient;
use todo_app_service_api::request;

impl From<postgres::row::Row> for Goal {
  // select * from goal order only, otherwise it will fail
  fn from(row: postgres::Row) -> Goal {
    Goal {
      goal_id: row.get("goal_id"),
      creation_time: row.get("creation_time"),
      creator_user_id: row.get("creator_user_id"),
      goal_intent_id: row.get("goal_intent_id"),
    }
  }
}

pub fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
  goal_intent_id: Option<i64>,
) -> Result<Goal, postgres::Error> {
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
     ",
      &[&creation_time, &creator_user_id, &goal_intent_id],
    )?
    .get(0);

  // return goal
  Ok(Goal {
    goal_id,
    creation_time,
    creator_user_id,
    goal_intent_id,
  })
}

pub fn get_by_goal_id(
  con: &mut impl GenericClient,
  goal_id: &str,
) -> Result<Option<GoalIntentData>, postgres::Error> {
  let result = con
    .query_opt("SELECT * FROM goal WHERE goal_id=$1", &[&goal_id])?
    .map(|x| x.into());

  Ok(result)
}

pub fn query(
  con: &mut impl GenericClient,
  props: request::GoalViewProps,
) -> Result<Vec<Goal>, postgres::Error> {
  let sql = "SELECT g.* FROM goal g WHERE 1 = 1
     AND ($1 == NULL OR g.goal_id = $1)
     AND ($2 == NULL OR g.creation_time = $2)
     AND ($3 == NULL OR g.creation_time >= $3)
     AND ($4 == NULL OR g.creation_time <= $4)
     AND ($5 == NULL OR g.creator_user_id = $5)
     AND ($6 == NULL OR g.goal_intent_id = $6)
     ORDER BY g.goal_id
     LIMIT $7, $8";

  let mut stmnt = con.prepare(&sql)?;

  let results = con
    .query(
      &stmnt,
      &[
        &props.goal_id,
        &props.creation_time,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
        &props.goal_intent_id,
        &props.offset,
        &props.count,
      ],
    )?
    .into_iter()
    .map(|x| x.into())
    .collect();
  Ok(results)
}
