package todo;

import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;

public class EventRowMapper implements RowMapper<Event> {
  @Override 
  public Event mapRow(ResultSet row, int rowNum) throws SQLException {
    Event e = new Event();
    e.eventId= row.getLong("event_id");
    e.creationTime = row.getLong("creation_time");
    e.creatorUserId = row.getLong("creator_user_id");
    return e;
  }
}
