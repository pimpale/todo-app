use super::db_types::*;
use super::utils::current_time_millis;
use todo_app_service_api::request;
use tokio_postgres::GenericClient;

impl From<tokio_postgres::row::Row> for TimeUtilityFunction {
  // select * from time_utility_function order only, otherwise it will fail
  fn from(row: tokio_postgres::Row) -> TimeUtilityFunction {
    TimeUtilityFunction {
      time_utility_function_id: row.get("creator_user_id"),
      creation_time: row.get("creator_user_id"),
      creator_user_id: row.get("creator_user_id"),
      start_times: row.get("start_times"),
      utils: row.get("utils"),
    }
  }
}

pub async fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
  start_times: Vec<i64>,
  utils: Vec<i64>,
) -> Result<TimeUtilityFunction, tokio_postgres::Error> {
  assert_eq!(start_times.len(), utils.len());

  let creation_time = current_time_millis();

  let time_utility_function_id = con
    .query_one(
      "INSERT INTO
       time_utility_function(
           creation_time,
           creator_user_id,
           start_times,
           utils
       )
       VALUES($1, $2, $3, $4)
       RETURNING time_utility_function_id
      ",
      &[&creation_time, &creator_user_id, &start_times, &utils],
    )
    .await?
    .get(0);

  // return time_utility_function
  Ok(TimeUtilityFunction {
    time_utility_function_id,
    creation_time,
    creator_user_id,
    start_times,
    utils,
  })
}

pub async fn get_by_time_utility_function_id(
  con: &mut impl GenericClient,
  time_utility_function_id: i64,
) -> Result<Option<TimeUtilityFunction>, tokio_postgres::Error> {
  let sql = "SELECT * FROM time_utility_function WHERE time_utility_function_id=$1";
  let result = con
    .query_opt(sql, &[&time_utility_function_id])
    .await?
    .map(|x| x.into());
  Ok(result)
}

pub async fn query(
  con: &mut impl GenericClient,
  props: request::TimeUtilityFunctionViewProps,
) -> Result<Vec<TimeUtilityFunction>, tokio_postgres::Error> {
  let sql = "SELECT tuf.* FROM time_utility_function tuf WHERE 1 = 1
     AND ($1::bigint[] IS NULL OR tuf.time_utility_function_id = ANY($1))
     AND ($2::bigint   IS NULL OR tuf.creation_time >= $2)
     AND ($3::bigint   IS NULL OR tuf.creation_time <= $3)
     AND ($4::bigint[] IS NULL OR tuf.creator_user_id = ANY($4))
     ORDER BY tuf.time_utility_function_id
     ";

  let stmnt = con.prepare(sql).await?;

  let results = con
    .query(
      &stmnt,
      &[
        &props.time_utility_function_id,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
      ],
    )
    .await?
    .into_iter()
    .map(|x| x.into())
    .collect();

  Ok(results)
}
