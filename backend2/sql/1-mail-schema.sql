CREATE DATABASE mail;
\c mail

drop table if exists mail;
create table mail(
  mail_id bigserial primary key,
  request_id bigint not null,
  creation_time bigint not null,
  topic text not null,
  destination text not null,
  title text not null,
  content text not null
);

