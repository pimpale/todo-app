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
public class EventService {

  @Autowired private JdbcTemplate jdbcTemplate;

  public Event getByEventId(long eventId) {
    String sql =
        "SELECT * FROM event WHERE event_id=?";
    RowMapper<Event> rowMapper = new EventRowMapper();
    List<Event> events = jdbcTemplate.query(sql, rowMapper, eventId);
    return events.size() > 0 ? events.get(0) : null;
  }

  public long nextId() {
    String sql = "SELECT max(event_id) FROM event";
    Long maxId = jdbcTemplate.queryForObject(sql, Long.class);
    if(maxId == null) {
      return 0;
    } else {
      return maxId + 1;
    }
  }

  public void add(Event event) {
    // Set event id
    event.eventId = nextId();
    event.creationTime = System.currentTimeMillis();
    // Add event
    String sql =
        "INSERT INTO event values (?, ?, ?)";
    jdbcTemplate.update(
        sql,
        event.eventId,
        event.creationTime,
	event.creatorUserId);
  }

  public Stream<Event> query(
      Long id,
      Long creationTime,
      Long minCreationTime,
      Long maxCreationTime,
      Long creatorUserId,
      long offset,
      long count) {
    String sql = "SELECT g.* FROM event g"
      + " WHERE 1=1 "
      + (id                == null ? "" : " AND g.event_id = " + id)
      + (creationTime      == null ? "" : " AND g.creation_time = " + creationTime)
      + (minCreationTime   == null ? "" : " AND g.creation_time > " + minCreationTime)
      + (maxCreationTime   == null ? "" : " AND g.creation_time < " + maxCreationTime)
      + (creatorUserId     == null ? "" : " AND g.creator_user_id = " + creatorUserId)
      + (" ORDER BY g.event_id")
      + (" LIMIT " + offset + ", " + count)
      + ";";

    RowMapper<Event> rowMapper = new EventRowMapper();
    return this.jdbcTemplate.query(sql, rowMapper).stream();
  }
}
