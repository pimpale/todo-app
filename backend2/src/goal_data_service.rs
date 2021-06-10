use super::todo_app_db_types::*;
use super::utils::current_time_millis;
use rusqlite::{named_params, params, Connection, OptionalExtension, Savepoint};
use std::convert::{TryFrom, TryInto};

// returns the max goal_data id and adds 1 to it
fn next_id(con: &Connection) -> Result<i64, rusqlite::Error> {
  let sql = "SELECT IFNULL(MAX(goal_data_id), -1) FROM goal_data";
  con.query_row(sql, [], |row| row.get(0)).map(|v: i64| v + 1)
}

// TODO need to fix

impl TryFrom<&rusqlite::Row<'_>> for GoalData {
  type Error = rusqlite::Error;

  // select * from goal_data order only, otherwise it will fail
  fn try_from(row: &rusqlite::Row) -> Result<GoalData, rusqlite::Error> {
    Ok(GoalData {
      goal_data_id: row.get(0)?,
      creation_time: row.get(1)?,
      creator_user_id: row.get(2)?,
      goal_id: row.get(3)?,
      // means that there's a mismatch between the values of the enum and the value stored in the column
      goal_data_kind: row
        .get::<_, u8>(4)?
        .try_into()
        .map_err(|x| rusqlite::Error::IntegralValueOutOfRange(4, x as i64))?,
      duration: row.get(5)?,
    })
  }
}

// TODO we need to figure out a way to make scheduled and unscheduled goals work better
pub fn add(
  con: &mut Savepoint,
  creator_user_id: i64,
  scheduled: bool,
  start_time: i64,
  duration: i64,
  goal_data: todo_app_service_api::request::GoalDataNewProps,
) -> Result<GoalData, rusqlite::Error> {
  let sp = con.savepoint()?;
  let goal_data_id = next_id(&sp)?;
  let creation_time = current_time_millis();

  let sql = "INSERT INTO goal_data values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  sp.execute(
    sql,
    params![
      goal_data_id,
      creation_time,
      creator_user_id,
      goal_data.goal_id,
      goal_data.name,
      goal_data.description,
      goal_data.duration_estimate,
      goal_data.time_utility_function_id,
      scheduled,
      start_time,
      duration,
      goal_data.status.clone() as u8
    ],
  )?;

  // commit savepoint
  sp.commit()?;

  // return goal_data
  Ok(GoalData {
    goal_data_id,
    creation_time,
    creator_user_id,
    goal_id: goal_data.goal_id,
    name: goal_data.name,
    description: goal_data.description,
    duration_estimate: goal_data.duration_estimate,
    time_utility_function_id: goal_data.time_utility_function_id,
    scheduled,
    start_time,
    duration,
    status: goal_data.status,
  })
}

pub fn get_by_goal_data_id(
  con: &Connection,
  goal_id: &str,
) -> Result<Option<GoalData>, rusqlite::Error> {
  let sql = "SELECT * FROM goal_data WHERE goal_data_id=? ORDER BY goal_data_id DESC LIMIT 1";
  con
    .query_row(sql, params![goal_id], |row| row.try_into())
    .optional()
}

// TODO need to fix

pub fn query(
  con: &Connection,
  props: todo_app_service_api::request::GoalDataViewProps,
) -> Result<Vec<GoalData>, rusqlite::Error> {
  // TODO prevent getting meaningless duration

  let sql = [
    "SELECT a.* FROM goal_data a",
    if props.only_recent {
        " INNER JOIN (SELECT max(goal_data_id) id FROM goal_data GROUP BY goal_id) maxids ON maxids.id = a.goal_data_id"
    } else {
        ""
    },
    " WHERE 1 = 1",
    " AND (:goal_data_id      == NULL OR a.goal_data_id = :goal_data_id)",
    " AND (:creation_time   == NULL OR a.creation_time = :creation_time)",
    " AND (:creation_time   == NULL OR a.creation_time >= :min_creation_time)",
    " AND (:creation_time   == NULL OR a.creation_time <= :max_creation_time)",
    " AND (:creator_user_id == NULL OR a.creator_user_id = :creator_user_id)",
    " AND (:duration        == NULL OR a.duration = :duration)",
    " AND (:duration        == NULL OR a.duration >= :min_duration)",
    " AND (:duration        == NULL OR a.duration <= :max_duration)",
    " AND (:goal_data_kind    == NULL OR a.goal_data_kind = :goal_data_kind)",
    " ORDER BY a.goal_data_id",
    " LIMIT :offset, :count",
  ]
  .join("");

  let mut stmnt = con.prepare(&sql)?;

  let results = stmnt
    .query(named_params! {
        "goal_data_id": props.goal_data_id,
        "creator_user_id": props.creator_user_id,
        "creation_time": props.creation_time,
        "min_creation_time": props.min_creation_time,
        "max_creation_time": props.max_creation_time,
        "duration": props.duration,
        "min_duration": props.min_duration,
        "max_duration": props.max_duration,
        "goal_data_kind": props.goal_data_kind.map(|x| x as u8),
        "offset": props.offset,
        "count": props.offset,
    })?
    .and_then(|row| row.try_into())
    .filter_map(|x: Result<GoalData, rusqlite::Error>| x.ok());
  Ok(results.collect::<Vec<GoalData>>())
}
