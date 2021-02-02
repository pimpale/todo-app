package todo;

import java.sql.ResultSet;
import java.sql.SQLException;
import org.springframework.jdbc.core.RowMapper;

public class SubscriptionRowMapper implements RowMapper<Subscription> {

  @Override
  public Subscription mapRow(ResultSet row, int rowNum) throws SQLException {
    Subscription subscription = new Subscription();
    subscription.subscriptionId = row.getLong("subscription_id");
    subscription.creationTime = row.getLong("creation_time");
    subscription.creatorUserId = row.getLong("creator_user_id");
    subscription.subscriptionKind = SubscriptionKind.from(row.getInt("subscription_kind"));
    subscription.maxUses = row.getLong("max_uses");
    return subscription;
  }
}
