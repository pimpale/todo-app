use super::db_types::*;
use super::utils::current_time_millis;
use std::convert::From;
use std::convert::TryInto;
use todo_app_service_api::request;
use tokio_postgres::GenericClient;

impl From<tokio_postgres::row::Row> for NamedEntityData {
  // select * from named_entity_data order only, otherwise it will fail
  fn from(row: tokio_postgres::Row) -> NamedEntityData {
    NamedEntityData {
      named_entity_data_id: row.get("named_entity_data_id"),
      creation_time: row.get("creation_time"),
      creator_user_id: row.get("creator_user_id"),
      named_entity_id: row.get("named_entity_id"),
      name: row.get("name"),
      kind: (row.get::<_, i64>("kind") as u8).try_into().unwrap(),
      active: row.get("active"),
    }
  }
}

pub async fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
  named_entity_id: i64,
  name: String,
  kind: request::NamedEntityKind,
  active: bool,
) -> Result<NamedEntityData, tokio_postgres::Error> {
  let creation_time = current_time_millis();

  let named_entity_data_id = con
    .query_one(
      "INSERT INTO
       named_entity_data(
           creation_time,
           creator_user_id,
           named_entity_id,
           name,
           kind,
           active
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING named_entity_data_id
      ",
      &[
        &creation_time,
        &creator_user_id,
        &named_entity_id,
        &name,
        &(kind.clone() as i64),
        &active,
      ],
    )
    .await?
    .get(0);

  Ok(NamedEntityData {
    named_entity_data_id,
    creation_time,
    creator_user_id,
    named_entity_id,
    name,
    kind,
    active,
  })
}

pub async fn get_by_named_entity_data_id(
  con: &mut impl GenericClient,
  named_entity_data_id: &i64,
) -> Result<Option<NamedEntityData>, tokio_postgres::Error> {
  let result = con
    .query_opt(
      "SELECT * FROM named_entity_data WHERE named_entity_data_id=$1",
      &[&named_entity_data_id],
    )
    .await?
    .map(|x| x.into());

  Ok(result)
}

pub async fn query(
  con: &mut impl GenericClient,
  props: todo_app_service_api::request::NamedEntityDataViewProps,
) -> Result<Vec<NamedEntityData>, tokio_postgres::Error> {
  let sql = [
    if props.only_recent {
      "SELECT ned.* FROM recent_named_entity_data ned"
    } else {
      "SELECT ned.* FROM named_entity_data ned"
    },
    " WHERE 1 = 1",
    " AND ($1::bigint[]  IS NULL OR ned.named_entity_data_id = ANY($1))",
    " AND ($2::bigint    IS NULL OR ned.creation_time >= $2)",
    " AND ($3::bigint    IS NULL OR ned.creation_time <= $3)",
    " AND ($4::bigint[]  IS NULL OR ned.creator_user_id = ANY($4))",
    " AND ($5::bigint[]  IS NULL OR ned.named_entity_id = ANY($5))",
    " AND ($6::text[]    IS NULL OR ned.name = ANY($6))",
    " AND ($7::bigint[]  IS NULL OR ned.kind = ANY($7))",
    " AND ($8::bool      IS NULL OR ned.active = $8)",
    " ORDER BY ned.named_entity_data_id",
  ]
  .join("\n");

  let stmnt = con.prepare(&sql).await?;

  let results = con
    .query(
      &stmnt,
      &[
        &props.named_entity_data_id,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
        &props.named_entity_id,
        &props.name,
        &props
          .kind
          .map(|x| x.into_iter().map(|x| x as i64).collect::<Vec<i64>>()),
        &props.active,
      ],
    )
    .await?
    .into_iter()
    .map(|row| row.into())
    .collect();

  Ok(results)
}
