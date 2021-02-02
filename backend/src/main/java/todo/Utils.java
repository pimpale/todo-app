package todo;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.ZoneId;
import java.util.Base64;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.security.SecureRandom;

public class Utils {

  public static final ZoneId TIMEZONE = ZoneId.of("America/Los_Angeles");

  // note that we use bcrypt for passwords
  static final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
  static final Base64.Encoder base64Encoder = Base64.getUrlEncoder();
  static final Base64.Decoder base64Decoder = Base64.getUrlDecoder();
  static final SecureRandom randomGenerator = new SecureRandom();

  static MessageDigest getDigester() {
    try {
      return MessageDigest.getInstance("SHA-256");
    } catch (NoSuchAlgorithmException e) {
      e.printStackTrace();
      return null;
    }
  }

  public static String encodePassword(String password) {
    return passwordEncoder.encode(password);
  }

  public static boolean matchesPassword(String password, String hash) {
    return passwordEncoder.matches(password, hash);
  }

  public static String hashGeneratedKey(String key) {
    return base64Encoder.encodeToString(getDigester().digest(key.getBytes()));
  }

  public static boolean matchesHashedGenKey(String key, String hash) {
    return hash.equals(hashGeneratedKey(key));
  }

  // create 128 bit key
  public static String generateKey() {
    byte[] keyBytes = new byte[32];
    randomGenerator.nextBytes(keyBytes);
    return base64Encoder.encodeToString(keyBytes);
  }

  public static boolean isEmpty(String str) {
    return str == null || str == "";
  }

  public static String toSQLString(Enum<?> e) {
    return escape(e.name());
  }

  public static String escape(String str) {
    return "\'" + escapeSQLString(str) + "\'";
  }

  public static String escapeSQLString(String str) {
    return str.replaceAll("\'", "\'\'");
  }

  public static String unEscapeSQLString(String str) {
    return str.replaceAll("\'\'", "\'");
  }

  public static boolean securePassword(String password) {
    if (password.length() < 8) {
      return false;
    }
    int digits = 0;
    for (int i = 0; i < password.length(); i++) {
      if (Character.isDigit(password.charAt(i))) {
        digits++;
      }
    }

    if (digits == 0) {
      return false;
    }

    return true;
  }

}
