const express = require('express')

const app = express()

const port = 3001

const multer = require('multer')

let fs = require('fs')

app.use(require('cors')(
    {
        credentials: true,
        origin: true
    }
))

const { db } = require('./src/sql/db')


app.use('/public', express.static('public'));

// 获取请求体req.body
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const token = require('./src/auth/token')

app.get('/', (req, resp) => {
    resp.send('index')
})

const whiteList = ['/api/User', '/api/Login', '/api/Register']

// 校验token
app.use((req, res, next) => {
    const location = req.url
    if (whiteList.indexOf(location) > -1) {
        return next()
    } else {
        const authorization = req.headers['aa-token']
        if (typeof authorization === 'undefined') {
            return res.status(402).send('未检测到登录信息')
        } else {
            token.verToken(authorization).then(data => {
                req.data = data;
                return next()
            }).catch(error => {
                if(error.message === 'jwt expired') {
                    return res.status(401).send('登录超时')
                } else {
                    return res.status(402).send('未检测到登录信息')
                }
            })
        }
    }
})



// 获取文章标签列表
const articleTags = async (sql_tag = `select atg.article_id, t.tag_id, t.tag_name from article_tag atg, tag t
where atg.tag_id = t.tag_id;`) => {
    const tagResult = await db(sql_tag);
    const tagList = JSON.parse(JSON.stringify(tagResult));
    return tagList;
}

// 获取文章列表，并插入标签
app.get('/api/Article', async (req, resp) => {
    const tagList = await articleTags();
    // console.log(tagList)
    const sql = `select a.id, a.author_id, a.title, a.publish_time, a.update_time, u.user_name as author
    from article a left join user_info u
    on a.author_id = u.user_id;`;
    await db(sql).then(res => {
        const articleList = JSON.parse(JSON.stringify(res));
        for (const article of articleList) {
            article.tagName = []
            for (const tag of tagList) {
                if (article.id === tag.article_id) {
                    // console.log('id', article.id)
                    article.tagName.push(tag.tag_name);
                }
            }
        }
        // console.log(articleList, 'art')
        resp.send(articleList)
    })
})

// 获取某个用户的文章
app.get('/api/personalArticle', async (req, resp) => {
    // console.log('uid',req.query.uid)
    const sql = `select id, title, author_id, content, publish_time, update_time from article a, user_info u 
    where user_id = ${req.query.uid}
    and a.author_id = u.user_id;`;
    const tagList = await articleTags();
    db(sql).then(res => {
        const articleList = JSON.parse(JSON.stringify(res));
        for (const article of articleList) {
            article.tagName = []
            for (const tag of tagList) {
                if (article.id === tag.article_id) {
                    // console.log('id', article.id)
                    article.tagName.push(tag.tag_name);
                }
            }
        }
        resp.send(articleList)
    })
})


// 获取某篇文章信息及标签
app.get('/api/articleDetail', async (req, resp) => {
    const aid = req.query.aid;
    // console.log(aid);
    const tagList = await articleTags();
    const sql = `select a.id, a.author_id, a.title, a.content, a.publish_time, a.update_time, u.user_name as author
    from article a left join user_info u
    on a.author_id = u.user_id where a.id = ${aid};`;
    db(sql).then(res => {
        const article = JSON.parse(JSON.stringify(res))[0];
        article.tagName = []
        for (const tag of tagList) {
            if (article.id === tag.article_id) {
                // console.log('id', article.id)
                article.tagName.push(tag.tag_name);
            }
        }
        resp.send(article)
    })
})

// 删除某一篇文章
app.delete('/api/deleteArticle', (req, resp) => {
    const params = req.body;
    const sql = `delete from article where id=${params.id}; `;
    db(sql).then(
        res => {
            resp.send(res);
        }
    )
})

// 标签的更新
const findTag = async (tag) => {
    // 查找标签是否已存在，如果没有就添加一条
    let sql_tag_find = `select * from tag where tag_name = ?;`
    return db(sql_tag_find, tag).then(res => {
        let result = JSON.parse(JSON.stringify(res))
        if (result.length > 0) {
            // console.log(result[0].tag_id, 'exist')
            return result[0].tag_id;
        } else {
            // 增加一条新标签
            let sql_tag_insert = `insert into tag(tag_name) values(?);`
            return db(sql_tag_insert, tag).then(data => {
                // console.log(data.insertId, 'not exist')
                return data.insertId;
            })
        }
    })
}

