package todo;

import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;

public class VerificationChallengeRowMapper implements RowMapper<VerificationChallenge> {

  @Override
  public VerificationChallenge mapRow(ResultSet row, int rowNum) throws SQLException {
    VerificationChallenge u = new VerificationChallenge();
    u.verificationChallengeKeyHash = row.getString("verification_challenge_key_hash");
    u.creationTime = row.getLong("creation_time");
    u.name = row.getString("name");
    u.email = row.getString("email");
    u.passwordHash = row.getString("password_hash");
    return u;
  }
}
