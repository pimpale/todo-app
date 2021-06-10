use super::mail_db_types::*;
use super::utils::current_time_millis;
use mail_service_api::request;
use rusqlite::{named_params, params, Connection, OptionalExtension, Savepoint};
use std::convert::{TryFrom, TryInto};

impl TryFrom<&rusqlite::Row<'_>> for Mail {
  type Error = rusqlite::Error;

  // select * from mail order only, otherwise it will fail
  fn try_from(row: &rusqlite::Row) -> Result<Mail, rusqlite::Error> {
    Ok(Mail {
      mail_id: row.get(0)?,
      request_id: row.get(1)?,
      creation_time: row.get(2)?,
      topic: row.get(3)?,
      destination: row.get(4)?,
      title: row.get(5)?,
      content: row.get(6)?,
    })
  }
}

// returns the max mail id and adds 1 to it
fn next_id(con: &Connection) -> Result<i64, rusqlite::Error> {
  let sql = "SELECT IFNULL(MAX(mail_id), -1) FROM mail";
  con.query_row(sql, [], |row| row.get(0)).map(|v: i64| v + 1)
}

pub fn add(con: &mut Savepoint, props: request::MailNewProps) -> Result<Mail, rusqlite::Error> {
  let sp = con.savepoint()?;

  let mail_id = next_id(&sp)?;

  let creation_time = current_time_millis();

  let sql = "INSERT INTO mail values (?, ?, ?, ?, ?, ?, ?)";
  sp.execute(
    sql,
    params![
      mail_id,
      props.request_id,
      creation_time,
      &props.topic,
      &props.destination,
      &props.title,
      &props.content,
    ],
  )?;

  // commit savepoint
  sp.commit()?;

  // return mail
  Ok(Mail {
    mail_id,
    request_id: props.request_id,
    creation_time,
    topic: props.topic,
    destination: props.destination,
    title: props.title,
    content: props.content,
  })
}

pub fn get_by_mail_id(con: &Connection, mail_id: i64) -> Result<Option<Mail>, rusqlite::Error> {
  let sql = "SELECT * FROM mail WHERE mail_id=?";
  con
    .query_row(sql, params![mail_id], |row| row.try_into())
    .optional()
}

pub fn get_by_request_id(
  con: &Connection,
  request_id: i64,
) -> Result<Option<Mail>, rusqlite::Error> {
  let sql = "SELECT * FROM mail WHERE request_id=?";
  con
    .query_row(sql, params![request_id], |row| row.try_into())
    .optional()
}

pub fn query(
  con: &Connection,
  props: mail_service_api::request::MailViewProps,
) -> Result<Vec<Mail>, rusqlite::Error> {
  let sql = [
    "SELECT m.* FROM mail m WHERE 1 = 1",
    " AND (:mail_id       == NULL OR m.mail_id = :mail_id)",
    " AND (:request_id    == NULL OR m.request_id = :request_id)",
    " AND (:creation_time == NULL OR m.creation_time = :creation_time)",
    " AND (:creation_time == NULL OR m.creation_time >= :min_creation_time)",
    " AND (:creation_time == NULL OR m.creation_time <= :max_creation_time)",
    " AND (:topic         == NULL OR m.topic = :topic)",
    " AND (:destination   == NULL OR m.destination = :destination)",
    " ORDER BY m.mail_id",
    " LIMIT :offset, :count",
  ]
  .join("");

  let mut stmnt = con.prepare(&sql)?;

  let results = stmnt
    .query(named_params! {
        "mail_id": props.mail_id,
        "request_id": props.request_id,
        "creation_time": props.creation_time,
        "min_creation_time": props.min_creation_time,
        "max_creation_time": props.max_creation_time,
        "topic": props.topic,
        "destination": props.destination,
        "offset": props.offset,
        "count": props.offset,
    })?
    .and_then(|row| row.try_into())
    .filter_map(|x: Result<Mail, rusqlite::Error>| x.ok());
  Ok(results.collect::<Vec<Mail>>())
}
