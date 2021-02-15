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

enum GoalDataKind {
  CANCELLED(0), SUCCEEDED(1), FAILED(2), UNRESOLVED(3);

  final int value;

  private GoalDataKind(int value) {
    this.value = value;
  }

  public static GoalDataKind from(int i) {
    for (GoalDataKind goalDataKind : GoalDataKind.values()) {
      if (goalDataKind.value == i) {
        return goalDataKind;
      }
    }
    return null;
  }

  public static boolean contains(String str) {
    for (GoalDataKind goalDataKind : GoalDataKind.values()) {
      if (goalDataKind.name().equals(str)) {
        return true;
      }
    }
    return false;
  }
}
