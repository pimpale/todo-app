package todo;

import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;

public class GoalResultRowMapper implements RowMapper<GoalResult> {
  @Override
  public GoalResult mapRow(ResultSet row, int rowNum) throws SQLException {
    GoalResult gd = new GoalResult();
    gd.goalResultId = row.getLong("goal_result_id");
    gd.creationTime = row.getLong("creation_time");
    gd.creatorUserId = row.getLong("creator_user_id");
    gd.goalId = row.getLong("goal_id");
    gd.notes = row.getString("notes");
    gd.status = GoalResultKind.from(row.getInt("status"));
    return gd;
  }
}
