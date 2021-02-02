package todo;

import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;

public class UserRowMapper implements RowMapper<User> {

  @Override
  public User mapRow(ResultSet row, int rowNum) throws SQLException {
    User u = new User();
    u.userId= row.getLong("user_id");
    u.creationTime = row.getLong("creation_time");
    u.name = row.getString("name");
    u.email = row.getString("email");
    u.verificationChallengeKeyHash = row.getString("verification_challenge_key_hash");
    return u;
  }
}
