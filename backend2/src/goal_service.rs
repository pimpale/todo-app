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

  let sql = "INSERT INTO goal(creation_time, creator_user_id, goal_intent_id) values (?, ?, ?)";
  sp.execute(
    sql,
    params![creation_time, creator_user_id, goal_intent_id,],
  )?;

  let goal_id = sp.last_insert_rowid();

  // return goal
  Ok(Goal {
    goal_id,
    creation_time,
    creator_user_id,
    goal_intent_id,
  })
}

pub fn get_by_goal_id(con: &mut impl GenericClient, goal_id: i64) -> Result<Option<Goal>, postgres::Error> {
  let sql = "SELECT * FROM goal WHERE goal_id=?";
  con
    .query_row(sql, params![goal_id], |row| row.try_into())
    .optional()
}

pub fn query(
  con: &mut impl GenericClient,
  props: request::GoalViewProps,
) -> Result<Vec<Goal>, postgres::Error> {
  let sql = [
    "SELECT g.* FROM goal g WHERE 1 = 1",
    " AND (:goal_id         == NULL OR g.goal_id = :goal_id)",
    " AND (:creation_time   == NULL OR g.creation_time = :creation_time)",
    " AND (:creation_time   == NULL OR g.creation_time >= :min_creation_time)",
    " AND (:creation_time   == NULL OR g.creation_time <= :max_creation_time)",
    " AND (:creator_user_id == NULL OR g.creator_user_id = :creator_user_id)",
    " AND (:goal_intent_id  == NULL OR g.goal_intent_id = :goal_intent_id)",
    " ORDER BY g.goal_id",
    " LIMIT :offset, :count",
  ]
  .join("");

  let mut stmnt = con.prepare(&sql)?;

  let results = stmnt
    .query(named_params! {
        "goal_id": props.goal_id,
        "creation_time": props.creation_time,
        "min_creation_time": props.min_creation_time,
        "max_creation_time": props.max_creation_time,
        "creator_user_id": props.creator_user_id,
        "goal_intent_id": props.goal_intent_id,
        "offset": props.offset,
        "count": props.count,
    })?
    .and_then(|row| row.try_into())
    .filter_map(|x: Result<Goal, postgres::Error>| x.ok());
  Ok(results.collect::<Vec<Goal>>())
}
