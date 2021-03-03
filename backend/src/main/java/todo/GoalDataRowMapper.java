
package todo;

import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;

public class GoalDataRowMapper implements RowMapper<GoalData> {
  @Override
  public GoalData mapRow(ResultSet row, int rowNum) throws SQLException {
    GoalData gd = new GoalData();
    gd.goalDataId = row.getLong("goal_data_id");
    gd.creationTime = row.getLong("creation_time");
    gd.creatorUserId = row.getLong("creator_user_id");
    gd.goalId = row.getLong("goal_id");
    gd.name = row.getString("name");
    gd.description = row.getString("description");
    gd.durationEstimate = row.getLong("duration_estimate");
    gd.timeUtilityFunctionId = row.getLong("time_utility_function_id");
    gd.scheduled = row.getBoolean("scheduled");
    gd.startTime = row.getLong("start_time");
    gd.duration = row.getLong("duration");
    gd.status = GoalDataStatusKind.from(row.getInt("status"));
    return gd;
  }
}
