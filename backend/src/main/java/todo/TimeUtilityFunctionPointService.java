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
public class TimeUtilityFunctionPointService {

  @Autowired private JdbcTemplate jdbcTemplate;

  public TimeUtilityFunctionPoint getByTimeUtilityFunctionPointId(long timeUtilityFunctionPointId) {
    String sql =
        "SELECT * FROM time_utility_function_point WHERE time_utility_function_point_id=?";
    RowMapper<TimeUtilityFunctionPoint> rowMapper = new TimeUtilityFunctionPointRowMapper();
    List<TimeUtilityFunctionPoint> timeUtilityFunctionPoints = jdbcTemplate.query(sql, rowMapper, timeUtilityFunctionPointId);
    return timeUtilityFunctionPoints.size() > 0 ? timeUtilityFunctionPoints.get(0) : null;
  }

  public long nextId() {
    String sql = "SELECT max(time_utility_function_point_id) FROM time_utility_function_point";
    Long maxId = jdbcTemplate.queryForObject(sql, Long.class);
    if(maxId == null) {
      return 0;
    } else {
      return maxId + 1;
    }
  }

  public void add(TimeUtilityFunctionPoint timeUtilityFunctionPoint) {
    // Set timeUtilityFunctionPoint id
    timeUtilityFunctionPoint.timeUtilityFunctionPointId = nextId();
    timeUtilityFunctionPoint.creationTime = System.currentTimeMillis();
    // Add timeUtilityFunctionPoint
    String sql =
        "INSERT INTO timeUtilityFunctionPoint values (?, ?, ?, ?, ?, ?, ?)";
    jdbcTemplate.update(
        sql,
        timeUtilityFunctionPoint.timeUtilityFunctionPointId,
        timeUtilityFunctionPoint.creationTime,
        timeUtilityFunctionPoint.creatorUserId,
        timeUtilityFunctionPoint.timeUtilityFunctionId,
        timeUtilityFunctionPoint.startTime,
        timeUtilityFunctionPoint.utils,
        timeUtilityFunctionPoint.active
    );
  }

  public Stream<TimeUtilityFunctionPoint> query(
      Long id,
      Long creationTime,
      Long minCreationTime,
      Long maxCreationTime,
      Long creatorUserId,
      Long timeUtilityFunctionId,
      Long startTime,
      Long minStartTime,
      Long maxStartTime,
      Long utils,
      Boolean active,
      long offset,
      long count) {
    String sql = "SELECT tufp.* FROM time_utility_function_point tufp"
      + " WHERE 1=1 "
      + (id                    == null ? "" : " AND tufp.time_utility_function_point_id = " + id)
      + (creationTime          == null ? "" : " AND tufp.creation_time = " + creationTime)
      + (minCreationTime       == null ? "" : " AND tufp.creation_time > " + minCreationTime)
      + (maxCreationTime       == null ? "" : " AND tufp.creation_time < " + maxCreationTime)
      + (creatorUserId         == null ? "" : " AND tufp.creator_user_id = " + creatorUserId)
      + (timeUtilityFunctionId == null ? "" : " AND tufp.time_utility_function_id = " + timeUtilityFunctionId)
      + (startTime             == null ? "" : " AND tufp.start_time = " + startTime)
      + (minStartTime          == null ? "" : " AND tufp.start_time > " + minStartTime)
      + (maxStartTime          == null ? "" : " AND tufp.start_time < " + maxStartTime)
      + (utils                 == null ? "" : " AND tufp.utils = " + utils)
      + (active                == null ? "" : " AND tufp.active = " + active)
      + (" ORDER BY tufp.time_utility_function_point_id")
      + (" LIMIT " + offset + ", " + count)
      + ";";

    RowMapper<TimeUtilityFunctionPoint> rowMapper = new TimeUtilityFunctionPointRowMapper();
    return this.jdbcTemplate.query(sql, rowMapper).stream();
  }
}
