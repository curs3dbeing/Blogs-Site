create type roles as enum ('Admin', 'User', 'Moderator');
create domain email as text check(value ~* '^[a-zA-Z0-9]{3,}@(gmail|mail|rumbler|yandex|outlook).[a-z]{2,3}$');
create domain url as text check(value ~* '^https:\W{2}[a-zA-z]*.(com|net|ru|by)(\W[a-zA-Z0-9]*)*$');

create table Users(
id uuid primary key,
login varchar(30) not null,
password varchar(255) not null,
role roles not null,
email email not null unique,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
LastModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
disabled bool default FALSE);

alter table comment_post
drop constraint fk_post

alter table comment_post
add constraint fk_post
foreign key (post_id)
references posts(post_id)
on delete cascade;

alter table comment_post
add constraint fk_comment
foreign key (comment_id)
references comments(comment_id)
on delete cascade;

alter table post_user_reaction
drop constraint fk_user;

alter table post_user_reaction
add constraint fk_postid
foreign key (post_id)
references posts(post_id)
on delete cascade;

alter table post_user_reaction
add constraint fk_reactionid
foreign key (reaction_id)
references reactions(reaction_id)
on delete cascade;

alter table post_user_reaction
add constraint fk_user
foreign key (user_id)
references users(id)
on delete cascade;

alter table posts_tags
drop constraint fk_tagid;

alter table posts_tags
add constraint fk_postid
foreign key(post_id)
references posts(post_id)
on delete cascade;

alter table posts_tags
add constraint fk_tagid
foreign key (tag_id)
references tags(tag_id)
on delete cascade;

alter table user_post
drop constraint fk_userid;

alter table user_post
add constraint fk_postid
foreign key (idp)
references posts(post_id)
on delete cascade;

alter table user_post
add constraint fk_userid
foreign key (idu)
references users(id)
on delete cascade;

alter table users
add column about text;

create table users_log(
id uuid,
login varchar(30) not null,
password varchar(255) not null,
role roles not null,
email email not null,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
modification_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
disabled bool default TRUE
);

--updates logger on users
-----------------------------------------------------------------------
create or replace function update_users_logger()
returns trigger as $$
begin
	insert into users_log(id,login,password,role,email,created_at,modification_time,disabled) 
	select new.id,new.login,new.password,new.role,new.email,new.created_at,CURRENT_TIMESTAMP,new.disabled from users
	where id = old.id;
	
	--update users
	--set LastModified=CURRENT_TIMESTAMP
	--where id=old.id;
	
	return new;
end;
$$
language plpgsql;

create trigger after_users_update
after update on users
for each row
execute function update_users_logger();

--- trigger test
update users
set email = 'shlyapaenjoyer@gmail.com'
where id='58fff83f-4acd-4c08-a0c6-2aa650b46626';

-- drop trigger
drop trigger after_users_update on users;

-- date modification updater(might be used for many tables (ROW NAME LastModified))
-----------------------------------------------------------------------
create or replace function modification_date_update()
returns trigger as $$
begin
	new.LastModified=current_timestamp;
	return new;
end;
$$
language plpgsql;


create trigger modification_date_updater
before update on users
for each row
execute function modification_date_update();

create or replace function save_deleted_posts()
returns trigger as $$
begin
	insert into posts_log(post_id,content,post_created_at,title,views)
	values (old.post_id,old.content,old.post_created_at,old.title,old.views);
	update posts_log
	set author = (select idu from user_post 
				  where idp = old.post_id)
	where post_id = old.post_id;
	update posts_log
	set tags = (select array_agg(tag_id) from posts_tags
				where post_id = old.post_id
				group by post_id)
	where post_id = old.post_id;
	update posts_log
	set user_reacted = (select array_agg(user_id) from post_user_reaction
				where post_id = old.post_id
				group by post_id,reaction_id
				having reaction_id=1)
	where post_id = old.post_id;
	return old;
end;
$$
language plpgsql;


drop trigger posts_delete on posts;

create trigger posts_delete
before delete on posts
for each row
execute function save_deleted_posts();

create table posts_log (
post_id uuid,
content text,
post_created_at timestamp,
title varchar(100),
views int,
author uuid,
tags integer[],
deleted_at timestamp DEFAULT CURRENT_TIMESTAMP,
who_deleted uuid,
reason text,
user_reacted uuid[]);

drop table posts_log;

select * from pg_constraint;


-----------------------------------------------------------------------
create table user_post(
idu uuid,
idp uuid,
constraint pk_user_post primary key(idu,idp),
constraint fk_userID foreign key (idu) references Users(id),
constraint fk_postID foreign key (idp) references Posts(post_id)
);

SELECT pg_get_serial_sequence('Users', 'id');
ALTER SEQUENCE public.users_id_seq RESTART WITH 4204603;


---------------------------------------

drop table user_post;
drop table posts_tags;
drop table tags;
drop table post_reaction;
drop table pages_posts;
drop table pages;
drop table posts;
drop table users;
drop table reactions;
drop table users_log;