// 添加文章
app.post('/api/addArticle', async (req, resp) => {
    const params = req.body;
    const sqlParam = [params.title, params.author_id, params.content, params.rawcontent]
    const sql_insert = `insert into article(title, author_id, content, rawcontent, publish_time) values (?, ?,?, ? ,NOW() );`
    // console.log(sql);
    const tagID = [];
    for (const tag of params.tagName) {
        let id = await findTag(tag)
        tagID.push(id);
    }

    let res = await db(sql_insert, sqlParam);
    let aid = res.insertId;

    for (const id of tagID) {
        const sql_tag_map = `insert into article_tag values(${aid}, ${id});`
        await db(sql_tag_map);
    }
    const value = { insertId: aid };
    resp.send(value);
})

// 更新某一篇文章
// 标签的更新：先删除该文章所有标签，再插入新标签
app.post('/api/updateArticle', async (req, resp) => {
    const params = req.body;
    const sqlParam = [params.title, params.content, params.rawcontent, params.id]
    const sql_update = `update article set title = ? , content=?, rawcontent=? where id = ?;`
    // 删除映射
    const sql_tag_delete = `delete from article_tag where article_id = ${params.id};`
    await db(sql_tag_delete);
    // 获取该文章应有的所有标签对应的tag_id
    const tagID = [];
    for (const tag of params.tagName) {
        let id = await findTag(tag)
        tagID.push(id);
    }
    // console.log(tagID, '标签ID')
    // 根据tagID添加映射
    for (const id of tagID) {
        const sql_tag_map = `insert into article_tag values(${params.id}, ${id});`
        await db(sql_tag_map);
    }
    await db(sql_update, sqlParam).then(
        res => {
            resp.send(res);
        }
    )
})

// 模糊搜索  标题、内容、作者
app.post('/api/search', (req, resp) => {
    const params = req.body;
    const sqlParam = [params.q, params.q, params.q]
    const sql = `select a.id, a.author_id, a.title, a.content, u.user_name from article a, user_info u
    where a.author_id = u.user_id
    and (
    a.rawcontent like concat('%', ?, '%') or 
    a.title like concat('%', ?, '%') or
    u.user_name like concat('%', ?, '%')
    );`
    db(sql, sqlParam).then(
        res => {
            resp.send(res);
        }
    )
})


// 用户名提示
app.post('/api/searchName', (req, resp) => {
    const params = req.body;
    const sql = `select user_id, user_name from user_info
    where user_name like concat('%', ?, '%');`
    db(sql, params.q).then(
        res => {
            resp.send(res);
        }
    )
})

// 用户登录
/* app.post('/api/login', (req, resp) => {
    const params = req.body;
    let sqlParam = params.username
    const sql = `select * from user_info where user_name = ?;`;
    db(sql, sqlParam).then(
        res => {
            if (res.length) {
                let value = [JSON.parse(JSON.stringify(res))[0], false];
                let pwd = value[0].user_pwd;
                if (pwd === params.password) {
                    value[1] = true;
                    // console.log(value)
                    resp.send(value);
                } else {
                    resp.send(value);
                }
            } else {
                // 未注册 前端按用户名密码不正确处理
                resp.end()
            }
        }
    )
}) */

// 用户注册
app.post('/api/Register', (req, resp) => {
    const params = req.body;
    const findParams = params.username
    const addParams = [params.username, params.password]
    const sql_find = `select user_id from user_info where user_name = ?;`;
    const sql_add = `insert into user_info(user_name, user_pwd, user_permission) values(?, ?, 0);`
    db(sql_find, findParams).then(
        async res => {
            if (res.length > 0) {
                resp.send(false);
            } else {
                let registerRes = await db(sql_add, addParams);
                let sql_add_default_collection = `insert into collection(user_id, collection_name, collection_description) values(${registerRes.insertId}, "默认收藏", "默认收藏夹")`;
                let collectionRes = await db(sql_add_default_collection);
                // console.log(collectionRes.insertId);
                if (collectionRes.insertId > 0) {
                    resp.send(true);
                } else {
                    resp.send(false);
                }
            }
        }
    )
})

