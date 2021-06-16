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

  let sql = "INSERT INTO goal_intent(creation_time, creator_user_id) values (?, ?)";
  sp.execute(sql, params![creation_time, creator_user_id,])?;

  let goal_intent_id = sp.last_insert_rowid();

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
  let sql = "SELECT * FROM goal_intent WHERE goal_intent_id=?";
  con
    .query_row(sql, params![goal_intent_id], |row| row.try_into())
    .optional()
}

pub fn query(
  con: &mut impl GenericClient,
  props: request::GoalIntentViewProps,
) -> Result<Vec<GoalIntent>, postgres::Error> {
  let sql = [
    "SELECT g.* FROM goal_intent g WHERE 1 = 1",
    " AND (:goal_intent_id         == NULL OR g.goal_intent_id = :goal_intent_id)",
    " AND (:creation_time   == NULL OR g.creation_time = :creation_time)",
    " AND (:creation_time   == NULL OR g.creation_time >= :min_creation_time)",
    " AND (:creation_time   == NULL OR g.creation_time <= :max_creation_time)",
    " AND (:creator_user_id == NULL OR g.creator_user_id = :creator_user_id)",
    " ORDER BY g.goal_intent_id",
    " LIMIT :offset, :count",
  ]
  .join("");

  let mut stmnt = con.prepare(&sql)?;

  let results = stmnt
    .query(named_params! {
        "goal_intent_id": props.goal_intent_id,
        "creation_time": props.creation_time,
        "min_creation_time": props.min_creation_time,
        "max_creation_time": props.max_creation_time,
        "creator_user_id": props.creator_user_id,
        "offset": props.offset,
        "count": props.count,
    })?
    .and_then(|row| row.try_into())
    .filter_map(|x: Result<GoalIntent, postgres::Error>| x.ok());
  Ok(results.collect::<Vec<GoalIntent>>())
}
