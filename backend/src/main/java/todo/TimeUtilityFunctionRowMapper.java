package todo;

import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;

public class TimeUtilityFunctionRowMapper implements RowMapper<TimeUtilityFunction> {
  @Override 
  public TimeUtilityFunction mapRow(ResultSet row, int rowNum) throws SQLException {
    TimeUtilityFunction tuf= new TimeUtilityFunction();
    tuf.timeUtilityFunctionId= row.getLong("time_utility_function_id");
    tuf.creationTime = row.getLong("creation_time");
    tuf.creatorUserId = row.getLong("creator_user_id");
    return tuf;
  }
}
