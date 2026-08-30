-- Posts now render via LinkedIn's embed widget instead of manually-entered
-- fields, so author_name/post_text are no longer populated on insert.
alter table posts alter column author_name drop not null;
alter table posts alter column post_text drop not null;
