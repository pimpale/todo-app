\c auth

-- users:
-- user: alpha@example.com 
-- pass: Boolean500

-- user: beta@example.com 
-- pass: Boolean500

-- user: gamma@example.com 
-- pass: Boolean500

\c auth

INSERT INTO verification_challenge(
  verification_challenge_key_hash,
  creation_time,
  name,
  email,
  password_hash
) VALUES
('1', 1, 'test', 'test_email', '1'),
('2', 2, 'test', 'test_email', '2'),
('3', 3, 'test', 'test_email', '3');

INSERT INTO user_t(
  creation_time,
  name,
  email,
  verification_challenge_key_hash
) VALUES
(1, 'alpha', 'alpha@example.com', '1'),
(1, 'beta',  'beta@example.com',  '2'),
(1, 'gamma', 'gamma@example.com', '3');

INSERT INTO password(
  creation_time,
  creator_user_id,
  password_kind,
  password_hash,
  password_reset_key_hash 
) VALUES
(1, 1, 0, '$argon2i$v=19$m=4096,t=3,p=1$5adHUIBVgN/rdrCqK7vsBSS2Sz3IE/ChUVDlIExETsM$fVbg3KYf8Dd5LGBsfH5L1rTV0Xwv4C4wADmexT9uc1w', ''),
(1, 2, 0, '$argon2i$v=19$m=4096,t=3,p=1$5adHUIBVgN/rdrCqK7vsBSS2Sz3IE/ChUVDlIExETsM$fVbg3KYf8Dd5LGBsfH5L1rTV0Xwv4C4wADmexT9uc1w', ''),
(1, 3, 0, '$argon2i$v=19$m=4096,t=3,p=1$5adHUIBVgN/rdrCqK7vsBSS2Sz3IE/ChUVDlIExETsM$fVbg3KYf8Dd5LGBsfH5L1rTV0Xwv4C4wADmexT9uc1w', '');
