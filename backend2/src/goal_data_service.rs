use super::todo_app_db_types::*;
use super::utils::current_time_millis;
use rusqlite::{named_params, params, Connection, OptionalExtension, Savepoint};
use std::convert::{TryFrom, TryInto};
use todo_app_service_api::request;

impl TryFrom<&rusqlite::Row<'_>> for GoalData {
  type Error = rusqlite::Error;

  // select * from goal_data order only, otherwise it will fail
  fn try_from(row: &rusqlite::Row) -> Result<GoalData, rusqlite::Error> {
    Ok(GoalData {
      goal_data_id: row.get(0)?,
      creation_time: row.get(1)?,
      creator_user_id: row.get(2)?,
      goal_id: row.get(3)?,
      name: row.get(4)?,
      duration_estimate: row.get(5)?,
      time_utility_function_id: row.get(6)?,
      parent_goal_id: row.get(7)?,
      status: row
        .get::<_, u8>(8)?
        .try_into()
        // means that there's a mismatch between the values of the enum and the value stored in the column
        .map_err(|x| rusqlite::Error::IntegralValueOutOfRange(4, x as i64))?,
    })
  }
}

// TODO we need to figure out a way to make scheduled and unscheduled goals work better
pub fn add(
  con: &mut Savepoint,
  creator_user_id: i64,
  goal_id: i64,
  name: String,
  duration_estimate: i64,
  time_utility_function_id: i64,
  parent_goal_id: Option<i64>,
  status: request::GoalDataStatusKind,
) -> Result<GoalData, rusqlite::Error> {
  let sp = con.savepoint()?;
  let creation_time = current_time_millis();

  let sql = "INSERT INTO
    goal_data(
        creation_time,
        creator_user_id,
        goal_id,
        name,
        duration_estimate,
        time_utility_function_id,
        parent_goal_id,
        status
    ) values (?, ?, ?, ?, ?, ?, ?, ?)";

  sp.execute(
    sql,
    params![
      creation_time,
      creator_user_id,
      goal_id,
      name,
      duration_estimate,
      time_utility_function_id,
      parent_goal_id,
      status.clone() as u8
    ],
  )?;

  let goal_data_id = sp.last_insert_rowid();

  // commit savepoint
  sp.commit()?;

  // return goal_data
  Ok(GoalData {
    goal_data_id,
    creation_time,
    creator_user_id,
    goal_id,
    name,
    duration_estimate,
    time_utility_function_id,
    parent_goal_id,
    status,
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
    "SELECT gd.* FROM goal_data gd",
    " JOIN goal g ON gd.goal_id = g.goal_id",
    if props.only_recent {
        " INNER JOIN (SELECT max(goal_data_id) id FROM goal_data GROUP BY goal_id) maxids
        ON maxids.id = gd.goal_data_id"
    } else {
        ""
    },
    " WHERE 1 = 1",
    " AND (:goal_data_id             == NULL OR gd.goal_data_id = :goal_data_id)",
    " AND (:creation_time            == NULL OR gd.creation_time = :creation_time)",
    " AND (:creation_time            == NULL OR gd.creation_time >= :min_creation_time)",
    " AND (:creation_time            == NULL OR gd.creation_time <= :max_creation_time)",
    " AND (:creator_user_id          == NULL OR gd.creator_user_id = :creator_user_id)",
    " AND (:goal_id                  == NULL OR gd.goal_id = :goal_id)",
    " AND (:name                     == NULL OR gd.name = :name)",
    " AND (:partial_name             == NULL OR gd.partial_name LIKE CONCAT('%',:partial_name,'%'))",
    " AND (:duration_estimate        == NULL OR gd.duration_estimate = :duration_estimate)",
    " AND (:duration_estimate        == NULL OR gd.duration_estimate >= :min_duration_estimate)",
    " AND (:duration_estimate        == NULL OR gd.duration_estimate <= :max_duration_estimate)",
    " AND (:time_utility_function_id == NULL OR gd.time_utility_function_id = :time_utility_function_id)",
    " AND (:parent_goal_id           == NULL OR gd.parent_goal_id = :parent_goal_id)",
    " AND (:status                   == NULL OR gd.status = :status)",
    " AND (:goal_intent_id           == NULL OR g.goal_intent_id = :goal_intent_id)",
    " ORDER BY gd.goal_data_id",
    " LIMIT :offset, :count",
  ]
  .join("");

  let mut stmnt = con.prepare(&sql)?;

  let results = stmnt
    .query(named_params! {
        "goal_data_id": props.goal_data_id,
        "creation_time": props.creation_time,
        "min_creation_time": props.min_creation_time,
        "max_creation_time": props.max_creation_time,
        "creator_user_id": props.creator_user_id,
        "goal_id": props.goal_id,
        "name": props.name,
        "partial_name": props.partial_name,
        "duration_estimate": props.duration_estimate,
        "min_duration_estimate": props.min_duration_estimate,
        "max_duration_estimate": props.max_duration_estimate,
        "time_utility_function_id": props.time_utility_function_id,
        "parent_goal_id": props.parent_goal_id,
        "status": props.status.map(|x| x as u8),
        "goal_intent_id": props.goal_intent_id,
        "offset": props.offset,
        "count": props.count,
    })?
    .and_then(|row| row.try_into())
    .filter_map(|x: Result<GoalData, rusqlite::Error>| x.ok());
  Ok(results.collect::<Vec<GoalData>>())
}
