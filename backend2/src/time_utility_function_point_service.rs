use super::todo_app_db_types::*;
use rusqlite::{named_params, params, Connection, OptionalExtension, Savepoint};
use std::convert::{TryFrom, TryInto};

impl TryFrom<&rusqlite::Row<'_>> for TimeUtilityFunctionPoint {
  type Error = rusqlite::Error;

  // select * from time_utility_function_point order only, otherwise it will fail
  fn try_from(row: &rusqlite::Row) -> Result<TimeUtilityFunctionPoint, rusqlite::Error> {
    Ok(TimeUtilityFunctionPoint {
      time_utility_function_point_id: row.get(0)?,
      time_utility_function_id: row.get(1)?,
      start_time: row.get(2)?,
      utils: row.get(3)?,
    })
  }
}

pub fn add(
  con: &mut Savepoint,
  time_utility_function_id: i64,
  start_time: i64,
  utils: i64,
) -> Result<TimeUtilityFunctionPoint, rusqlite::Error> {
  let sp = con.savepoint()?;

  let sql = "INSERT INTO
  time_utility_function_point(
      time_utility_function_id,
      start_time,
      utils
  ) values (?, ?, ?)";

  sp.execute(
    sql,
    params![
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
  time_utility_function_id: i64,
) -> Result<Vec<TimeUtilityFunctionPoint>, rusqlite::Error> {
  let sql = [
    "SELECT tufp.* FROM time_utility_function_point tufp WHERE 1 = 1",
    " AND tufp.time_utility_function_id = :time_utility_function_id",
    " ORDER BY tufp.start_time",
  ]
  .join("");

  let mut stmnt = con.prepare(&sql)?;

  let results = stmnt
    .query(named_params! {
        "time_utility_function_id": time_utility_function_id,
    })?
    .and_then(|row| row.try_into())
    .filter_map(|x: Result<TimeUtilityFunctionPoint, rusqlite::Error>| x.ok());
  Ok(results.collect::<Vec<TimeUtilityFunctionPoint>>())
}
