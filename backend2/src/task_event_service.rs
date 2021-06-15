use super::todo_app_db_types::*;
use super::utils::current_time_millis;
use rusqlite::{named_params, params, Connection, OptionalExtension, Savepoint};
use std::convert::{TryFrom, TryInto};

impl TryFrom<&rusqlite::Row<'_>> for TaskEvent {
  type Error = rusqlite::Error;

  // select * from task_event order only, otherwise it will fail
  fn try_from(row: &rusqlite::Row) -> Result<TaskEvent, rusqlite::Error> {
    Ok(TaskEvent {
      task_event_id: row.get(0)?,
      creation_time: row.get(1)?,
      creator_user_id: row.get(2)?,
      goal_id: row.get(3)?,
      start_time: row.get(4)?,
      duration: row.get(5)?,
      active: row.get(6)?,
    })
  }
}

pub fn add(
  con: &mut Savepoint,
  creator_user_id: i64,
  goal_id: i64,
  start_time: i64,
  duration: i64,
  active: bool,
) -> Result<TaskEvent, rusqlite::Error> {
  let sp = con.savepoint()?;
  let creation_time = current_time_millis();

  let sql = "INSERT INTO
    task_event(
        creation_time,
        creator_user_id,
        goal_id,
        start_time,
        duration,
        active
    ) values (?, ?, ?, ?, ?, ?)";

  sp.execute(
    sql,
    params![
      creation_time,
      creator_user_id,
      goal_id,
      start_time,
      duration,
      active
    ],
  )?;

  let task_event_id = sp.last_insert_rowid();

  // commit savepoint
  sp.commit()?;

  // return task_event
  Ok(TaskEvent {
    task_event_id,
    creation_time,
    creator_user_id,
    goal_id,
    start_time,
    duration,
    active,
  })
}

pub fn get_by_task_event_id(
  con: &Connection,
  goal_id: &str,
) -> Result<Option<TaskEvent>, rusqlite::Error> {
  let sql = "SELECT * FROM task_event WHERE task_event_id=? ORDER BY task_event_id DESC LIMIT 1";
  con
    .query_row(sql, params![goal_id], |row| row.try_into())
    .optional()
}

// TODO need to fix

pub fn query(
  con: &Connection,
  props: todo_app_service_api::request::TaskEventViewProps,
) -> Result<Vec<TaskEvent>, rusqlite::Error> {

  let sql = [
    "SELECT te.* FROM task_event te",
    if props.only_recent {
        " INNER JOIN (SELECT max(task_event_id) id FROM task_event GROUP BY goal_id) maxids
        ON maxids.id = te.task_event_id"
    } else {
        ""
    },
    " WHERE 1 = 1",
    " AND (:task_event_id     == NULL OR te.task_event_id = :task_event_id)",
    " AND (:creation_time     == NULL OR te.creation_time = :creation_time)",
    " AND (:creation_time     == NULL OR te.creation_time >= :min_creation_time)",
    " AND (:creation_time     == NULL OR te.creation_time <= :max_creation_time)",
    " AND (:creator_user_id   == NULL OR te.creator_user_id = :creator_user_id)",
    " AND (:goal_id           == NULL OR te.goal_id = :goal_id)",
    " AND (:start_time        == NULL OR te.start_time = :start_time)",
    " AND (:start_time        == NULL OR te.start_time >= :min_start_time)",
    " AND (:start_time        == NULL OR te.start_time <= :max_start_time)",
    " AND (:duration          == NULL OR te.duration = :duration)",
    " AND (:duration          == NULL OR te.duration >= :min_duration)",
    " AND (:duration          == NULL OR te.duration <= :max_duration)",
    " AND (:active            == NULL OR te.active = :active)",
    " ORDER BY te.task_event_id",
    " LIMIT :offset, :count",
  ]
  .join("");

  let mut stmnt = con.prepare(&sql)?;

  let results = stmnt
    .query(named_params! {
        "task_event_id": props.task_event_id,
        "creation_time": props.creation_time,
        "min_creation_time": props.min_creation_time,
        "max_creation_time": props.max_creation_time,
        "creator_user_id": props.creator_user_id,
        "goal_id": props.goal_id,
        "start_time": props.start_time,
        "min_start_time": props.min_start_time,
        "max_start_time": props.max_start_time,
        "duration": props.duration,
        "min_duration": props.min_duration,
        "max_duration": props.max_duration,
        "active": props.active,
        "offset": props.offset,
        "count": props.count,
    })?
    .and_then(|row| row.try_into())
    .filter_map(|x: Result<TaskEvent, rusqlite::Error>| x.ok());
  Ok(results.collect::<Vec<TaskEvent>>())
}