// 用户信息更改，返回
app.post('/api/userInfoChange', (req, resp) => {
    const params = req.body
    const sql_find = `select user_id from user_info where user_id = ?;`;
    const sqlParam = [params.NEWname, params.NEWpwd, params.id]
    const sql_update = `update user_info set user_name = ?, user_pwd = ? where user_id  = ?;`;
    let resValue = { result: 0 };
    db(sql_find, params.id).then(res => {
        let checkID = JSON.parse(JSON.stringify(res))[0].user_id
        if (checkID !== params.id && checkID > 0) {
            // duplicate name
            resValue.result = 2;
            resp.send(resValue)
        } else {
            // 可以进行修改
            db(sql_update, sqlParam).then(result => {
                if (result.affectedRows === 1) {
                    // success
                    resValue.result = 0;
                    resp.send(resValue);
                } else {
                    // db error or whatever
                    resValue.result = 1;
                    resp.send(resValue);
                }
            })
        }
    })
})

// 头像上传
const upload = multer({
    dest: 'upload/UserAvatar'
})
app.post('/api/uploadAvatar', upload.single('avatar'), (req, resp) => {
    // console.log(req.file)
    let file = req.file
    let savingName = file.filename + new Date().getTime()
    let rawSrc = 'upload/UserAvatar/' + file.filename;
    let realSrc = 'upload/UserAvatar/' + savingName
    fs.renameSync(rawSrc, realSrc)
    let params = req.body
    // console.log(params)
    const sql = `update user_info set avatarURL =? where user_id = ?;`
    db(sql, [realSrc, params.id]).then(result => {
        if (result.affectedRows === 1) {
            resp.sendFile(process.cwd() + '/upload/UserAvatar/' + savingName)
        } else {
            resp.send('Unknown error.')
        }
    })
})

// 文章内图片上传
const uploadImg = multer({
    dest: 'public'
})
app.post('/api/imgUpload', uploadImg.single('image'), (req, resp) => {
    // console.log(req, 'req');
    let file = req.file
    console.log(file)
    let mimeType = file.mimetype.split('/')[1]
    let savingName = file.originalname.split('.')[0] + new Date().getTime() + '.' + mimeType
    // console.log(mimeType)
    let rawSrc = 'public/' + file.filename;
    let realSrc = 'public/' + savingName
    fs.renameSync(rawSrc, realSrc);
    resp.send('http://127.0.0.1:3001/public/' +savingName)
})

// 由ID获取头像
app.get('/api/getAvatar/:id', (req, resp) => {
    // console.log(req.params)
    const sql = `select avatarURL from user_info where user_id = ${req.params.id};`
    // console.log(sql)
    db(sql).then(res => {

        let result = JSON.parse(JSON.stringify(res))
        // console.log(result[0].avatarURL)
        if (result.length === 0) {
            resp.end()
        } else {
            if (result[0].avatarURL != null) {
                // resp.attachment(process.cwd() +'/'+ result[0].avatarURL)
                resp.type('image/jpeg')
                resp.sendFile(process.cwd() + '/' + result[0].avatarURL)
            } else {
                resp.end()
            }
        }
    })
})

// 由name获取头像
app.get('/api/getAvatarByName/:name', (req, resp) => {
    const sql = `select avatarURL from user_info where user_name = ?;`
    db(sql, req.params.name).then(res => {
        let result = JSON.parse(JSON.stringify(res))
        if (result.length === 0) {
            resp.end();
        } else {
            if (result[0].avatarURL != null) {
                resp.type('image/jpeg')
                resp.sendFile(process.cwd() + '/' + result[0].avatarURL)
            } else {
                resp.end()
            }
        }
    })
})


// 获取用户对某篇文章的点赞状态
app.get('/api/thumbupStatus', (req, resp) => {
    const sql = `select * from article_thumbup
    where id = ${req.query.articleID} and user_id = ${req.query.userID};`;
    db(sql).then(res => {
        const result = JSON.parse(JSON.stringify(res))
        resp.send(result);
    })
})

// 获取用户对某篇文章的收藏状态
app.get('/api/favoriteStatus', (req, resp) => {
    const sql = `select * from article_favorite
    where user_id = ${req.query.userID} and id = ${req.query.articleID} and favorite_status = 1;`
    db(sql).then(res => {
        const result = JSON.parse(JSON.stringify(res))
        resp.send(result);
    })
})

