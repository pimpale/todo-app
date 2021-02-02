package todo;

import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;

public class PasswordRowMapper implements RowMapper<Password> {

  @Override
  public Password mapRow(ResultSet row, int rowNum) throws SQLException {
    Password ps = new Password();
    ps.passwordId= row.getLong("password_id");
    ps.creationTime = row.getLong("creation_time");
    ps.creatorUserId = row.getLong("creator_user_id");
    ps.userId = row.getLong("user_id");
    ps.passwordKind = PasswordKind.from(row.getInt("password_kind"));
    ps.passwordHash = row.getString("password_hash");
    ps.passwordResetKeyHash = row.getString("password_reset_key_hash");
    return ps;
  }
}