---------------------------------------

CREATE TYPE tag AS (
    id int,
    tag_name text
);



SELECT DISTINCT t1.post_id,content,post_created_at,title, array_agg(row(t2.tag_id,tag_name)),idu, views FROM Posts as t1 
        LEFT JOIN Posts_tags as t2 on t1.post_id=t2.post_id 
        LEFT JOIN User_post as t3 on t1.post_id=t3.idp 
        LEFT JOIN tags as t4 on t4.tag_id=t2.tag_id 
        group by t1.post_id,idu 
        having t1.post_id='1a24a256-6961-4477-b617-5f1bffffb804'


create table Posts(
post_id uuid primary key,
post_information text not null,
post_date timestamp not null default current_timestamp);

alter table posts
alter column title TYPE varchar(100);

alter table posts
add column views int not null default 0;

create table reactions(
reaction_id serial primary key,
reaction_name reaction_types not null
);

create table post_user_reaction(
post_id uuid,
user_id uuid,
reaction_id int,
constraint pk_post_user_reaction primary key (post_id, user_id, reaction_id),
constraint fk_user foreign key(user_id) references users(id),
constraint fk_postID foreign key(post_id) references posts(post_id),
constraint fk_reactionID foreign key(reaction_id) references reactions(reaction_id)
);

create type reaction_types as enum ('Like', 'Dislike', 'FunnyEmote', 'SadEmote', 'AngerEmote','Heart', 'ShockEmote');


--drop table post_user_reaction;
--drop table reactions;
--drop type reaction_types;

create table Tags(
tag_ID serial primary key,
tag_name varchar(100) UNIQUE);

alter table Tags
add constraint cnstr_uniq_tag 
UNIQUE(tag_name);

create table posts_tags(
tag_ID int not null,
post_ID uuid not null,
constraint pk_pst_tags primary key(tag_id,post_id),
constraint fk_tagID foreign key (tag_ID) references Tags(tag_ID),
constraint fk_postID foreign key (post_ID) references posts(post_ID)
);

create table pages(
page_id uuid primary key,
creator_url url not null,
title varchar(100) not null
);

create table pages_posts(
page_id uuid,
post_id uuid,
constraint pk_pg_pst primary key(page_id,post_id),
constraint fk_page_id foreign key(page_id) references pages(page_id),
constraint fk_post_id foreign key(post_id) references posts(post_ID)
)
insert into tags (tag_name) values ('Gaming'), ('Programming'), 
						 ('Maths'), ('Sport'), 
						 ('Football'), ('Basketball'), 
						 ('Music'), ('Hip-Hop'), 
						 ('Cloud rap'), ('Cybersport'), 
						 ('Competitions'), ('Films'), 
						 ('Serials'), ('PC'), 
						 ('Python'), ('C++'), 
						 ('SQL'), ('Books'),
						 ('Adventures'), ('Exotics'), ('Studies');
----------------------------						 
SELECT conname 
FROM pg_constraint 
WHERE conrelid = 'posts'::regclass;
----------------------------						 
alter table comment_post
drop constraint fk_post;

ALTER TABLE comment_post
ADD CONSTRAINT fk_post
FOREIGN KEY (post_id) 
REFERENCES posts (post_id) 
ON DELETE CASCADE;

alter table comments
add column comment_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

create table user_verification(
id uuid,
cypher text,
verificated bool default 'false',
foreign key (id) references users(id));

------------------------------------------------------------------------------

select date_trunc('month', created_at) as month, count(*) from users
group by month

SELECT TO_CHAR(created_at, 'TMMonth') as month, count(distinct id) as Users
FROM users
RIGHT JOIN user_post on users.id=user_post.idu
WHERE created_at >= NOW() - INTERVAL '6 months'
group by month

select * from (
SELECT TO_CHAR(created_at, 'TMMonth') as month, count(*) as Users
FROM users
WHERE created_at >= NOW() - INTERVAL '6 months'
group by month
) join (
SELECT TO_CHAR(created_at, 'TMMonth') as month, count(distinct id) as authors
FROM users
RIGHT JOIN user_post on users.id=user_post.idu
WHERE created_at >= NOW() - INTERVAL '6 months'
group by month) using(month);

SELECT TO_CHAR(post_created_at, 'TMMonth') as month, count(*) posts
FROM posts
WHERE post_created_at >= NOW() - INTERVAL '6 months'
group by month

SELECT month, array_agg(count) as array_count, array_agg(tags) as array_tags FROM (
SELECT TO_CHAR(post_created_at, 'TMMonth') as month, count(*) as count, tag_name as tags
FROM posts
join posts_tags using(post_id)
join tags using(tag_id)
WHERE post_created_at >= NOW() - INTERVAL '6 months'
group by month, tag_name)
group by month


SELECT TO_CHAR(created_at, 'TMMonth') as month, count(*) as Users
FROM users
RIGHT JOIN user_verification using(id)
WHERE created_at >= NOW() - INTERVAL '6 months' AND verificated = 'true'
group by month



