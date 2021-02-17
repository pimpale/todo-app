package todo;

import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@Repository
public class PastEventDataService {

  @Autowired private JdbcTemplate jdbcTemplate;

  public PastEventData getByPastEventDataId(long pastEventDataId) {
    String sql =
        "SELECT * FROM past_event_data WHERE past_event_data_id=?";
    RowMapper<PastEventData> rowMapper = new PastEventDataRowMapper();
    PastEventData pastEventData = jdbcTemplate.queryForObject(sql, rowMapper, pastEventDataId);
    return pastEventData;
  }

  public long nextId() {
    String sql = "SELECT max(ped.past_event_data_id) FROM past_event_data ped";
    Long maxId = jdbcTemplate.queryForObject(sql, Long.class);
    if(maxId == null) {
      return 0;
    } else {
      return maxId + 1;
    }
  }

  public void add(PastEventData pastEventData) {
    pastEventData.pastEventDataId = nextId();
    // Add pastEventData
    String sql =
        "INSERT INTO past_event_data values (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    jdbcTemplate.update(
        sql,
        pastEventData.pastEventDataId,
        pastEventData.creationTime,
        pastEventData.creatorUserId,
        pastEventData.pastEventId,
        pastEventData.name,
        pastEventData.description,
        pastEventData.startTime,
        pastEventData.duration,
        pastEventData.active
    );
  }

  public boolean existsByPastEventDataId(long pastEventDataId) {
    String sql = "SELECT count(*) FROM past_event_data ped WHERE ped.past_event_data_id=?";
    int count = jdbcTemplate.queryForObject(sql, Integer.class, pastEventDataId);
    return count != 0;
  }

  // Restrict pastEventDatas by
  public Stream<PastEventData> query(
      Long pastEventDataId,
      Long creationTime,
      Long minCreationTime,
      Long maxCreationTime,
      Long creatorUserId,
      Long pastEventId,
      String name,
      String partialName,
      String description,
      String partialDescription,
      Long startTime,
      Long minStartTime,
      Long maxStartTime,
      Long duration,
      Long minDuration,
      Long maxDuration,
      Boolean active,
      boolean onlyRecent,
      long offset,
      long count) {

    String sql =
        "SELECT ped.* FROM past_event_data ped"
            + (!onlyRecent ? "" : " INNER JOIN (SELECT max(past_event_data_id) id FROM past_event_data GROUP BY past_event_id) maxids ON maxids.id = ped.past_event_data_id")
            + " WHERE 1=1 "
            + (pastEventDataId      == null ? "" : " AND ped.past_event_data_id = " + pastEventDataId)
            + (creationTime         == null ? "" : " AND ped.creation_time = " + creationTime)
            + (minCreationTime      == null ? "" : " AND ped.creation_time > " + minCreationTime)
            + (maxCreationTime      == null ? "" : " AND ped.creation_time < " + maxCreationTime)
            + (creatorUserId        == null ? "" : " AND ped.creator_id = " + creatorUserId)
            + (pastEventId          == null ? "" : " AND ped.past_event_id = " + pastEventId)
            + (name                 == null ? "" : " AND ped.name = " + Utils.escape(name))
            + (partialName          == null ? "" : " AND ped.name LIKE " + Utils.escape("%"+partialName+"%"))
            + (description          == null ? "" : " AND ped.description = " + Utils.escape(description))
            + (partialDescription   == null ? "" : " AND ped.description LIKE " + Utils.escape("%"+partialDescription+"%"))
            + (startTime            == null ? "" : " AND ped.start_time = " + startTime)
            + (minStartTime         == null ? "" : " AND ped.start_time > " + minStartTime)
            + (maxStartTime         == null ? "" : " AND ped.start_time < " + maxStartTime)
            + (duration             == null ? "" : " AND ped.duration = " + duration)
            + (minDuration          == null ? "" : " AND ped.duration > " + minDuration)
            + (maxDuration          == null ? "" : " AND ped.duration < " + maxDuration)
            + (active               == null ? "" : " AND ped.active = " + active)
            + (" ORDER BY ped.past_event_data_id")
            + (" LIMIT " + offset + ", " + count)
            + ";";

    RowMapper<PastEventData> rowMapper = new PastEventDataRowMapper();
    return this.jdbcTemplate.query(sql, rowMapper).stream();
  }
}
