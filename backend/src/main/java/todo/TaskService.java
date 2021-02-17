package todo;

import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@Repository
public class TaskService {

  @Autowired private JdbcTemplate jdbcTemplate;

  public Task getByTaskId(long taskId) {
    String sql =
        "SELECT * FROM task WHERE task_id=?";
    RowMapper<Task> rowMapper = new TaskRowMapper();
    Task task = jdbcTemplate.queryForObject(sql, rowMapper, taskId);
    return task;
  }

  public long nextId() {
    String sql = "SELECT max(t.task_id) FROM task t";
    Long maxId = jdbcTemplate.queryForObject(sql, Long.class);
    if(maxId == null) {
      return 0;
    } else {
      return maxId + 1;
    }
  }

  public void add(Task task) {
    task.taskId = nextId();
    // Add task
    String sql =
        "INSERT INTO task values (?, ?, ?, ?, ?, ?)";
    jdbcTemplate.update(
        sql,
        task.taskId,
        task.creationTime,
        task.creatorUserId,
        task.goalId,
        task.startTime,
        task.status.value
    );
  }

  public boolean existsByTaskId(long taskId) {
    String sql = "SELECT count(*) FROM task t WHERE t.task_id=?";
    int count = jdbcTemplate.queryForObject(sql, Integer.class, taskId);
    return count != 0;
  }

  // Restrict tasks by
  public Stream<Task> query(
      Long taskId,
      Long creationTime,
      Long minCreationTime,
      Long maxCreationTime,
      Long creatorUserId,
      Long goalId,
      Long startTime,
      Long minStartTime,
      Long maxStartTime,
      TaskStatusKind status,
      boolean onlyRecent,
      Long duration,
      Long minDuration,
      Long maxDuration,
      long offset,
      long count) {


    boolean joingoal = duration != null || minDuration != null || maxDuration != null;

    String sql =
        "SELECT t.* FROM task t"
            + (!onlyRecent ? "" : " INNER JOIN (SELECT max(task_id) id FROM task GROUP BY goal_id) maxids ON maxids.id = t.task_id")
            + (!joingoal ?  "" : " INNER JOIN goal g ON t.goal_id = g.goal_id" )
            + " WHERE 1=1 "
            + (taskId             == null ? "" : " AND t.task_id = " + taskId)
            + (creationTime       == null ? "" : " AND t.creation_time = " + creationTime)
            + (minCreationTime    == null ? "" : " AND t.creation_time > " + minCreationTime)
            + (maxCreationTime    == null ? "" : " AND t.creation_time < " + maxCreationTime)
            + (creatorUserId      == null ? "" : " AND t.creator_id = " + creatorUserId)
            + (goalId             == null ? "" : " AND t.goal_id = " + goalId)
            + (startTime          == null ? "" : " AND t.start_time= " + startTime)
            + (minStartTime       == null ? "" : " AND t.start_time> " + minStartTime)
            + (maxStartTime       == null ? "" : " AND t.start_time< " + maxStartTime)
            + (status             == null ? "" : " AND t.status = " + status.value)
            + (duration           == null ? "" : " AND g.duration = " + duration)
            + (minDuration        == null ? "" : " AND g.duration> " + minDuration)
            + (maxDuration        == null ? "" : " AND g.duration < " + maxDuration)
            + (" ORDER BY t.task_id")
            + (" LIMIT " + offset + ", " + count)
            + ";";

    RowMapper<Task> rowMapper = new TaskRowMapper();
    return this.jdbcTemplate.query(sql, rowMapper).stream();
  }
}
