package todo;

public class PastEventData {
  public long pastEventDataId;
  public long creationTime;
  long creatorUserId;
  long pastEventId;
  public String name;
  public long startTime;
  public long duration;
  public boolean active;

  // for jackson
  public User creator;
  public PastEvent pastEvent;
}

