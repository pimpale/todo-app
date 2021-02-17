package todo;

import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;

public class PastEventDataRowMapper implements RowMapper<PastEventData> {
  @Override
  public PastEventData mapRow(ResultSet row, int rowNum) throws SQLException {
    PastEventData ped = new PastEventData();
    ped.pastEventDataId = row.getLong("past_event_data_id");
    ped.creationTime = row.getLong("creation_time");
    ped.creatorUserId = row.getLong("creator_user_id");
    ped.pastEventId = row.getLong("past_event_id");
    ped.name = row.getString("name");
    ped.description = row.getString("description");
    ped.startTime = row.getLong("start_time");
    ped.duration = row.getLong("duration");
    ped.active = row.getBoolean("active");
    return ped;
  }
}
