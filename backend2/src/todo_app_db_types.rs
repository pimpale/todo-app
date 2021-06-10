use todo_app_service_api::request::GoalDataStatusKind;

#[derive(Clone, Debug)]
pub struct Goal {
  pub goal_id: i64,
  pub creation_time: i64,
  pub creator_user_id: i64,
}

#[derive(Clone, Debug)]
pub struct GoalData {
  pub goal_data_id: i64,
  pub creation_time: i64,
  pub creator_user_id: i64,
  pub goal_id: i64,
  pub name: String,
  pub description: String,
  pub duration_estimate: i64,
  pub time_utility_function_id: i64,
  pub status: GoalDataStatusKind,
  pub scheduled: bool,
  pub duration: i64,
  pub start_time: i64,
}

#[derive(Clone, Debug)]
pub struct PastEvent {
  pub past_event_id: i64,
  pub creation_time: i64,
  pub creator_user_id: i64,
}

#[derive(Clone, Debug)]
pub struct PastEventData {
  pub past_event_data_id: i64,
  pub creation_time: i64,
  pub creator_user_id: i64,
  pub past_event_id: i64,
  pub name: String,
  pub description: String,
  pub start_time: i64,
  pub duration: i64,
  pub active: bool,
}

#[derive(Clone, Debug)]
pub struct TimeUtilityFunction {
  pub time_utility_function_id: i64,
  pub creation_time: i64,
  pub creator_user_id: i64,
}

#[derive(Clone, Debug)]
pub struct TimeUtilityFunctionPoint {
  pub time_utility_function_point_id: i64,
  pub creation_time: i64,
  pub creator_user_id: i64,
  pub time_utility_function_id: i64,
  pub start_time: i64,
  pub utils: i64,
}
