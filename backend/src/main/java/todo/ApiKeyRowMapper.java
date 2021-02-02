package todo;

import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;

public class ApiKeyRowMapper implements RowMapper<ApiKey> {
  @Override
  public ApiKey mapRow(ResultSet row, int rowNum) throws SQLException {
    ApiKey apiKey = new ApiKey();
    apiKey.apiKeyId = row.getLong("api_key_id");
    apiKey.creationTime = row.getLong("creation_time");
    apiKey.creatorUserId = row.getLong("creator_user_id");
    apiKey.apiKeyHash = row.getString("api_key_hash");
    apiKey.duration= row.getLong("duration");
    apiKey.apiKeyKind = ApiKeyKind.from(row.getInt("api_key_kind"));
    return apiKey;
  }
}
