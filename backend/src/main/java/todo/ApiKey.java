package todo;

public class ApiKey {

  public long apiKeyId;
  public long creationTime;
  long creatorUserId;

  String apiKeyHash;
  public long duration;
  public ApiKeyKind apiKeyKind;

  // Initialized by jackson during serialization, but not persisted
  public String key;
  public User creator;
}

enum ApiKeyKind {
  VALID(0), CANCEL(1);

  final int value;

  private ApiKeyKind(int value) {
    this.value = value;
  }

  public static ApiKeyKind from(int i) {
    for (ApiKeyKind apiKeyKind : ApiKeyKind.values()) {
      if (apiKeyKind.value == i) {
        return apiKeyKind;
      }
    }
    return null;
  }

  public static boolean contains(String str) {
    for (ApiKeyKind apiKeyKind : ApiKeyKind.values()) {
      if (apiKeyKind.name().equals(str)) {
        return true;
      }
    }
    return false;
  }
}
