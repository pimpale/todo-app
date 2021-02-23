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
public class TimeUtilityFunctionService {

  @Autowired private JdbcTemplate jdbcTemplate;

  public TimeUtilityFunction getByTimeUtilityFunctionId(long timeUtilityFunctionId) {
    String sql =
        "SELECT * FROM time_utility_function WHERE time_utility_function_id=?";
    RowMapper<TimeUtilityFunction> rowMapper = new TimeUtilityFunctionRowMapper();
    List<TimeUtilityFunction> timeUtilityFunctions = jdbcTemplate.query(sql, rowMapper, timeUtilityFunctionId);
    return timeUtilityFunctions.size() > 0 ? timeUtilityFunctions.get(0) : null;
  }

  public long nextId() {
    String sql = "SELECT max(time_utility_function_id) FROM time_utility_function";
    Long maxId = jdbcTemplate.queryForObject(sql, Long.class);
    if(maxId == null) {
      return 0;
    } else {
      return maxId + 1;
    }
  }

  public void add(TimeUtilityFunction timeUtilityFunction) {
    // Set timeUtilityFunction id
    timeUtilityFunction.timeUtilityFunctionId = nextId();
    timeUtilityFunction.creationTime = System.currentTimeMillis();
    // Add timeUtilityFunction
    String sql =
        "INSERT INTO time_utility_function values (?, ?, ?)";
    jdbcTemplate.update(
        sql,
        timeUtilityFunction.timeUtilityFunctionId,
        timeUtilityFunction.creationTime,
        timeUtilityFunction.creatorUserId);
  }

  public Stream<TimeUtilityFunction> query(
      Long id,
      Long creationTime,
      Long minCreationTime,
      Long maxCreationTime,
      Long creatorUserId,
      long offset,
      long count) {
    String sql = "SELECT tuf.* FROM time_utility_function tuf"
      + " WHERE 1=1 "
      + (id                == null ? "" : " AND tuf.time_utility_function_id = " + id)
      + (creationTime      == null ? "" : " AND tuf.creation_time = " + creationTime)
      + (minCreationTime   == null ? "" : " AND tuf.creation_time > " + minCreationTime)
      + (maxCreationTime   == null ? "" : " AND tuf.creation_time < " + maxCreationTime)
      + (creatorUserId     == null ? "" : " AND tuf.creator_user_id = " + creatorUserId)
      + (" ORDER BY tuf.time_utility_function_id")
      + (" LIMIT " + offset + ", " + count)
      + ";";

    RowMapper<TimeUtilityFunction> rowMapper = new TimeUtilityFunctionRowMapper();
    return this.jdbcTemplate.query(sql, rowMapper).stream();
  }
}
