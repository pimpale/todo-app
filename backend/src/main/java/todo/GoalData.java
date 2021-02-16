package todo;

public class GoalData {
  public long goalDataId;
  public long creationTime;
  long creatorUserId;
  long goalId;
  public String name;
  public String description;
  long timeUtilityFunctionId;
  public long duration;

  // for jackson
  User creator;
  Goal goal;
  TimeUtilityFunction timeUtilityFunction;
}

