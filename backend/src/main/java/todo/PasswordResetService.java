package todo;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@Repository
public class PasswordResetService {

  @Autowired
  private JdbcTemplate jdbcTemplate;

  public void add(PasswordReset user) {
    user.creationTime = System.currentTimeMillis();
    // Add user
    String sql =
        "INSERT INTO password_reset values (?, ?, ?)";
    jdbcTemplate.update(
        sql,
        user.passwordResetKeyHash,
        user.creationTime,
        user.creatorUserId);
  }

  public PasswordReset getByPasswordResetKeyHash(String resetKey) {
    String sql =
        "SELECT * FROM password_reset WHERE password_reset_key_hash=? ORDER BY creation_time DESC";
    RowMapper<PasswordReset> rowMapper = new PasswordResetRowMapper();
    List<PasswordReset> passwordResets  = jdbcTemplate.query(sql, rowMapper, resetKey);
    // return first element if found, otherwise none
    return passwordResets.size() > 0 ? passwordResets.get(0) : null;
  }

  public boolean existsByPasswordResetKeyHash(String resetKey) {
    String sql = "SELECT count(*) FROM password_reset WHERE password_reset_key_hash=?";
    long count = jdbcTemplate.queryForObject(sql, Long.class, resetKey);
    return count != 0;
  }
}
