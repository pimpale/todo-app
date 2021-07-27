use super::db_types::*;
use super::utils::current_time_millis;
use todo_app_service_api::request;
use tokio_postgres::GenericClient;

impl From<tokio_postgres::row::Row> for UserGeneratedCode {
  // select * from user_generated_code order only, otherwise it will fail
  fn from(row: tokio_postgres::row::Row) -> UserGeneratedCode {
    UserGeneratedCode {
      user_generated_code_id: row.get("user_generated_code_id"),
      creation_time: row.get("creation_time"),
      creator_user_id: row.get("creator_user_id"),
      source_code: row.get("source_code"),
      source_lang: row.get("source_lang"),
      wasm_cache: row.get("wasm_cache"),
    }
  }
}

pub async fn add(
  con: &mut impl GenericClient,
  creator_user_id: i64,
  source_code: String,
  source_lang: String,
  wasm_cache: Vec<u8>,
) -> Result<UserGeneratedCode, tokio_postgres::Error> {
  let creation_time = current_time_millis();

  let user_generated_code_id = con
    .query_one(
      "INSERT INTO
       user_generated_code(
           creation_time,
           creator_user_id,
           source_code,
           source_lang,
           wasm_cache
       )
       VALUES($1, $2, $3, $4, $5)
       RETURNING user_generated_code_id
      ",
      &[
        &creation_time,
        &creator_user_id,
        &source_code,
        &source_lang,
        &wasm_cache,
      ],
    )
    .await?
    .get(0);

  // return user_generated_code
  Ok(UserGeneratedCode {
    user_generated_code_id,
    creation_time,
    creator_user_id,
    source_code,
    source_lang,
    wasm_cache,
  })
}

pub async fn get_by_user_generated_code_id(
  con: &mut impl GenericClient,
  user_generated_code_id: i64,
) -> Result<Option<UserGeneratedCode>, tokio_postgres::Error> {
  let result = con
    .query_opt(
      "SELECT * FROM user_generated_code WHERE user_generated_code_id=$1",
      &[&user_generated_code_id],
    )
    .await?
    .map(|x| x.into());

  Ok(result)
}

pub async fn query(
  con: &mut impl GenericClient,
  props: request::UserGeneratedCodeViewProps,
) -> Result<Vec<UserGeneratedCode>, tokio_postgres::Error> {
  let results = con
    .query(
      "
        SELECT ugc.* FROM user_generated_code ugc WHERE 1 = 1
        AND ($1::bigint[] IS NULL OR ugc.user_generated_code_id = ANY($1))
        AND ($2::bigint   IS NULL OR ugc.creation_time >= $2)
        AND ($3::bigint   IS NULL OR ugc.creation_time <= $3)
        AND ($4::bigint[] IS NULL OR ugc.creator_user_id = ANY($4))
        AND ($5::text[]   IS NULL OR ugc.source_lang = ANY($5))
        ORDER BY ugc.user_generated_code_id
      ",
      &[
        &props.user_generated_code_id,
        &props.min_creation_time,
        &props.max_creation_time,
        &props.creator_user_id,
        &props.source_lang,
      ],
    )
    .await?
    .into_iter()
    .map(|row| row.into())
    .collect();

  Ok(results)
}
