
package todo;

import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;

public class TaskRowMapper implements RowMapper<Task> {
  @Override 
  public Task mapRow(ResultSet row, int rowNum) throws SQLException {
    Task task = new Task();
    task.taskId= row.getLong("task_id");
    task.creationTime = row.getLong("creation_time");
    task.creatorUserId = row.getLong("creator_user_id");
    task.goalId = row.getLong("goal_id");
    task.startTime = row.getLong("start_time");
    task.status= TaskStatusKind.from(row.getInt("status"));
    return task ;
  }
}

