use super::db_types::*;
use super::utils::current_time_millis;
use tokio_postgres::GenericClient;
use todo_app_service_api::request;

impl From<tokio_postgres::row::Row> for NamedEntity {
  // select * from named_entity order only, otherwise it will fail
  fn from(row: tokio_postgres::row::Row) -> NamedEntity {
    NamedEntity {
      named_entity_id: row.get("named_entity_id"),
      creation_time: row.get("creation_time"),
      creator_user_id: row.get("creator_user_id"),
    }
  }
}

pub async fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
) -> Result<NamedEntity, tokio_postgres::Error> {
  let creation_time = current_time_millis();

  let named_entity_id = con
    .query_one(
      "INSERT INTO
       named_entity(
           creation_time,
           creator_user_id
       )
       VALUES($1, $2)
       RETURNING named_entity_id
      ",
      &[&creation_time, &creator_user_id],
    ).await?
    .get(0);

  // return named_entity
  Ok(NamedEntity {
    named_entity_id,
    creation_time,
    creator_user_id,
  })
}

pub async fn get_by_named_entity_id(
  con: &mut impl GenericClient,
  named_entity_id: i64,
) -> Result<Option<NamedEntity>, tokio_postgres::Error> {
  let result = con
    .query_opt(
      "SELECT * FROM named_entity WHERE named_entity_id=$1",
      &[&named_entity_id],
    ).await?
    .map(|x| x.into());

  Ok(result)
}

pub async fn query(
  con: &mut impl GenericClient,
  props: request::NamedEntityViewProps,
) -> Result<Vec<NamedEntity>, tokio_postgres::Error> {
  let results = con
    .query(
      "
        SELECT gt.* FROM named_entity gt WHERE 1 = 1
        AND ($1::bigint[] IS NULL OR gt.named_entity_id = ANY($1))
        AND ($2::bigint   IS NULL OR gt.creation_time >= $2)
        AND ($3::bigint   IS NULL OR gt.creation_time <= $3)
        AND ($4::bigint[] IS NULL OR gt.creator_user_id = ANY($4))
        ORDER BY gt.named_entity_id
      ",
      &[
        &props.named_entity_id,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
      ],
    ).await?
    .into_iter()
    .map(|row| row.into())
    .collect();

  Ok(results)
}
