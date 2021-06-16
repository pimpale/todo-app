use super::todo_app_db_types::*;
use super::utils::current_time_millis;
use postgres::GenericClient;
use std::convert::{From, TryInto};

impl From<postgres::row::Row> for GoalIntentData {
  // select * from goal_intent_data order only, otherwise it will fail
  fn from(row: postgres::Row) -> GoalIntentData {
    GoalIntentData {
      goal_intent_data_id: row.get("goal_intent_data_id"),
      creation_time: row.get("creation_time"),
      creator_user_id: row.get("creator_user_id"),
      goal_intent_id: row.get("goal_intent_id"),
      name: row.get("name"),
      active: row.get("active"),
    }
  }
}

// TODO we need to figure out a way to make scheduled and unscheduled goals work better
pub fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
  goal_intent_id:i64,
  name: String,
  active: bool, 
) -> Result<GoalIntentData, postgres::Error> {
  let sp = con.savepoint()?;
  let creation_time = current_time_millis();

  let sql = "INSERT INTO
    goal_intent_data(
        creation_time,
        creator_user_id,
        goal_intent_id,
        name,
        active
    ) values (?, ?, ?, ?, ?)";

  sp.execute(
    sql,
    params![
      creation_time,
      creator_user_id,
      goal_intent_id,
      &name,
      active,
    ],
  )?;

  let goal_intent_data_id = sp.last_insert_rowid();

  // commit savepoint
  sp.commit()?;

  // return goal_intent_data
  Ok(GoalIntentData {
    goal_intent_data_id,
    creation_time,
    creator_user_id,
    goal_intent_id,
    name,
    active,
  })
}

pub fn get_by_goal_intent_data_id(
  con: &mut impl GenericClient,
  goal_intent_id: &str,
) -> Result<Option<GoalIntentData>, postgres::Error> {
  let sql = "SELECT * FROM goal_intent_data WHERE goal_intent_data_id=? ORDER BY goal_intent_data_id DESC LIMIT 1";
  con
    .query_row(sql, params![goal_intent_id], |row| row.try_into())
    .optional()
}

// TODO need to fix

pub fn query(
  con: &mut impl GenericClient,
  props: todo_app_service_api::request::GoalIntentDataViewProps,
) -> Result<Vec<GoalIntentData>, postgres::Error> {
  // TODO prevent getting meaningless duration

  let sql = [
    "SELECT gdi.* FROM goal_intent_data gdi",
    if props.only_recent {
      " INNER JOIN
          (SELECT max(goal_intent_data_id) id FROM goal_intent_data GROUP BY goal_intent_id) maxids
          ON maxids.id = gdi.goal_intent_data_id"
    } else {
      ""
    },
    " WHERE 1 = 1",
    " AND (:goal_intent_data_id   == NULL OR gdi.goal_intent_data_id = :goal_intent_data_id)",
    " AND (:creation_time         == NULL OR gdi.creation_time = :creation_time)",
    " AND (:creation_time         == NULL OR gdi.creation_time >= :min_creation_time)",
    " AND (:creation_time         == NULL OR gdi.creation_time <= :max_creation_time)",
    " AND (:creator_user_id       == NULL OR gdi.creator_user_id = :creator_user_id)",
    " AND (:goal_intent_id        == NULL OR gdi.goal_intent_id = :goal_intent_id)",
    " AND (:name                  == NULL OR gdi.name = :name)",
    " AND (:partial_name          == NULL OR gdi.partial_name LIKE CONCAT('%',:partial_name,'%'))",
    " AND (:active                == NULL OR gdi.active = :active)",
    " ORDER BY gdi.goal_intent_data_id",
    " LIMIT :offset, :count",
  ]
  .join("");

  let mut stmnt = con.prepare(&sql)?;

  let results = stmnt
    .query(named_params! {
        "goal_intent_data_id": props.goal_intent_data_id,
        "creation_time": props.creation_time,
        "min_creation_time": props.min_creation_time,
        "max_creation_time": props.max_creation_time,
        "creator_user_id": props.creator_user_id,
        "goal_intent_id": props.goal_intent_id,
        "name": props.name,
        "partial_name": props.partial_name,
        "active": props.active,
        "offset": props.offset,
        "count": props.offset,
    })?
    .and_then(|row| row.try_into())
    .filter_map(|x: Result<GoalIntentData, postgres::Error>| x.ok());
  Ok(results.collect::<Vec<GoalIntentData>>())
}
