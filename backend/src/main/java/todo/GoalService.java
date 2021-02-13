package todo;

import java.util.List;
import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@Repository
public class GoalService {

  @Autowired private JdbcTemplate jdbcTemplate;

  public Goal getByGoalId(long goalId) {
    String sql =
        "SELECT * FROM goal WHERE goal_id=?";
    RowMapper<Goal> rowMapper = new GoalRowMapper();
    List<Goal> goals = jdbcTemplate.query(sql, rowMapper, goalId);
    return goals.size() > 0 ? goals.get(0) : null;
  }

  public long nextId() {
    String sql = "SELECT max(goal_id) FROM goal";
    Long maxId = jdbcTemplate.queryForObject(sql, Long.class);
    if(maxId == null) {
      return 0;
    } else {
      return maxId + 1;
    }
  }

  public void add(Goal goal) {
    // Set goal id
    goal.goalId = nextId();
    goal.creationTime = System.currentTimeMillis();
    // Add goal
    String sql =
        "INSERT INTO goal values (?, ?, ?)";
    jdbcTemplate.update(
        sql,
        goal.goalId,
        goal.creationTime,
	goal.creatorUserId);
  }

  public Stream<Goal> query(
      Long id,
      Long creationTime,
      Long minCreationTime,
      Long maxCreationTime,
      Long creatorUserId,
      long offset,
      long count) {
    String sql = "SELECT g.* FROM goal g"
      + " WHERE 1=1 "
      + (id                == null ? "" : " AND g.goal_id = " + id)
      + (creationTime      == null ? "" : " AND g.creation_time = " + creationTime)
      + (minCreationTime   == null ? "" : " AND g.creation_time > " + minCreationTime)
      + (maxCreationTime   == null ? "" : " AND g.creation_time < " + maxCreationTime)
      + (creatorUserId     == null ? "" : " AND g.creator_user_id = " + creatorUserId)
      + (" ORDER BY g.goal_id")
      + (" LIMIT " + offset + ", " + count)
      + ";";

    RowMapper<Goal> rowMapper = new GoalRowMapper();
    return this.jdbcTemplate.query(sql, rowMapper).stream();
  }
}