// 变更点赞状态
app.post('/api/thumbupStatus', (req, resp) => {
    const params = req.body;
    const ts = params.thumbupStatus == 1 ? 0 : 1;
    const sql_find = `select * from article_thumbup where user_id  = ${params.userID} and id=${params.articleID};`
    const sql_update = `update article_thumbup set thumbup_status = ${ts} where user_id  = ${params.userID} and id=${params.articleID};`
    const sql_insert = `insert into article_thumbup(user_id, id, thumbup_status) 
    values(${params.userID}, ${params.articleID}, ${ts});`
    db(sql_find).then(res => {
        if (res.length > 0) {
            db(sql_update).then(result => {
                if (result.affectedRows === 1) {
                    resp.sendStatus(200);
                } else {
                    resp.sendStatus(404);
                }
            })
        } else {
            db(sql_insert).then(result => {
                if (result.affectedRows === 1) {
                    resp.sendStatus(200);
                } else {
                    resp.sendStatus(404);
                }
            })
        }
    })
})

// 变更收藏状态
app.post('/api/favoriteStatus', (req, resp) => {
    const params = req.body;
    const fas = params.favoriteStatus == 1 ? 0 : 1;
    const sql_find = `select * from article_favorite where user_id  = ${params.userID} and id=${params.articleID};`
    const sql_update = `update article_favorite set favorite_status = ${fas} where user_id  = ${params.userID} and id=${params.articleID};`

    db(sql_find).then(async res => {
        // 已有记录，更新状态即可
        if (res.length > 0) {
            db(sql_update).then(result => {
                if (result.affectedRows === 1) {
                    resp.sendStatus(200);
                } else {
                    resp.sendStatus(404);
                }
            })
        } else {
            // 先找到该用户的默认收藏夹
            let sql_find_default_collection = `select collection_id from collection where user_id = ${params.userID} and collection_name="默认收藏";`
            let collectionRes = await db(sql_find_default_collection);
            let cid = JSON.parse(JSON.stringify(collectionRes))[0].collection_id;
            // 插入到默认收藏夹中
            const sql_insert = `insert into article_favorite(user_id, id, favorite_status, collection_id) 
            values(${params.userID}, ${params.articleID}, ${fas}, ${cid});`
            db(sql_insert).then(result => {
                if (result.affectedRows === 1) {
                    resp.sendStatus(200);
                } else {
                    resp.sendStatus(404);
                }
            })
        }
    })
})

// 由用户名获取id
app.get('/api/getIdByName/:name', (req, resp) => {
    const sql = `select user_id from user_info where user_name = ?;`
    db(sql, req.params.name).then(res => {
        const result = JSON.parse(JSON.stringify(res))
        resp.send(result[0])
    })
})

// 获取一对一关注状态
app.get('/api/getRelationStatusOne', (req, resp) => {
    // console.log(req.query.uidFrom)
    const sql = `select status from relationship where user_id_from = ${req.query.uidFrom} and user_id_to = ${req.query.uidTo}; `
    db(sql).then(res => {
        const result = JSON.parse(JSON.stringify(res))
        if (result.length > 0) {
            resp.send(result[0])
        } else {
            resp.end()
        }
    })
})


// 变更关注状态
app.post('/api/followStatusChange', (req, resp) => {

    const statusToChange = req.body.status == true ? 0 : 1;
    // 先查找是否有这一条
    const sql_find = `select * from relationship where user_id_from = ${req.body.uidFrom} and user_id_to = ${req.body.uidTo};`
    const sql_update = `update relationship set status = ${statusToChange}
    where user_id_from = ${req.body.uidFrom} and user_id_to = ${req.body.uidTo};`
    const sql_insert = `insert into relationship(user_id_from, user_id_to,status) values(${req.body.uidFrom}, ${req.body.uidTo}, ${statusToChange});`
    console.log(sql_find);
    db(sql_find).then(res => {
        const res_find = JSON.parse(JSON.stringify(res))
        // 已有记录，更新状态
        if (res_find.length > 0) {
            db(sql_update).then(result => {
                if (result.changedRows > 0) {
                    resp.sendStatus(200);
                } else {
                    console.log(JSON.parse(JSON.stringify(result)))
                    resp.sendStatus(500);
                }
            })
        } else {
            // 插入新条目
            db(sql_insert).then(result => {
                if (result.affectedRows > 0) {
                    resp.sendStatus(200);
                } else {
                    resp.sendStatus(500);
                }
            })
        }
    })

})


