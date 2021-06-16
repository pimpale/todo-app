use todo_app_service_api::request::GoalDataStatusKind;

// Represents an unscheduled goal with minimal user input
// We can detect its edits later
#[derive(Clone, Debug)]
pub struct GoalIntent {
  pub goal_intent_id: i64,
  pub creation_time: i64,
  pub creator_user_id: i64,
}

#[derive(Clone, Debug)]
pub struct GoalIntentData {
  pub goal_intent_data_id: i64,
  pub creation_time: i64,
  pub creator_user_id: i64,
  pub goal_intent_id: i64,
  pub name: String,
  pub active: bool,
}

#[derive(Clone, Debug)]
pub struct Goal {
  pub goal_id: i64,
  pub creation_time: i64,
  pub creator_user_id: i64,
  pub goal_intent_id: Option<i64>
}

#[derive(Clone, Debug)]
pub struct GoalData {
  pub goal_data_id: i64,
  pub creation_time: i64,
  pub creator_user_id: i64,
  pub goal_id: i64,
  pub name: String,
  pub duration_estimate: i64,
  pub time_utility_function_id: i64,
  pub parent_goal_id: Option<i64>,
  pub status: GoalDataStatusKind,
}

#[derive(Clone, Debug)]
pub struct TaskEvent {
  pub task_event_id: i64,
  pub creation_time: i64,
  pub creator_user_id: i64,
  pub goal_id: i64,
  pub start_time: i64,
  pub duration: i64,
  pub active: bool,
}

#[derive(Clone, Debug)]
pub struct TimeUtilityFunction {
  pub time_utility_function_id: i64,
  pub creation_time: i64,
  pub creator_user_id: i64,
  pub start_times: Vec<i64>,
  pub utils: Vec<i64>,
}
