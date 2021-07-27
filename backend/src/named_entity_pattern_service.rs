use super::db_types::*;
use super::utils::current_time_millis;
use std::convert::From;
use tokio_postgres::GenericClient;

impl From<tokio_postgres::row::Row> for NamedEntityPattern {
  // select * from named_entity_pattern order only, otherwise it will fail
  fn from(row: tokio_postgres::Row) -> NamedEntityPattern {
    NamedEntityPattern {
      named_entity_pattern_id: row.get("named_entity_pattern_id"),
      creation_time: row.get("creation_time"),
      creator_user_id: row.get("creator_user_id"),
      named_entity_id: row.get("named_entity_id"),
      pattern: row.get("pattern"),
      active: row.get("active"),
    }
  }
}

pub async fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
  named_entity_id: i64,
  pattern: String,
  active: bool,
) -> Result<NamedEntityPattern, tokio_postgres::Error> {
  let creation_time = current_time_millis();

  let named_entity_pattern_id = con
    .query_one(
      "INSERT INTO
       named_entity_pattern(
           creation_time,
           creator_user_id,
           named_entity_id,
           pattern,
           active
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING named_entity_pattern_id
      ",
      &[
        &creation_time,
        &creator_user_id,
        &named_entity_id,
        &pattern,
        &active,
      ],
    )
    .await?
    .get(0);

  Ok(NamedEntityPattern {
    named_entity_pattern_id,
    creation_time,
    creator_user_id,
    named_entity_id,
    pattern,
    active,
  })
}

pub async fn get_by_named_entity_pattern_id(
  con: &mut impl GenericClient,
  named_entity_pattern_id: &i64,
) -> Result<Option<NamedEntityPattern>, tokio_postgres::Error> {
  let result = con
    .query_opt(
      "SELECT * FROM named_entity_pattern WHERE named_entity_pattern_id=$1",
      &[&named_entity_pattern_id],
    )
    .await?
    .map(|x| x.into());

  Ok(result)
}

pub async fn query(
  con: &mut impl GenericClient,
  props: todo_app_service_api::request::NamedEntityPatternViewProps,
) -> Result<Vec<NamedEntityPattern>, tokio_postgres::Error> {
  let sql = [
    if props.only_recent {
      "SELECT nep.* FROM recent_named_entity_pattern nep"
    } else {
      "SELECT nep.* FROM named_entity_pattern nep"
    },
    " WHERE 1 = 1",
    " AND ($1::bigint[]  IS NULL OR nep.named_entity_pattern_id = ANY($1))",
    " AND ($2::bigint    IS NULL OR nep.creation_time >= $2)",
    " AND ($3::bigint    IS NULL OR nep.creation_time <= $3)",
    " AND ($4::bigint[]  IS NULL OR nep.creator_user_id = ANY($4))",
    " AND ($5::bigint[]  IS NULL OR nep.named_entity_id = ANY($5))",
    " AND ($6::text[]    IS NULL OR nep.pattern = ANY($6))",
    " AND ($7::bool      IS NULL OR nep.active = $7)",
    " ORDER BY nep.named_entity_pattern_id",
  ]
  .join("\n");

  let stmnt = con.prepare(&sql).await?;

  let results = con
    .query(
      &stmnt,
      &[
        &props.named_entity_pattern_id,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
        &props.named_entity_id,
        &props.pattern,
        &props.active,
      ],
    )
    .await?
    .into_iter()
    .map(|row| row.into())
    .collect();

  Ok(results)
}
