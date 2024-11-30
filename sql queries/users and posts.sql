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