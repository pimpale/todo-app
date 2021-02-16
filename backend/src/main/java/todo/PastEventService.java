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
public class PastEventService {

  @Autowired private JdbcTemplate jdbcTemplate;

  public PastEvent getByPastEventId(long pastEventId) {
    String sql =
        "SELECT * FROM past_event WHERE past_event_id=?";
    RowMapper<PastEvent> rowMapper = new PastEventRowMapper();
    List<PastEvent> pastEvents = jdbcTemplate.query(sql, rowMapper, pastEventId);
    return pastEvents.size() > 0 ? pastEvents.get(0) : null;
  }

  public long nextId() {
    String sql = "SELECT max(past_event_id) FROM past_event";
    Long maxId = jdbcTemplate.queryForObject(sql, Long.class);
    if(maxId == null) {
      return 0;
    } else {
      return maxId + 1;
    }
  }

  public void add(PastEvent pastEvent) {
    // Set pastEvent id
    pastEvent.pastEventId = nextId();
    pastEvent.creationTime = System.currentTimeMillis();
    // Add pastEvent
    String sql =
        "INSERT INTO past_event values (?, ?, ?)";
    jdbcTemplate.update(
        sql,
        pastEvent.pastEventId,
        pastEvent.creationTime,
        pastEvent.creatorUserId);
  }

  public Stream<PastEvent> query(
      Long id,
      Long creationTime,
      Long minCreationTime,
      Long maxCreationTime,
      Long creatorUserId,
      long offset,
      long count) {
    String sql = "SELECT pe.* FROM past_event pe"
      + " WHERE 1=1 "
      + (id                == null ? "" : " AND pe.past_event_id= " + id)
      + (creationTime      == null ? "" : " AND pe.creation_time = " + creationTime)
      + (minCreationTime   == null ? "" : " AND pe.creation_time > " + minCreationTime)
      + (maxCreationTime   == null ? "" : " AND pe.creation_time < " + maxCreationTime)
      + (creatorUserId     == null ? "" : " AND pe.creator_user_id = " + creatorUserId)
      + (" ORDER BY pe.past_event_id")
      + (" LIMIT " + offset + ", " + count)
      + ";";

    RowMapper<PastEvent> rowMapper = new PastEventRowMapper();
    return this.jdbcTemplate.query(sql, rowMapper).stream();
  }
}
