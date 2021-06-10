use super::Db;
use mail_service_api::request;
use mail_service_api::response;

use super::mail_db_types::*;
use super::mail_service;
use super::utils;

fn report_unk_err<E: std::error::Error>(e: E) -> response::MailError {
  utils::log(utils::Event {
    msg: e.to_string(),
    source: e.source().map(|e| e.to_string()),
    severity: utils::SeverityKind::Error,
  });
  response::MailError::Unknown
}

pub fn fill_mail(
  _con: &rusqlite::Connection,
  mail: Mail,
) -> Result<response::Mail, response::MailError> {
  Ok(response::Mail {
    mail_id: mail.mail_id,
    request_id: mail.request_id,
    creation_time: mail.creation_time,
    topic: mail.topic,
    destination: mail.destination,
    title: mail.title,
    content: mail.content,
  })
}

pub async fn mail_new(
  db: Db,
  props: request::MailNewProps,
) -> Result<response::Mail, response::MailError> {
  let con = &mut *db.lock().await;
  let mut sp = con.savepoint().map_err(report_unk_err)?;

  println!("Topic: {}", &props.topic);
  println!("To: {}", &props.destination);
  println!("Subject: {}", &props.title);
  println!("Body:\n {}", &props.content);

  let mail = mail_service::add(&mut sp, props).map_err(report_unk_err)?;

  sp.commit().map_err(report_unk_err)?;
  fill_mail(con, mail)
}

pub async fn mail_view(
  db: Db,
  props: request::MailViewProps,
) -> Result<Vec<response::Mail>, response::MailError> {
  let con = &mut *db.lock().await;
  // get mails
  let mails = mail_service::query(con, props).map_err(report_unk_err)?;
  // return
  mails.into_iter().map(|a| fill_mail(con, a)).collect()
}
