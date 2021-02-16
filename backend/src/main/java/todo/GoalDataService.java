package todo;

import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@Repository
public class GoalDataService {

  @Autowired private JdbcTemplate jdbcTemplate;

  public GoalData getByGoalDataId(long goalDataId) {
    String sql =
        "SELECT * FROM goal_data WHERE goal_data_id=?";
    RowMapper<GoalData> rowMapper = new GoalDataRowMapper();
    GoalData goalData = jdbcTemplate.queryForObject(sql, rowMapper, goalDataId);
    return goalData;
  }

  public long nextId() {
    String sql = "SELECT max(gd.goal_data_id) FROM goal_data gd";
    Long maxId = jdbcTemplate.queryForObject(sql, Long.class);
    if(maxId == null) {
      return 0;
    } else {
      return maxId + 1;
    }
  }

  public void add(GoalData goalData) {
    goalData.goalDataId = nextId();
    // Add goalData
    String sql =
        "INSERT INTO goal_data values (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    jdbcTemplate.update(
        sql,
        goalData.goalDataId,
        goalData.creationTime,
        goalData.creatorUserId,
        goalData.goalId,
        goalData.name,
        goalData.startTime,
        goalData.duration,
        goalData.hidden,
        goalData.active
    );
  }

  public boolean existsByGoalDataId(long goalDataId) {
    String sql = "SELECT count(*) FROM goal_data gd WHERE gd.goal_data_id=?";
    int count = jdbcTemplate.queryForObject(sql, Integer.class, goalDataId);
    return count != 0;
  }

  // Restrict goalDatas by
  public Stream<GoalData> query(
      Long goalDataId,
      Long creationTime,
      Long minCreationTime,
      Long maxCreationTime,
      Long creatorUserId,
      Long goalId,
      String name,
      String partialName,
      String description,
      String partialDescription,
      Long duration,
      Long minDuration,
      Long maxDuration,
      Boolean hidden,
      Boolean active,
      boolean onlyRecent,
      Long courseId,
      long offset,
      long count) {

    boolean nojoingoal = courseId == null;

    String sql =
        "SELECT gd.* FROM goal_data gd"
            + (!onlyRecent ? "" : " INNER JOIN (SELECT max(goal_data_id) id FROM goal_data GROUP BY goal_id) maxids ON maxids.id = gd.goal_data_id")
            + (nojoingoal ? "" : " INNER JOIN goal ses ON ses.goal_id = gd.goal_id")
            + " WHERE 1=1 "
            + (goalDataId   == null ? "" : " AND gd.goal_data_id = " + goalDataId)
            + (creationTime    == null ? "" : " AND gd.creation_time = " + creationTime)
            + (minCreationTime == null ? "" : " AND gd.creation_time > " + minCreationTime)
            + (maxCreationTime == null ? "" : " AND gd.creation_time < " + maxCreationTime)
            + (creatorUserId   == null ? "" : " AND gd.creator_id = " + creatorUserId)
            + (goalId       == null ? "" : " AND gd.goal_id = " + goalId)
            + (name            == null ? "" : " AND gd.name = " + Utils.escape(name))
            + (partialName     == null ? "" : " AND gd.name LIKE " + Utils.escape("%"+partialName+"%"))
            + (description            == null ? "" : " AND gd.description = " + Utils.escape(description))
            + (partialDescription     == null ? "" : " AND gd.description LIKE " + Utils.escape("%"+partialDescription+"%"))
            + (duration        == null ? "" : " AND gd.duration = " + duration)
            + (minDuration     == null ? "" : " AND gd.duration > " + minDuration)
            + (maxDuration     == null ? "" : " AND gd.duration < " + maxDuration)
            + (hidden          == null ? "" : " AND gd.hidden = " + hidden)
            + (active          == null ? "" : " AND gd.active = " + active)
            + (courseId        == null ? "" : " AND ses.course_id = " + courseId)
            + (" ORDER BY gd.goal_data_id")
            + (" LIMIT " + offset + ", " + count)
            + ";";

    RowMapper<GoalData> rowMapper = new GoalDataRowMapper();
    return this.jdbcTemplate.query(sql, rowMapper).stream();
  }
}
