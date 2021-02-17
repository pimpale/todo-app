package todo;

public class Task {
  public long taskId;
  public long creationTime;
  long creatorUserId;
  long goalId;
  public long startTime;
  public TaskStatusKind status;

  public User creator;
  public Goal goal;
}

enum TaskStatusKind {
  VALID(0), CANCEL(1);

  final int value;

  private TaskStatusKind(int value) {
    this.value = value;
  }

  public static TaskStatusKind from(int i) {
    for (TaskStatusKind goalDataStatusKind : TaskStatusKind.values()) {
      if (goalDataStatusKind.value == i) {
        return goalDataStatusKind;
      }
    }
    return null;
  }

  public static boolean contains(String str) {
    for (TaskStatusKind goalDataStatusKind : TaskStatusKind.values()) {
      if (goalDataStatusKind.name().equals(str)) {
        return true;
      }
    }
    return false;
  }
}
