package todo;

import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;

public class TimeUtilityFunctionPointRowMapper implements RowMapper<TimeUtilityFunctionPoint> {
  @Override 
  public TimeUtilityFunctionPoint mapRow(ResultSet row, int rowNum) throws SQLException {
    TimeUtilityFunctionPoint tufp = new TimeUtilityFunctionPoint();
    tufp.timeUtilityFunctionPointId= row.getLong("time_utility_function_point_id");
    tufp.creationTime = row.getLong("creation_time");
    tufp.creatorUserId = row.getLong("creator_user_id");
    tufp.timeUtilityFunctionId = row.getLong("time_utility_function_id");
    tufp.startTime = row.getLong("start_time");
    tufp.utils = row.getLong("utils");
    return tufp;
  }
}
