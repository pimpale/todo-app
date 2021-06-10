use super::todo_app_db_types::*;
use super::utils::current_time_millis;
use rusqlite::{named_params, params, Connection, OptionalExtension, Savepoint};
use std::convert::{TryFrom, TryInto};
use todo_app_service_api::request;

impl TryFrom<&rusqlite::Row<'_>> for Goal {
  type Error = rusqlite::Error;

  // select * from goal order only, otherwise it will fail
  fn try_from(row: &rusqlite::Row) -> Result<Goal, rusqlite::Error> {
    Ok(Goal {
      goal_id: row.get(0)?,
      creation_time: row.get(1)?,
      creator_user_id: row.get(2)?,
    })
  }
}

// returns the max goal id and adds 1 to it
fn next_id(con: &Connection) -> Result<i64, rusqlite::Error> {
  let sql = "SELECT IFNULL(MAX(goal_id), -1) FROM goal";
  con.query_row(sql, [], |row| row.get(0)).map(|v: i64| v + 1)
}

pub fn add(con: &mut Savepoint, creator_user_id: i64) -> Result<Goal, rusqlite::Error> {
  let sp = con.savepoint()?;

  let goal_id = next_id(&sp)?;

  let creation_time = current_time_millis();

  let sql = "INSERT INTO goal values (?, ?, ?)";
  sp.execute(sql, params![goal_id, creation_time, creator_user_id,])?;

  // commit savepoint
  sp.commit()?;

  // return goal
  Ok(Goal {
    goal_id,
    creation_time,
    creator_user_id,
  })
}

pub fn get_by_goal_id(con: &Connection, goal_id: i64) -> Result<Option<Goal>, rusqlite::Error> {
  let sql = "SELECT * FROM goal WHERE goal_id=?";
  con
    .query_row(sql, params![goal_id], |row| row.try_into())
    .optional()
}

pub fn get_by_request_id(
  con: &Connection,
  request_id: i64,
) -> Result<Option<Goal>, rusqlite::Error> {
  let sql = "SELECT * FROM goal WHERE request_id=?";
  con
    .query_row(sql, params![request_id], |row| row.try_into())
    .optional()
}

pub fn query(
  con: &Connection,
  props: request::GoalViewProps,
) -> Result<Vec<Goal>, rusqlite::Error> {
  let sql = [
    "SELECT g.* FROM goal g WHERE 1 = 1",
    " AND (:goal_id         == NULL OR g.goal_id = :goal_id)",
    " AND (:creation_time   == NULL OR g.creation_time = :creation_time)",
    " AND (:creation_time   == NULL OR g.creation_time >= :min_creation_time)",
    " AND (:creation_time   == NULL OR g.creation_time <= :max_creation_time)",
    " AND (:creator_user_id == NULL OR g.creator_user_id = :creator_user_id)",
    " ORDER BY g.goal_id",
    " LIMIT :offset, :count",
  ]
  .join("");

  let mut stmnt = con.prepare(&sql)?;

  let results = stmnt
    .query(named_params! {
        "goal_id": props.goal_id,
        "creation_time": props.creation_time,
        "creator_user_id": props.creator_user_id,
        "offset": props.offset,
        "count": props.offset,
    })?
    .and_then(|row| row.try_into())
    .filter_map(|x: Result<Goal, rusqlite::Error>| x.ok());
  Ok(results.collect::<Vec<Goal>>())
}
