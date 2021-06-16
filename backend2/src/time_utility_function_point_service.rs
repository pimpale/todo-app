use super::todo_app_db_types::*;
use postgres::GenericClient;

impl From<postgres::row::Row> for TimeUtilityFunctionPoint {
  // select * from time_utility_function_point order only, otherwise it will fail
  fn from(row: postgres::row::Row) -> TimeUtilityFunctionPoint {
    TimeUtilityFunctionPoint {
      time_utility_function_point_id: row.get("time_utility_function_point_id"),
      time_utility_function_id: row.get("time_utility_function_id"),
      start_time: row.get("start_time"),
      utils: row.get("utils"),
    }
  }
}

pub fn add(
  con: &mut impl GenericClient,
  time_utility_function_id: i64,
  start_time: i64,
  utils: i64,
) -> Result<TimeUtilityFunctionPoint, postgres::Error> {

  let sql = "INSERT INTO
  time_utility_function_point(
      time_utility_function_id,
      start_time,
      utils
  ) values (?, ?, ?)";

  sp.execute(
    sql,
    &[
      time_utility_function_id,
      start_time,
      utils,
    ],
  )?;

  let time_utility_function_point_id = sp.last_insert_rowid();

  // return time_utility_function_point
  Ok(TimeUtilityFunctionPoint {
    time_utility_function_point_id,
    time_utility_function_id,
    start_time,
    utils,
  })
}

pub fn get_by_time_utility_function_point_id(
  con: &mut impl GenericClient,
  time_utility_function_point_id: i64,
) -> Result<Option<TimeUtilityFunctionPoint>, postgres::Error> {
  let sql = "SELECT * FROM time_utility_function_point WHERE time_utility_function_point_id=?";
  con
    .query_one(sql, &[time_utility_function_point_id], |row| {
      row.try_into()
    })
    .optional()
}

pub fn query(
  con: &mut impl GenericClient,
  time_utility_function_id: i64,
) -> Result<Vec<TimeUtilityFunctionPoint>, postgres::Error> {
  let sql = [
    "SELECT tufp.* FROM time_utility_function_point tufp WHERE 1 = 1",
    " AND tufp.time_utility_function_id = :time_utility_function_id",
    " ORDER BY tufp.start_time",
  ]
  .join("");

  let mut stmnt = con.prepare(&sql)?;

  let results = stmnt
    .query(named_& {
        "time_utility_function_id": time_utility_function_id,
    })?
    .and_then(|row| row.try_into())
    .filter_map(|x: Result<TimeUtilityFunctionPoint, postgres::Error>| x.ok());
  Ok(results.collect::<Vec<TimeUtilityFunctionPoint>>())
}
