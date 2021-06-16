use super::todo_app_db_types::*;
use super::utils::current_time_millis;
use postgres::GenericClient;

impl From<postgres::row::Row> for TaskEvent {
  // select * from task_event order only, otherwise it will fail
  fn from(row: postgres::row::Row) -> TaskEvent {
    TaskEvent {
      task_event_id: row.get("task_event_id"),
      creation_time: row.get("creation_time"),
      creator_user_id: row.get("creator_user_id"),
      goal_id: row.get("goal_id"),
      start_time: row.get("start_time"),
      duration: row.get("duration"),
      active: row.get("active"),
    }
  }
}

pub fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
  goal_id: i64,
  start_time: i64,
  duration: i64,
  active: bool,
) -> Result<TaskEvent, postgres::Error> {
  let creation_time = current_time_millis();

  let task_event_id = con
    .query_one(
      "INSERT INTO
    task_event(
        creation_time,
        creator_user_id,
        goal_id,
        start_time,
        duration,
        active
    ) values ($1, $2, $3, $4, $5, $6)",
      &[
        &creation_time,
        &creator_user_id,
        &goal_id,
        &start_time,
        &duration,
        &active,
      ],
    )?
    .get(0);

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
  con: &mut impl GenericClient,
  task_event_id: &str,
) -> Result<Option<TaskEvent>, postgres::Error> {
  let sql = "SELECT * FROM task_event WHERE task_event_id=$1";
  let result = con.query_opt(sql, &[&task_event_id])?.map(|x| x.into());
  Ok(result)
}

pub fn query(
  con: &mut impl GenericClient,
  props: todo_app_service_api::request::TaskEventViewProps,
) -> Result<Vec<TaskEvent>, postgres::Error> {
  let sql = [
    "SELECT te.* FROM task_event te",
    if props.only_recent {
      " INNER JOIN (SELECT max(task_event_id) id FROM task_event GROUP BY goal_id) maxids
        ON maxids.id = te.task_event_id"
    } else {
      ""
    },
    " WHERE 1 = 1",
    " AND ($1  == NULL OR te.task_event_id = $1)",
    " AND ($2  == NULL OR te.creation_time = $2)",
    " AND ($3  == NULL OR te.creation_time >= $3)",
    " AND ($4  == NULL OR te.creation_time <= $4)",
    " AND ($5  == NULL OR te.creator_user_id = $5)",
    " AND ($6  == NULL OR te.goal_id = $6)",
    " AND ($7  == NULL OR te.start_time = $7)",
    " AND ($8  == NULL OR te.start_time >= $8)",
    " AND ($9  == NULL OR te.start_time <= $9)",
    " AND ($10 == NULL OR te.duration = $10)",
    " AND ($11 == NULL OR te.duration >= $11)",
    " AND ($12 == NULL OR te.duration <= $12)",
    " AND ($13 == NULL OR te.active = $13)",
    " ORDER BY te.task_event_id",
    " LIMIT $14, $15",
  ]
  .join("");

  let mut stmnt = con.prepare(&sql)?;

  let results = con
    .query(
      &stmnt,
      &[
        &props.task_event_id,
        &props.creation_time,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
        &props.goal_id,
        &props.start_time,
        &props.min_start_time,
        &props.max_start_time,
        &props.duration,
        &props.min_duration,
        &props.max_duration,
        &props.active,
        &props.offset,
        &props.count,
      ],
    )?
    .into_iter()
    .map(|row| row.into())
    .collect();

  Ok(results)
}
