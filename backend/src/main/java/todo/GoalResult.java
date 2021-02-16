package todo;

public class GoalResult {
  public long goalResultId;
  public long creationTime;
  long creatorUserId;
  long goalId;
  public String notes;
  public GoalResultKind status;

  // for jackson
  User creator;
  Goal goal;
}

enum GoalResultKind {
  CANCEL(0), SUCCEED(1), FAIL(2);

  final int value;

  private GoalResultKind(int value) {
    this.value = value;
  }

  public static GoalResultKind from(int i) {
    for (GoalResultKind goalResultKind : GoalResultKind.values()) {
      if (goalResultKind.value == i) {
        return goalResultKind;
      }
    }
    return null;
  }

  public static boolean contains(String str) {
    for (GoalResultKind goalResultKind : GoalResultKind.values()) {
      if (goalResultKind.name().equals(str)) {
        return true;
      }
    }
    return false;
  }
}
