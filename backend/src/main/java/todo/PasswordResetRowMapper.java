
package todo;

import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;

public class PasswordResetRowMapper implements RowMapper<PasswordReset> {

  @Override
  public PasswordReset mapRow(ResultSet row, int rowNum) throws SQLException {
    PasswordReset ps = new PasswordReset();
    ps.passwordResetKeyHash = row.getString("password_reset_key_hash");
    ps.creationTime = row.getLong("creation_time");
    ps.creatorUserId= row.getLong("creator_user_id");
    return ps;
  }
}
