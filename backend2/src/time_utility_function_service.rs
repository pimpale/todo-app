use super::todo_app_db_types::*;
use super::utils::current_time_millis;
use postgres::GenericClient;
use todo_app_service_api::request;

impl From<postgres::row::Row> for TimeUtilityFunction {
  // select * from time_utility_function order only, otherwise it will fail
  fn from(row: postgres::Row) -> TimeUtilityFunction {
    TimeUtilityFunction {
      time_utility_function_id: row.get("creator_user_id"),
      creation_time: row.get("creator_user_id"),
      creator_user_id: row.get("creator_user_id"),
    }
  }
}

pub fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
) -> Result<TimeUtilityFunction, postgres::Error> {
  let creation_time = current_time_millis();

  let time_utility_function_id = con
    .query_one(
      "INSERT INTO
       time_utility_function(
           creation_time,
           creator_user_id
       )
       VALUES($1, $2)
      ",
      &[&creation_time, &creator_user_id],
    )?
    .get(0);

  // return time_utility_function
  Ok(TimeUtilityFunction {
    time_utility_function_id,
    creation_time,
    creator_user_id,
  })
}

pub fn get_by_time_utility_function_id(
  con: &mut impl GenericClient,
  time_utility_function_id: i64,
) -> Result<Option<TimeUtilityFunction>, postgres::Error> {
  let sql = "SELECT * FROM time_utility_function WHERE time_utility_function_id=$1";
  let result = con
    .query_opt(sql, &[&time_utility_function_id])?
    .map(|x| x.into());
  Ok(result)
}

pub fn query(
  con: &mut impl GenericClient,
  props: request::TimeUtilityFunctionViewProps,
) -> Result<Vec<TimeUtilityFunction>, postgres::Error> {
  let sql = [
    "SELECT tuf.* FROM time_utility_function tuf WHERE 1 = 1",
    " AND ($1 == NULL OR tuf.time_utility_function_id = $1)",
    " AND ($2 == NULL OR tuf.creation_time = $2)",
    " AND ($3 == NULL OR tuf.creation_time >= $3)",
    " AND ($4 == NULL OR tuf.creation_time <= $4)",
    " AND ($5 == NULL OR tuf.creator_user_id = $5)",
    " ORDER BY tuf.time_utility_function_id",
    " LIMIT $6, $7",
  ]
  .join("");

  let mut stmnt = con.prepare(&sql)?;

  let results = con
    .query(
      &stmnt,
      &[
        &props.time_utility_function_id,
        &props.creation_time,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
        &props.offset,
        &props.count,
      ],
    )?
    .into_iter()
    .map(|x| x.into())
    .collect();

  Ok(results)
}
