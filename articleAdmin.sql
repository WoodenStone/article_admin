/*==============================================================*/
/* DBMS name:      MySQL 5.0                                    */
/* Created on:     2021/10/23 17:24:53                          */
/*==============================================================*/


/*==============================================================*/
/* Table: article                                               */
/*==============================================================*/
create table article
(
   id                   int not null auto_increment,
   author_id            int not null,
   title                varchar(45) not null,
   content              text not null,
   publish_time         datetime not null,
   update_time          timestamp not null default CURRENT_TIMESTAMP,
   rowcontent           text not null,
   primary key (id)
);

/*==============================================================*/
/* Table: article_favorite                                      */
/*==============================================================*/
create table article_favorite
(
   favorite_id          int not null auto_increment,
   user_id              int not null,
   collection_id        int not null,
   id                   int not null,
   favorite_status      smallint not null,
   primary key (favorite_id)
);

/*==============================================================*/
/* Table: article_tag                                           */
/*==============================================================*/
create table article_tag
(
   article_id           int not null,
   tag_id               int not null,
   primary key (article_id, tag_id)
);

/*==============================================================*/
/* Table: article_thumbup                                       */
/*==============================================================*/
create table article_thumbup
(
   thumbup_id           int not null auto_increment,
   user_id              int not null,
   id                   int not null,
   thumbup_status       smallint not null,
   primary key (thumbup_id)
);

/*==============================================================*/
/* Table: collection                                            */
/*==============================================================*/
create table collection
(
   collection_id        int not null auto_increment,
   user_id              int not null,
   collection_name      varchar(50) not null,
   collection_description varchar(140) not null,
   primary key (collection_id)
);

/*==============================================================*/
/* Table: comments                                              */
/*==============================================================*/
create table comments
(
   comment_id           int not null auto_increment,
   publisher_id         int not null,
   recipient_id         int,
   article_commented_id int not null,
   content              text not null,
   create_time          datetime not null,
   is_reply             smallint,
   comment_index        int,
   primary key (comment_id)
);

/*==============================================================*/
/* Table: direct_message                                        */
/*==============================================================*/
create table direct_message
(
   message_id           int not null auto_increment,
   consignee_id         int not null,
   addresser_id         int not null,
   read_status          smallint not null,
   delivery_time        datetime not null,
   title                varchar(30) not null,
   content              text not null,
   primary key (message_id)
);

/*==============================================================*/
/* Table: relationship                                          */
/*==============================================================*/
create table relationship
(
   user_id_from         int not null,
   user_id_to           int not null,
   status               smallint not null,
   primary key (user_id_from, user_id_to)
);

/*==============================================================*/
/* Table: tag                                                   */
/*==============================================================*/
create table tag
(
   tag_id               int not null auto_increment,
   tag_name             varchar(30) not null,
   primary key (tag_id)
);

/*==============================================================*/
/* Table: user_info                                             */
/*==============================================================*/
create table user_info
(
   user_id              int not null auto_increment,
   user_pwd             varchar(30) not null,
   user_name            varchar(50) not null,
   avatarURL            text,
   user_permission      smallint not null,
   primary key (user_id)
);

/*==============================================================*/
/* Index: idx_user_name                                         */
/*==============================================================*/
create unique index idx_user_name on user_info
(
   user_name
);

/*==============================================================*/
/* View: user_comment                                           */
/*==============================================================*/
create  VIEW      user_comment
  as
select c.publisher_id, c.article_commented_id, c.content, c.create_time,is_reply from comments c, article a, user_info u
    where c.article_commented_id = a.id
    and a.author_id = u.user_id
    and is_reply is null;

alter table article add constraint FK_user_article foreign key (author_id)
      references user_info (user_id) on delete restrict on update restrict;

alter table article_favorite add constraint FK_article_favorite foreign key (id)
      references article (id) on delete restrict on update restrict;

alter table article_favorite add constraint FK_favorite_collection foreign key (collection_id)
      references collection (collection_id) on delete restrict on update restrict;

alter table article_favorite add constraint FK_user_favorite foreign key (user_id)
      references user_info (user_id) on delete restrict on update restrict;

alter table article_tag add constraint FK_article_tag foreign key (tag_id)
      references tag (tag_id) on delete restrict on update restrict;

alter table article_tag add constraint FK_article_tag2 foreign key (article_id)
      references article (id) on delete restrict on update restrict;

alter table article_thumbup add constraint FK_article_thumbup foreign key (id)
      references article (id) on delete restrict on update restrict;

alter table article_thumbup add constraint FK_user_thumbup foreign key (user_id)
      references user_info (user_id) on delete restrict on update restrict;

alter table collection add constraint FK_user_collection foreign key (user_id)
      references user_info (user_id) on delete restrict on update restrict;

alter table comments add constraint FK_article_comment foreign key (article_commented_id)
      references article (id) on delete restrict on update restrict;

alter table comments add constraint FK_user_comment foreign key (publisher_id)
      references user_info (user_id) on delete restrict on update restrict;

alter table comments add constraint FK_user_commented foreign key (recipient_id)
      references user_info (user_id) on delete restrict on update restrict;

alter table direct_message add constraint FK_addresser_message foreign key (consignee_id)
      references user_info (user_id) on delete restrict on update restrict;

alter table direct_message add constraint FK_consignee_message foreign key (addresser_id)
      references user_info (user_id) on delete restrict on update restrict;

alter table relationship add constraint FK_user_followed foreign key (user_id_from)
      references user_info (user_id) on delete restrict on update restrict;

alter table relationship add constraint FK_user_following foreign key (user_id_to)
      references user_info (user_id) on delete restrict on update restrict;


DELIMITER $ 
create trigger article_delete
before delete on article
for each row
begin
	delete from comments
    where article_commented_id = old.id ;
end$
DELIMITER ;


DELIMITER $ 
create trigger article_delete_tag
before delete on article
for each row
begin
	delete from article_tag
    where article_id = old.id ;
end$
DELIMITER ;


DELIMITER $ 
create trigger article_delete_thumbup
before delete on article
for each row
begin
	delete from article_thumbup
    where id = old.id ;
end$
DELIMITER ;


DELIMITER $ 
create trigger article_delete_favorite
before delete on article
for each row
begin
	delete from article_favorite
    where id = old.id ;
end$
DELIMITER ;


DELIMITER $ 
create trigger collection_delete
before delete on collection
for each row
begin
	delete from article_favorite
    where collection_id = old.collection_id ;
end$
DELIMITER ;

