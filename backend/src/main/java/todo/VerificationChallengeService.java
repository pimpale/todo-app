package todo;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@Repository
public class VerificationChallengeService {

  @Autowired
  private JdbcTemplate jdbcTemplate;

  public List<VerificationChallenge> getAll() {
    String sql =
        "SELECT * FROM verification_challenge";
    RowMapper<VerificationChallenge> rowMapper = new VerificationChallengeRowMapper();
    return jdbcTemplate.query(sql, rowMapper);
  }

  public void add(VerificationChallenge verificationChallenge) {
    // Add user
    verificationChallenge.creationTime = System.currentTimeMillis();
    String sql =
        "INSERT INTO verification_challenge values (?, ?, ?, ?, ?)";
    jdbcTemplate.update(
        sql,
        verificationChallenge.verificationChallengeKeyHash,
        verificationChallenge.creationTime,
        verificationChallenge.name,
        verificationChallenge.email,
        verificationChallenge.passwordHash);
  }

  public VerificationChallenge getByVerificationChallengeKeyHash(String verificationChallengeKeyHash) {
    String sql =
        "SELECT * FROM verification_challenge WHERE verification_challenge_key_hash=? ORDER BY creation_time DESC";
    RowMapper<VerificationChallenge> rowMapper = new VerificationChallengeRowMapper();
    List<VerificationChallenge> verificationChallenges = jdbcTemplate.query(sql, rowMapper, verificationChallengeKeyHash);
    return verificationChallenges.size() > 0 ? verificationChallenges.get(0) : null;
  }

  public Long getLastCreationTimeByEmail(String email) {
    String sql =  "SELECT max(creation_time) FROM verification_challenge WHERE email=?";
    Long creationTime = jdbcTemplate.queryForObject(sql, Long.class, email);
    return creationTime;
  }

  public boolean existsByEmail(String email) {
    String sql = "SELECT count(*) FROM verification_challenge WHERE email=?";
    long count = jdbcTemplate.queryForObject(sql, Long.class, email);
    return count != 0;
  }
}