// 获取被关注数
app.get('/api/getFollowerNumber/:id', (req, resp) => {
    // console.log(req.params)
    const sql = `select count(*) as cnt from relationship where user_id_to = ${req.params.id} and status=1;`
    db(sql).then(
        res => {
            const result = JSON.parse(JSON.stringify(res))
            resp.send(result[0]);
        }
    )
})

// 获取关注数
app.get('/api/getFollowingNumber/:id', (req, resp) => {
    const sql = `select count(*) as cnt from relationship where user_id_from = ${req.params.id} and status=1;`
    db(sql).then(
        res => {
            const result = JSON.parse(JSON.stringify(res))
            resp.send(result[0]);
        }
    )
})

/* 注意添加await，否则没等查询回复就return了 */
const exec = async (sql_article_comment, id) => {
    const res = await db(sql_article_comment)
    const results = JSON.parse(JSON.stringify(res))
    if (!results.length) {
        return
    } else {
        for (let result of results) {
            // 依次查找对应评论下的回复
            result['children'] = []
            // * 错误写法，不能指定接收者ID，因为有可能是回复楼中楼的
            /* const sql_reply = `select * from comments where article_commented_id = ${id} and is_reply = 1 and recipient_id = ${result['publisher_id']} and comment_index = ${result['comment_index']};` */
            const sql_reply = `select * from comments where article_commented_id = ${id} and is_reply = 1 and comment_index = ${result['comment_index']};`
            await db(sql_reply).then(data => {
                const children = JSON.parse(JSON.stringify(data))
                if (children.length > 0) {
                    result['children'].push(...data)
                }
            })
            // 对应插入评论下的用户名
            result['publisher_name'] = ''
            const sql_id_to_name = `select user_name from user_info where user_id = ${result.publisher_id};`
            await db(sql_id_to_name).then(data => {
                const name = JSON.parse(JSON.stringify(data))
                // console.log(name)
                result['publisher_name'] = name[0].user_name;
            })
            // 回复中的用户名
            if (result.children.length > 0) {
                for (let child of result.children) {
                    child['publisher_name'] = ''
                    child['recipient_name'] = ''
                    const sql_id_to_name1 = `select user_name from user_info where user_id = ${child.publisher_id};`
                    const sql_id_to_name2 = `select user_name from user_info where user_id = ${child.recipient_id};`
                    await db(sql_id_to_name1).then(data => {
                        const name = JSON.parse(JSON.stringify(data))
                        child['publisher_name'] = name[0].user_name;
                    })
                    await db(sql_id_to_name2).then(data => {
                        const name = JSON.parse(JSON.stringify(data))
                        child['recipient_name'] = name[0].user_name;
                    })
                }

            }
        }
        return await results;

    }
}

// 获取某篇文章的评论
app.get('/api/commentsOfOneArticle/:article_id', (req, resp) => {
    // console.log('参数', req.params.article_id)
    const sql_article_comment = `select * from comments where article_commented_id = ${req.params.article_id} and ( is_reply is null or is_reply <> 1 );`
    exec(sql_article_comment, req.params.article_id).then(data => {
        // 可能为undefined 如果查询不到对应数据的话
        // console.log(data === undefined)
        resp.send(data)
    })

})

// 添加文章评论或回复
app.post('/api/Comment', (req, resp) => {
    const params = req.body;
    const value = JSON.parse(JSON.stringify(params));
    const commentParams = [value.publisher_id, value.article_commented_id, value.content, value.comment_index]
    const sql_comment = `insert into comments (publisher_id, article_commented_id, content, create_time, comment_index) values(?, ?, ?, NOW(), ?);`;
    const replayParams = [value.publisher_id, value.article_commented_id, value.recipient_id, value.content, value.comment_index]
    const sql_reply = `insert into comments (publisher_id, article_commented_id, recipient_id, content, create_time, is_reply, comment_index) values(?, ?, ?, ?, NOW(), 1, ?);`;
    // 回复
    if (value.is_reply === true) {
        db(sql_reply, replayParams).then(res => {
            if (res.affectedRows === 1) {
                resp.sendStatus(200);
            } else {
                resp.sendStatus(500);
            }
        })
    } else {
        // 评论
        db(sql_comment, commentParams).then(res => {
            if (res.affectedRows === 1) {
                resp.sendStatus(200);
            } else {
                resp.sendStatus(500);
            }
        })
    }
})

