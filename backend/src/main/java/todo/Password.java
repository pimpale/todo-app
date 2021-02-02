package todo;

public class Password {
    public long passwordId;
    public long creationTime;
    long creatorUserId;
    long userId;
    public PasswordKind passwordKind;
    String passwordHash;
    String passwordResetKeyHash;

    // for jackson
    public User creator;
    public User user;
    public PasswordReset passwordReset;
}

enum PasswordKind {
  CHANGE(0), RESET(1), CANCEL(2);

  final int value;

  private PasswordKind(int value) {
    this.value = value;
  }

  public static PasswordKind from(int i) {
    for (PasswordKind passwordKind : PasswordKind.values()) {
      if (passwordKind.value == i) {
        return passwordKind;
      }
    }
    return null;
  }

  public static boolean contains(String str) {
    for (PasswordKind passwordKind : PasswordKind.values()) {
      if (passwordKind.name().equals(str)) {
        return true;
      }
    }
    return false;
  }
}
