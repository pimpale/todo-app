package todo;

import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;

public class PastEventRowMapper implements RowMapper<PastEvent> {
  @Override 
  public PastEvent mapRow(ResultSet row, int rowNum) throws SQLException {
    PastEvent pe = new PastEvent();
    pe.pastEventId= row.getLong("past_event_id");
    pe.creationTime = row.getLong("creation_time");
    pe.creatorUserId = row.getLong("creator_user_id");
    return pe;
  }
}