// 获取被关注列表
app.get('/api/FollowersList', (req, resp) => {
    const sql = `select user_id, user_name, avatarURL from user_info where user_id in ( 
        select user_id_from from relationship r, user_info u
        where r.user_id_to = ${req.query.userID}
        and r.status = 1
        and r.user_id_to = u.user_id);`;
    db(sql).then(res => {
        const result = JSON.parse(JSON.stringify(res))
        resp.send(result)
    })
})

// 获取关注人列表
app.get('/api/FollowingList', (req, resp) => {
    // console.log(req.query.userID)
    const sql = `select user_id, user_name, avatarURL from user_info where user_id in ( select user_id_to from relationship r, user_info u
        where r.user_id_from = ${req.query.userID}
        and r.status = 1
        and r.user_id_from = u.user_id);`;
    db(sql).then(res => {
        const result = JSON.parse(JSON.stringify(res))
        resp.send(result)
    })
})

// 某用户收到的评论和回复
app.get('/api/CommentsReceived', (req, resp) => {
    // console.log(req.query.userID);
    const uid = req.query.userID;
    // 查找回复，排除自己给自己的回复
    const sql_reply = `select ar.title, co.publisher_name, co.publisher_id, co.article_commented_id, co.content, co.create_time, co.is_reply from 
    (
    select us.user_name as publisher_name, uc.publisher_id, uc.article_commented_id, uc.content, uc.create_time, uc.is_reply from(
    select publisher_id, article_commented_id, content, create_time, is_reply from comments
    where recipient_id = ${uid} and publisher_id <> ${uid}
    ) as uc, user_info us
    where uc.publisher_id = us.user_id
    ) as co, article ar
    where co.article_commented_id = ar.id;`;
    // 查找该用户文章下的评论，排除该用户自己发表的评论
    const sql_comment = `select ar.title, co.publisher_name, co.publisher_id, co.article_commented_id, co.content, co.create_time, co.is_reply from 
    (
    select us.user_name as publisher_name, uc.publisher_id, uc.article_commented_id, uc.content, uc.create_time, uc.is_reply from 
    (select c.publisher_id, c.article_commented_id, c.content, c.create_time,is_reply from comments c, article a, user_info u
    where c.article_commented_id = a.id
    and a.author_id = u.user_id
    and u.user_id = ${uid}
    and is_reply is null
    and publisher_id <> ${uid}) as uc, user_info us
    where uc.publisher_id = us.user_id
    ) as co, article ar
    where co.article_commented_id = ar.id;`
    let p1 = db(sql_comment)
    let p2 = db(sql_reply)
    Promise.all([p1, p2]).then(results => {
        const commentList = []
        for (const result of results) {
            let value = JSON.parse(JSON.stringify(result));
            commentList.push(...value);
        }
        resp.send(commentList)
    })
})

// 获取某用户收到的站内信总数
app.get('/api/MessageNum', (req, resp) => {
    const uid = req.query.userID;
    const sql =`select count(*) as total
	from direct_message d, user_info u
    where d.consignee_id = ?
    and d.addresser_id = u.user_id;`
    db(sql, [uid]).then(res => {
        resp.send(JSON.parse(JSON.stringify(res)))
    })
})

// 获取某用户发出的站内信总数
app.get('/api/MessageOutNum', (req, resp) => {
    const uid = req.query.userID;
    const sql =`select count(*) as total
	from direct_message d, user_info u
    where d.addresser_id = ?
    and d.addresser_id = u.user_id;`
    db(sql, [uid]).then(res => {
        resp.send(JSON.parse(JSON.stringify(res)))
    })
})

// 分页查询某用户收到的站内信
app.get('/api/currentDirectMessage', (req, resp) => {    
    const sql = `select d.message_id, d.addresser_id, d.read_status, d.delivery_time, d.content, d.title, u.user_name as addresser_name 
	from direct_message d, user_info u
    where d.consignee_id = ${req.query.userID}
    and d.addresser_id = u.user_id order by message_id desc limit ${req.query.pageSize} offset ${req.query.offset};`
    // console.log(sql)
    db(sql).then(res => {
        const result = JSON.parse(JSON.stringify(res));
        resp.send(result);
    })
})

