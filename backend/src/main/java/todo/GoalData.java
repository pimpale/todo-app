package todo;

public class GoalData {
  public long goalDataId;
  public long creationTime;
  long creatorUserId;
  long goalId;
  public String name;
  public String description;
  public long durationEstimate;
  long timeUtilityFunctionId;
  public GoalDataStatusKind status;
  public boolean scheduled;
  public long duration;
  public long startTime;

  // for jackson
  public User creator;
  public Goal goal;
  public TimeUtilityFunction timeUtilityFunction;
}

enum GoalDataStatusKind {
  PENDING(0), SUCCEED(1), FAIL(2), CANCEL(3);

  final int value;

  private GoalDataStatusKind(int value) {
    this.value = value;
  }

  public static GoalDataStatusKind from(int i) {
    for (GoalDataStatusKind goalDataStatusKind : GoalDataStatusKind.values()) {
      if (goalDataStatusKind.value == i) {
        return goalDataStatusKind;
      }
    }
    return null;
  }

  public static boolean contains(String str) {
    for (GoalDataStatusKind goalDataStatusKind : GoalDataStatusKind.values()) {
      if (goalDataStatusKind.name().equals(str)) {
        return true;
      }
    }
    return false;
  }
}
