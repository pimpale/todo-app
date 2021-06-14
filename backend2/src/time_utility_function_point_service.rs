use super::todo_app_db_types::*;
use super::utils::current_time_millis;
use rusqlite::{named_params, params, Connection, OptionalExtension, Savepoint};
use std::convert::{TryFrom, TryInto};
use todo_app_service_api::request;

impl TryFrom<&rusqlite::Row<'_>> for TimeUtilityFunctionPoint {
  type Error = rusqlite::Error;

  // select * from time_utility_function_point order only, otherwise it will fail
  fn try_from(row: &rusqlite::Row) -> Result<TimeUtilityFunctionPoint, rusqlite::Error> {
    Ok(TimeUtilityFunctionPoint {
      time_utility_function_point_id: row.get(0)?,
      creation_time: row.get(1)?,
      creator_user_id: row.get(2)?,
      time_utility_function_id: row.get(3)?,
      start_time: row.get(4)?,
      utils: row.get(5)?,
    })
  }
}

pub fn add(
  con: &mut Savepoint,
  creator_user_id: i64,
  time_utility_function_id: i64,
  start_time: i64,
  utils: i64,
) -> Result<TimeUtilityFunctionPoint, rusqlite::Error> {
  let sp = con.savepoint()?;

  let creation_time = current_time_millis();

  let sql = "INSERT INTO
  time_utility_function_point(
      creation_time,
      creator_user_id,
      time_utility_function_id,
      start_time,
      utils
  ) values (?, ?, ?, ?, ?)";

  sp.execute(
    sql,
    params![
      creation_time,
      creator_user_id,
      time_utility_function_id,
      start_time,
      utils,
    ],
  )?;

  let time_utility_function_point_id = sp.last_insert_rowid();

  // commit savepoint
  sp.commit()?;

  // return time_utility_function_point
  Ok(TimeUtilityFunctionPoint {
    time_utility_function_point_id,
    creation_time,
    creator_user_id,
    time_utility_function_id,
    start_time,
    utils,
  })
}

pub fn get_by_time_utility_function_point_id(
  con: &Connection,
  time_utility_function_point_id: i64,
) -> Result<Option<TimeUtilityFunctionPoint>, rusqlite::Error> {
  let sql = "SELECT * FROM time_utility_function_point WHERE time_utility_function_point_id=?";
  con
    .query_row(sql, params![time_utility_function_point_id], |row| {
      row.try_into()
    })
    .optional()
}

pub fn query(
  con: &Connection,
  props: request::TimeUtilityFunctionPointViewProps,
) -> Result<Vec<TimeUtilityFunctionPoint>, rusqlite::Error> {
  let sql = [
    "SELECT tufp.* FROM time_utility_function_point tufp WHERE 1 = 1",
    " AND (:time_utility_function_point_id == NULL OR tufp.time_utility_function_point_id = :time_utility_function_point_id)",
    " AND (:creation_time                  == NULL OR tufp.creation_time = :creation_time)",
    " AND (:creation_time                  == NULL OR tufp.creation_time >= :min_creation_time)",
    " AND (:creation_time                  == NULL OR tufp.creation_time <= :max_creation_time)",
    " AND (:creator_user_id                == NULL OR tufp.creator_user_id = :creator_user_id)",
    " AND (:time_utility_function_id       == NULL OR tufp.time_utility_function_id = :time_utility_function_id)",
    " AND (:start_time                     == NULL OR tufp.start_time = :start_time)",
    " AND (:start_time                     == NULL OR tufp.start_time >= :min_start_time)",
    " AND (:start_time                     == NULL OR tufp.start_time <= :max_start_time)",
    " AND (:utils                          == NULL OR tufp.utils = :utils)",
    " AND (:utils                          == NULL OR tufp.utils >= :min_utils)",
    " AND (:utils                          == NULL OR tufp.utils <= :max_utils)",
    " ORDER BY tufp.time_utility_function_point_id",
    " LIMIT :offset, :count",
  ]
  .join("");

  let mut stmnt = con.prepare(&sql)?;

  let results = stmnt
    .query(named_params! {
        "time_utility_function_point_id": props.time_utility_function_point_id,
        "creation_time": props.creation_time,
        "min_creation_time": props.min_creation_time,
        "max_creation_time": props.max_creation_time,
        "creator_user_id": props.creator_user_id,
        "time_utility_function_id": props.time_utility_function_id,
        "start_time": props.start_time,
        "min_start_time": props.min_start_time,
        "max_start_time": props.max_start_time,
        "utils": props.utils,
        "min_utils": props.min_utils,
        "max_utils": props.max_utils,
        "offset": props.offset,
        "count": props.offset,
    })?
    .and_then(|row| row.try_into())
    .filter_map(|x: Result<TimeUtilityFunctionPoint, rusqlite::Error>| x.ok());
  Ok(results.collect::<Vec<TimeUtilityFunctionPoint>>())
}