// 分页查询某用户发出的站内信
app.get('/api/currentMessageOut', (req, resp) => {
    const uid = req.query.userID;
    const sql = `select d.message_id, d.addresser_id, d.read_status, d.delivery_time, d.content, d.title, u.user_name as consignee_name from direct_message d, user_info u
    where d.addresser_id = ${uid}
    and d.consignee_id = u.user_id order by message_id desc limit ${req.query.pageSize} offset ${req.query.offset};`
    db(sql).then(res => {
        const result = JSON.parse(JSON.stringify(res));
        resp.send(result);
    })
})

// 更改某条站内信的阅读状态
app.post('/api/messageReadStatus', (req, resp) => {
    const params = req.body;
    const sql = `update direct_message set read_status = 1
    where message_id = ${params.message_id};`
    db(sql).then(
        res => {
            // console.log(res.affectedRows)
            if (res.affectedRows === 1) {
                resp.sendStatus(200);
            } else {
                resp.sendStatus(404);
            }
        }
    )
})

// 新增一条站内信
app.post('/api/newMessage', (req, resp) => {
    const params = req.body;
    // console.log(params)
    const sqlParam = [params.title, params.content]
    const sql = `insert into direct_message(addresser_id, consignee_id, read_status, delivery_time, title, content)
    values(${params.addresser_id}, ${params.consignee_id}, 0, NOW(), ?, ?);`;
    db(sql, sqlParam).then(res => {
        // console.log(res)
        if (res.affectedRows === 1) {
            resp.sendStatus(200);
        } else {
            resp.sendStatus(500);
        }
    })
})

// 获取某用户的收藏夹
app.get('/api/collection', (req, resp) => {
    const uid = req.query.uid;
    console.log(uid, 'id')
    const sql = `select * from collection where user_id = ${uid};`;
    db(sql).then(res => {
        resp.send(JSON.parse(JSON.stringify(res)));
    })
})

// 获取某用户某收藏夹的文章
app.get('/api/favoriteArticle', async (req, resp) => {
    const uid = req.query.uid, cid = req.query.cid;
    // console.log(uid, 'uid');
    const sql = `select * from article 
    where id in (
    select id from article_favorite f left join collection c
    on f.collection_id = c.collection_id
    where f.user_id = ${uid}
    and f.collection_id = ${cid}
    and f.favorite_status = 1
    );`;

    const tagList = await articleTags();
    db(sql).then(res => {
        const articleList = JSON.parse(JSON.stringify(res));
        for (const article of articleList) {
            article.tagName = []
            for (const tag of tagList) {
                if (article.id === tag.article_id) {
                    // console.log('id', article.id)
                    article.tagName.push(tag.tag_name);
                }
            }
        }
        resp.send(articleList)
    })
})

// 创建新收藏夹，不校验同名收藏夹是否已经存在(收藏夹有唯一编号collection_id)
app.post('/api/newCollection', (req, resp) => {
    const params = req.body;
    const sqlParam = [params.uid, params.cname, params.cdes]
    const sql = `insert into collection(user_id, collection_name, collection_description) 
    values(?, ?,?);`
    db(sql, sqlParam).then(res => {
        if (res.insertId > 0) {
            resp.sendStatus(200);
        } else {
            resp.sendStatus(500);
        }
    })
})

// 修改收藏夹信息
app.post('/api/collectionInfo', (req, resp) => {
    const params = req.body;
    const sqlParam = [params.name, params.description, params.cid]
    const sql = `update collection set collection_name=?, collection_description = ?
    where collection_id =?;`
    db(sql, sqlParam).then(res => {
        resp.end()
    })
})

// 删除收藏夹
app.delete('/api/collection', (req, resp) => {
    const cid = req.body.cid;
    const sql = `delete from collection where collection_id = ${cid};`
    db(sql).then(res => {
        resp.end()
    })
})


