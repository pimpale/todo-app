INSERT INTO verification_challenge VALUES(
  '1', -- verification_challenge_key_hash 
  1, -- creation_time
  'BOB JOHNSON', -- name
  'bob@example.com', -- email
  '$2a$10$kteCMggOjaT1lJWybiFwMewtFvec7QB35lo6Rjk7IjNJFVJBoyDQ.' -- password_hash
);
INSERT INTO user VALUES(
  1, -- user_id
  1, -- creation_time
  'BOB JOHNSON', --name
  'bob@example.com', -- email
  '1' -- verification_challenge_key_hash
);
INSERT INTO password VALUES(
  1, -- password_id
  1, -- creation_time
  1, -- creator_user_id
  1, -- user_id
  0, -- password_kind
  '$2a$10$kteCMggOjaT1lJWybiFwMewtFvec7QB35lo6Rjk7IjNJFVJBoyDQ.', -- password_hash
  '' -- password_reset_key_hash
);
INSERT INTO verification_challenge VALUES(
  '2', -- verification_challenge_key_hash 
  1, -- creation_time
  'SARAH DOE', -- name
  'sarah@example.com', -- email
  '$2a$10$kteCMggOjaT1lJWybiFwMewtFvec7QB35lo6Rjk7IjNJFVJBoyDQ.' -- password_hash
);
INSERT INTO user VALUES(
  2, -- user_id
  1, -- creation_time
  'SARAH DOE', --name
  'sarah@example.com', -- email
  '2' -- verification_challenge_key_hash
);
INSERT INTO password VALUES(
  2, -- password_id
  1, -- creation_time
  2, -- creator_user_id
  2, -- user_id
  0, -- password_kind
  '$2a$10$kteCMggOjaT1lJWybiFwMewtFvec7QB35lo6Rjk7IjNJFVJBoyDQ.', -- password_hash
  '' -- password_reset_key_hash
);
INSERT INTO verification_challenge VALUES(
  '3', -- verification_challenge_key_hash 
  1, -- creation_time
  'JOE SMITH', -- name
  'joe@example.com', -- email
  '$2a$10$kteCMggOjaT1lJWybiFwMewtFvec7QB35lo6Rjk7IjNJFVJBoyDQ.' -- password_hash
);
INSERT INTO user VALUES(
  3, -- user_id
  1, -- creation_time
  'JOE SMITH', --name
  'joe@example.com', -- email
  '3' -- verification_challenge_key_hash
);
INSERT INTO password VALUES(
  3, -- password_id
  1, -- creation_time
  3, -- creator_user_id
  3, -- user_id
  0, -- password_kind
  '$2a$10$kteCMggOjaT1lJWybiFwMewtFvec7QB35lo6Rjk7IjNJFVJBoyDQ.', -- password_hash
  '' -- password_reset_key_hash
);
INSERT INTO verification_challenge VALUES(
  '4', -- verification_challenge_key_hash 
  1, -- creation_time
  'ALICE BROWN', -- name
  'alice@example.com', -- email
  '$2a$10$kteCMggOjaT1lJWybiFwMewtFvec7QB35lo6Rjk7IjNJFVJBoyDQ.' -- password_hash
);
INSERT INTO user VALUES(
  4, -- user_id
  1, -- creation_time
  'ALICE BROWN', --name
  'alice@example.com', -- email
  '4' -- verification_challenge_key_hash
);
INSERT INTO password VALUES(
  4, -- password_id
  1, -- creation_time
  4, -- creator_user_id
  4, -- user_id
  0, -- password_kind
  '$2a$10$kteCMggOjaT1lJWybiFwMewtFvec7QB35lo6Rjk7IjNJFVJBoyDQ.', -- password_hash
  '' -- password_reset_key_hash
);
INSERT INTO verification_challenge VALUES(
  '5', -- verification_challenge_key_hash 
  1, -- creation_time
  'BILLY FLETCHER', -- name
  'billy@example.com', -- email
  '$2a$10$kteCMggOjaT1lJWybiFwMewtFvec7QB35lo6Rjk7IjNJFVJBoyDQ.' -- password_hash
);
INSERT INTO user VALUES(
  5, -- user_id
  1, -- creation_time
  'BILLY FLETCHER', --name
  'billy@example.com', -- email
  '5' -- verification_challenge_key_hash
);
INSERT INTO password VALUES(
  5, -- password_id
  1, -- creation_time
  5, -- creator_user_id
  5, -- user_id
  0, -- password_kind
  '$2a$10$kteCMggOjaT1lJWybiFwMewtFvec7QB35lo6Rjk7IjNJFVJBoyDQ.', -- password_hash
  '' -- password_reset_key_hash
);
INSERT INTO verification_challenge VALUES(
  '6', -- verification_challenge_key_hash 
  1, -- creation_time
  'CARSON WILSON', -- name
  'carson@example.com', -- email
  '$2a$10$kteCMggOjaT1lJWybiFwMewtFvec7QB35lo6Rjk7IjNJFVJBoyDQ.' -- password_hash
);
INSERT INTO user VALUES(
  6, -- user_id
  1, -- creation_time
  'CARSON WILSON', --name
  'carson@example.com', -- email
  '6' -- verification_challenge_key_hash
);
INSERT INTO password VALUES(
  6, -- password_id
  1, -- creation_time
  6, -- creator_user_id
  6, -- user_id
  0, -- password_kind
  '$2a$10$kteCMggOjaT1lJWybiFwMewtFvec7QB35lo6Rjk7IjNJFVJBoyDQ.', -- password_hash
  '' -- password_reset_key_hash
);
INSERT INTO verification_challenge VALUES(
  '7', -- verification_challenge_key_hash 
  1, -- creation_time
  'GEORGE OHARE', -- name
  'george@example.com', -- email
  '$2a$10$kteCMggOjaT1lJWybiFwMewtFvec7QB35lo6Rjk7IjNJFVJBoyDQ.' -- password_hash
);
INSERT INTO user VALUES(
  7, -- user_id
  1, -- creation_time
  'GEORGE OHARE', --name
  'george@example.com', -- email
  '7' -- verification_challenge_key_hash
);
INSERT INTO password VALUES(
  7, -- password_id
  1, -- creation_time
  7, -- creator_user_id
  7, -- user_id
  0, -- password_kind
  '$2a$10$kteCMggOjaT1lJWybiFwMewtFvec7QB35lo6Rjk7IjNJFVJBoyDQ.', -- password_hash
  '' -- password_reset_key_hash
);
INSERT INTO verification_challenge VALUES(
  '8', -- verification_challenge_key_hash 
  1, -- creation_time
  'WILLIAM DOE', -- name
  'william@example.com', -- email
  '$2a$10$kteCMggOjaT1lJWybiFwMewtFvec7QB35lo6Rjk7IjNJFVJBoyDQ.' -- password_hash
);
INSERT INTO user VALUES(
  8, -- user_id
  1, -- creation_time
  'WILLIAM DOE', --name
  'william@example.com', -- email
  '8' -- verification_challenge_key_hash
);
INSERT INTO password VALUES(
  8, -- password_id
  1, -- creation_time
  8, -- creator_user_id
  8, -- user_id
  0, -- password_kind
  '$2a$10$kteCMggOjaT1lJWybiFwMewtFvec7QB35lo6Rjk7IjNJFVJBoyDQ.', -- password_hash
  '' -- password_reset_key_hash
);
INSERT INTO verification_challenge VALUES(
  '9', -- verification_challenge_key_hash 
  1, -- creation_time
  'ROBERT MCPHILLIP', -- name
  'robert@example.com', -- email
  '$2a$10$kteCMggOjaT1lJWybiFwMewtFvec7QB35lo6Rjk7IjNJFVJBoyDQ.' -- password_hash
);
INSERT INTO user VALUES(
  9, -- user_id
  1, -- creation_time
  'ROBERT MCPHILLIP', --name
  'robert@example.com', -- email
  '9' -- verification_challenge_key_hash
);
INSERT INTO password VALUES(
  9, -- password_id
  1, -- creation_time
  9, -- creator_user_id
  9, -- user_id
  0, -- password_kind
  '$2a$10$kteCMggOjaT1lJWybiFwMewtFvec7QB35lo6Rjk7IjNJFVJBoyDQ.', -- password_hash
  '' -- password_reset_key_hash
);
