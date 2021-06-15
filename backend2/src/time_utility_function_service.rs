use super::todo_app_db_types::*;
use super::utils::current_time_millis;
use rusqlite::{named_params, params, Connection, OptionalExtension, Savepoint};
use std::convert::{TryFrom, TryInto};
use todo_app_service_api::request;

impl TryFrom<&rusqlite::Row<'_>> for TimeUtilityFunction {
  type Error = rusqlite::Error;

  // select * from time_utility_function order only, otherwise it will fail
  fn try_from(row: &rusqlite::Row) -> Result<TimeUtilityFunction, rusqlite::Error> {
    Ok(TimeUtilityFunction {
      time_utility_function_id: row.get(0)?,
      creation_time: row.get(1)?,
      creator_user_id: row.get(2)?,
    })
  }
}

pub fn add(
  con: &mut Savepoint,
  creator_user_id: i64,
) -> Result<TimeUtilityFunction, rusqlite::Error> {
  let sp = con.savepoint()?;

  let creation_time = current_time_millis();

  let sql = "INSERT INTO time_utility_function(creation_time, creator_user_id) values (?, ?)";
  sp.execute(sql, params![creation_time, creator_user_id,])?;

  let time_utility_function_id = sp.last_insert_rowid();

  // commit savepoint
  sp.commit()?;

  // return time_utility_function
  Ok(TimeUtilityFunction {
    time_utility_function_id,
    creation_time,
    creator_user_id,
  })
}

pub fn get_by_time_utility_function_id(
  con: &Connection,
  time_utility_function_id: i64,
) -> Result<Option<TimeUtilityFunction>, rusqlite::Error> {
  let sql = "SELECT * FROM time_utility_function WHERE time_utility_function_id=?";
  con
    .query_row(sql, params![time_utility_function_id], |row| row.try_into())
    .optional()
}

pub fn query(
  con: &Connection,
  props: request::TimeUtilityFunctionViewProps,
) -> Result<Vec<TimeUtilityFunction>, rusqlite::Error> {
  let sql = [
    "SELECT tuf.* FROM time_utility_function tuf WHERE 1 = 1",
    " AND (:time_utility_function_id  == NULL OR tuf.time_utility_function_id = :time_utility_function_id)",
    " AND (:creation_time             == NULL OR tuf.creation_time = :creation_time)",
    " AND (:creation_time             == NULL OR tuf.creation_time >= :min_creation_time)",
    " AND (:creation_time             == NULL OR tuf.creation_time <= :max_creation_time)",
    " AND (:creator_user_id           == NULL OR tuf.creator_user_id = :creator_user_id)",
    " ORDER BY tuf.time_utility_function_id",
    " LIMIT :offset, :count",
  ]
  .join("");

  let mut stmnt = con.prepare(&sql)?;

  let results = stmnt
    .query(named_params! {
        "time_utility_function_id": props.time_utility_function_id,
        "creation_time": props.creation_time,
        "min_creation_time": props.min_creation_time,
        "max_creation_time": props.max_creation_time,
        "creator_user_id": props.creator_user_id,
        "offset": props.offset,
        "count": props.count,
    })?
    .and_then(|row| row.try_into())
    .filter_map(|x: Result<TimeUtilityFunction, rusqlite::Error>| x.ok());
  Ok(results.collect::<Vec<TimeUtilityFunction>>())
}
