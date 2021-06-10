#[derive(Clone, Debug)]
pub struct Mail {
  pub mail_id: i64,
  pub request_id: i64,
  pub creation_time: i64,
  pub topic:String,
  pub destination: String,
  pub title:String,
  pub content:String
}
