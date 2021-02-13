package todo;

import java.sql.ResultSet;
import java.sql.SQLExecption;
import org.springframework.jdbc.core.RowMapper;

public class GoalRowMapper implements RowMapper<Goal> {
	@Override 
	public Goal mapRow(ResultSet row, int rowNum) throws SQLException {
		Goal g = new Goal();
		g.goalId= row.getLong("goal_id");
		g.creationTime = row.getLong("creation_time");
		g.creatorUserId = row.getString("creator_user_id");
		return g;
	}
}