// 查找某用户将某篇文章收藏于哪些收藏夹
app.get('/api/collectionStatus', (req, resp) => {
    const aid = req.query.aid, uid = req.query.uid;
    const sql = `select c.collection_id, c.collection_name, c.collection_description
    from collection c left join article_favorite af
    on c.collection_id = af.collection_id
    where af.user_id = ${uid} and af.id = ${aid} and af.favorite_status = 1;`
    db(sql).then(res => {
        resp.send(JSON.parse(JSON.stringify(res)));
    })
})

// 添加到收藏夹
app.post('/api/articleFavorite', (req, resp) => {
    const aid = req.body.aid, uid = req.body.uid, cid = req.body.cid;
    let sql_clearStatus = `update article_favorite set favorite_status = 0
        where user_id = ${uid} and id = ${aid};`
    db(sql_clearStatus).then(res => {
        // 不添加收藏，直接结束
        if (cid.length === 0) {
            resp.end()
        }
    })
    for (const id of cid) {
        // console.log(id)
        const sql_find = `select * from article_favorite
        where user_id = ${uid} and collection_id = ${id} and id = ${aid};`
        const sql_update = `update article_favorite set favorite_status = 1
        where user_id = ${uid} and collection_id = ${id} and id = ${aid};`
        const sql_insert = `insert into article_favorite(user_id, collection_id, id, favorite_status)
        values(${uid}, ${id}, ${aid}, 1);`
        db(sql_find).then(res => {
            console.log(res.favoriteStatus, 'find')
            if (res.length > 0) {
                db(sql_update).then(result => {
                    console.log(result)
                })
            } else {
                db(sql_insert).then(result => {
                    console.log(result)
                })
            }
        })
    }
    resp.end()

})

// 删除某条站内信
app.delete('/api/message', (req, resp) => {
    const msgId = req.body.msgId;
    const sql = `delete from direct_message where message_id = ${msgId};`
    db(sql).then(res => {
        resp.send(res)
    })
})

// 首页创作统计数据
app.get('/api/statistic', (req, resp) => {
    // const d = req.query.date.split('+');
    const day = req.query.date, week = req.query.week, uid = req.query.uid;
    const sql = `select date(publish_time) as ptime, count(*) as cnt from article 
    where author_id = ${uid}
    AND unix_timestamp(publish_time) <= (unix_timestamp("${day}") + 86400)
    group by date(publish_time);`
    db(sql).then(res => {
        let result = JSON.parse(JSON.stringify(res));
        resp.send(result)
    })
})

// 获取赞数降序的文章列表
app.get('/api/ArticleThumbupDesc', (req, resp) => {
    const sql = `select id, count(*) as cnt from article_thumbup
    where thumbup_status = 1
    group by id 
    order by cnt desc;`;
    db(sql).then(res => {
        let result = JSON.parse(JSON.stringify(res));
        resp.send(result)
    })
})

// 获取收藏降序的文章列表
app.get('/api/ArticleFavoriteDesc', (req, resp) => {
    const sql = `select id, count(*) as cnt from article_favorite
    where favorite_status = 1
    group by id
    order by cnt desc;`;
    db(sql).then(res => {
        let result = JSON.parse(JSON.stringify(res));
        resp.send(result)
    })
})

// 获取回复评论数降序的文章列表
app.get('/api/ArticleCommentsDesc', (req, resp) => {
    const sql = `select article_commented_id as id, count(*) as cnt from comments
    group by article_commented_id
    order by cnt desc;`;
    db(sql).then(res => {
        let result = JSON.parse(JSON.stringify(res));
        resp.send(result)
    })
})

app.post('/api/Login', (req, resp) => {
    const params = req.body;
    let sqlParam = params.username
    const sql = `select * from user_info where user_name = ?;`;
    db(sql, sqlParam).then(
        res => {
            if (res.length) {
                let value = JSON.parse(JSON.stringify(res));
                let pwd = value[0].user_pwd;
                if (pwd === params.password) {
                    token.setToken(params.username).then(token => {
                        resp.status(200).send({
                            token,
                            userInfo: value[0]
                        })
                    })
                    // resp.send(200)
                } else {
                    resp.writeHead(801, 'Current password does not match', { 'content-type': 'text/plain' });
                    resp.end()
                }
            } else {
                resp.writeHead(801, 'Current password does not match', { 'content-type': 'text/plain' });
                resp.end()
            }
        }
    )
})


app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
})