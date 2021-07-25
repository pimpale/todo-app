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
    pub goal_intent_id: Option<i64>,
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
pub struct GoalEvent {
    pub goal_event_id: i64,
    pub creation_time: i64,
    pub creator_user_id: i64,
    pub goal_id: i64,
    pub start_time: i64,
    pub end_time: i64,
    pub active: bool,
}

// essentially a tag
pub struct NamedEntity {
    pub named_entity_id: i64,
    pub creation_time: i64,
    pub creator_user_id: i64,
}

pub struct NamedEntityData {
    pub named_entity_data_id: i64,
    pub creation_time: i64,
    pub creator_user_id: i64,
    pub name: String,
    pub kind: i64,
    pub active: bool
}

pub struct NamedEntityPattern {
    pub named_entity_pattern_id: i64,
    pub creation_time: i64,
    pub creator_user_id: i64,
    pub named_entity_id: i64,
    pub pattern: String,
    pub active: bool
}

pub struct GoalTemplate {
    pub goal_template_id: i64,
    pub creation_time: i64,
    pub creator_user_id: i64,
}

pub struct GoalTemplateData {
    pub goal_template_data_id: i64,
    pub creation_time:i64,
    pub creator_user_id:i64,
    pub name:String,
    pub user_generated_code_id:i64,
    pub active:bool
}

// made seperate to avoid having to regenerate it
#[derive(Clone, Debug)]
pub struct TimeUtilityFunction {
    pub time_utility_function_id: i64,
    pub creation_time: i64,
    pub creator_user_id: i64,
    pub start_times: Vec<i64>,
    pub utils: Vec<i64>,
}

#[derive(Clone, Debug)]
pub struct ExternalEvent {
    pub external_event_id: i64,
    pub creation_time: i64,
    pub creator_user_id: i64,
}

#[derive(Clone, Debug)]
pub struct ExternalEventData {
    pub external_event_data_id: i64,
    pub creation_time: i64,
    pub creator_user_id: i64,
    pub external_event_id: i64,
    pub name: String,
    pub start_time: i64,
    pub end_time: i64,
    pub active: bool,
}
