package todo;

public class Subscription {
  public long subscriptionId;
  public long creationTime;
  long creatorUserId;
  public SubscriptionKind subscriptionKind;
  public long maxUses;

  // for jackson
  public User creator;
}

enum SubscriptionKind {
  VALID(0), CANCEL(1);

  final int value;

  private SubscriptionKind(int value) {
    this.value = value;
  }

  public static SubscriptionKind from(int i) {
    for (SubscriptionKind subscriptionKind : SubscriptionKind.values()) {
      if (subscriptionKind.value == i) {
        return subscriptionKind;
      }
    }
    return null;
  }

  public static boolean contains(String str) {
    for (SubscriptionKind subscriptionKind : SubscriptionKind.values()) {
      if (subscriptionKind.name().equals(str)) {
        return true;
      }
    }
    return false;
  }
}
