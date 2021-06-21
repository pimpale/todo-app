use super::todo_app_db_types::*;
use super::utils::current_time_millis;
use std::convert::From;
use tokio_postgres::GenericClient;

impl From<tokio_postgres::row::Row> for ExternalEventData {
  // select * from external_event_data order only, otherwise it will fail
  fn from(row: tokio_postgres::Row) -> ExternalEventData {
    ExternalEventData {
      external_event_data_id: row.get("external_event_data_id"),
      creation_time: row.get("creation_time"),
      creator_user_id: row.get("creator_user_id"),
      external_event_id: row.get("external_event_id"),
      name: row.get("name"),
      start_time: row.get("start_time"),
      end_time: row.get("end_time"),
      active: row.get("active"),
    }
  }
}

// TODO we need to figure out a way to make scheduled and unscheduled goals work better
pub async fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
  external_event_id: i64,
  name: String,
  start_time: i64,
  end_time: i64,
  active: bool,
) -> Result<ExternalEventData, tokio_postgres::Error> {
  let creation_time = current_time_millis();

  let external_event_data_id = con
    .query_one(
      "INSERT INTO
       external_event_data(
           creation_time,
           creator_user_id,
           external_event_id,
           name,
           start_time,
           end_time,
           active
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING external_event_data_id
      ",
      &[
        &creation_time,
        &creator_user_id,
        &external_event_id,
        &name,
        &start_time,
        &end_time,
        &active,
      ],
    )
    .await?
    .get(0);

  Ok(ExternalEventData {
    external_event_data_id,
    creation_time,
    creator_user_id,
    external_event_id,
    name,
    start_time,
    end_time,
    active,
  })
}

pub async fn get_by_external_event_data_id(
  con: &mut impl GenericClient,
  external_event_data_id: &i64,
) -> Result<Option<ExternalEventData>, tokio_postgres::Error> {
  let result = con
    .query_opt(
      "SELECT * FROM external_event_data WHERE external_event_data_id=$1",
      &[&external_event_data_id],
    )
    .await?
    .map(|x| x.into());

  Ok(result)
}

// TODO need to fix

pub async fn query(
  con: &mut impl GenericClient,
  props: todo_app_service_api::request::ExternalEventDataViewProps,
) -> Result<Vec<ExternalEventData>, tokio_postgres::Error> {
  // TODO prevent getting meaningless duration

  let sql = [
    "SELECT eed.* FROM external_event_data eed",
    if props.only_recent {
      " INNER JOIN
          (SELECT max(external_event_data_id) id FROM external_event_data GROUP BY external_event_id) maxids
          ON maxids.id = eed.external_event_data_id"
    } else {
      ""
    },
    " WHERE 1 = 1",
    " AND ($1::bigint  IS NULL OR eed.external_event_data_id = $1)",
    " AND ($2::bigint  IS NULL OR eed.creation_time >= $2)",
    " AND ($3::bigint  IS NULL OR eed.creation_time <= $3)",
    " AND ($4::bigint  IS NULL OR eed.creator_user_id = $4)",
    " AND ($5::bigint  IS NULL OR eed.external_event_id = $5)",
    " AND ($6::text    IS NULL OR eed.name = $6)",
    " AND ($7::text    IS NULL OR eed.name LIKE CONCAT('%',$7,'%'))",
    " AND ($8::bigint  IS NULL OR eed.start_time >= $8)",
    " AND ($9::bigint  IS NULL OR eed.start_time <= $9)",
    " AND ($10::bigint IS NULL OR eed.end_time >= $10)",
    " AND ($11::bigint IS NULL OR eed.end_time <= $11)",
    " AND ($12::bool   IS NULL OR eed.active = $12)",
    " ORDER BY eed.external_event_data_id",
    " LIMIT $13",
    " OFFSET $14",
  ]
  .join("");

  let stmnt = con.prepare(&sql).await?;

  let results = con
    .query(
      &stmnt,
      &[
        &props.external_event_data_id,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
        &props.external_event_id,
        &props.name,
        &props.partial_name,
        &props.min_start_time,
        &props.max_start_time,
        &props.min_end_time,
        &props.max_end_time,
        &props.active,
        &props.count.unwrap_or(100),
        &props.offset.unwrap_or(0),
      ],
    )
    .await?
    .into_iter()
    .map(|row| row.into())
    .collect();

  Ok(results)
}
