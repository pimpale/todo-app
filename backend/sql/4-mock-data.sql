-- users:
-- user: alpha@example.com 
-- pass: Boolean500

-- user: beta@example.com 
-- pass: Boolean500

-- user: gamma@example.com 
-- pass: Boolean500

\c auth

INSERT INTO user_t(
  creation_time
) VALUES
(1),
(1),
(1);

INSERT INTO user_data_t(
  creation_time,
  creator_user_id,
  name
) VALUES
(1, 1, 'alpha'),
(1, 2, 'beta'),
(1, 3, 'gamma');

INSERT INTO verification_challenge_t(
  verification_challenge_key_hash,
  creation_time,
  creator_user_id,
  to_parent,
  email
) VALUES
('1', 1, 1, FALSE, 'alpha@example.com'),
('2', 1, 2, FALSE, 'beta@example.com'),
('3', 1, 3, FALSE, 'gamma@example.com');

INSERT INTO email_t(
  creation_time,
  creator_user_id,
  verification_challenge_key_hash
) VALUES
(1, 1, '1'),
(1, 2, '2'),
(1, 3, '3');

INSERT INTO parent_permission_t(
  creation_time,
  user_id,
  verification_challenge_key_hash
) VALUES
(1, 1, NULL),
(1, 2, NULL),
(1, 3, NULL);

INSERT INTO password_t(
  creation_time,
  creator_user_id,
  password_hash,
  password_reset_key_hash 
) VALUES
(1, 1, '$argon2i$v=19$m=4096,t=3,p=1$5adHUIBVgN/rdrCqK7vsBSS2Sz3IE/ChUVDlIExETsM$fVbg3KYf8Dd5LGBsfH5L1rTV0Xwv4C4wADmexT9uc1w', NULL),
(1, 2, '$argon2i$v=19$m=4096,t=3,p=1$5adHUIBVgN/rdrCqK7vsBSS2Sz3IE/ChUVDlIExETsM$fVbg3KYf8Dd5LGBsfH5L1rTV0Xwv4C4wADmexT9uc1w', NULL),
(1, 3, '$argon2i$v=19$m=4096,t=3,p=1$5adHUIBVgN/rdrCqK7vsBSS2Sz3IE/ChUVDlIExETsM$fVbg3KYf8Dd5LGBsfH5L1rTV0Xwv4C4wADmexT9uc1w', NULL);

