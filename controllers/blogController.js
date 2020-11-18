// const notification = require('../models/notificationModel');
const Counter = require('../models/counterModel');
const AppError = require('../utils/appError');
// const noti = require('../models/notifyOOP');
const dotenv = require('dotenv');
dotenv.config({
  path: './config.env'
});

exports.getAllBlogs = async (req, res, next) => {
  try {
    const mongo = req.app.locals.db;
    const result = await mongo
      .db(process.env.DATABASE_NAME)
      .collection('Blogs')
      .find({})
      .toArray();
    if (result) {
      console.log('Blog', 'found, returning all blog');
      res.status(200).json(result);
    } else {
      console.log('fail to find blog');
      return next(new AppError('Not found any blogs', 404));
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.createBlog = async (req, res, next) => {
  try {
    const mongo = req.app.locals.db;
    const newBlog = req.body;
    const sequenceValue = await Counter.getSequenceValue(mongo, 'blogId');
    newBlog._id = sequenceValue;
    newBlog.timestamp = Date.now();
    newBlog.comments = [];
    newBlog.comment_seq = 0;

    const result = await mongo
      .db(process.env.DATABASE_NAME)
      .collection('Blogs')
      .insertOne(newBlog);
    await mongo
      .db(process.env.DATABASE_NAME)
      .collection('Users')
      .updateOne({
        email: newBlog.WriterEmail,
      }, {
        $push: {
          blogOwn: sequenceValue,
        },
      });
    console.log(result);

    if (result) {
      console.log('blog created with id', sequenceValue);
      res.status(201).json(result);
      // res.json("blog created with id: " + sequenceValue);
    } else {
      console.log('fail to create blog');
      return next(new AppError('Fail to create a blog.', 404));
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.getBlog = async (req, res, next) => {
  try {
    const mongo = req.app.locals.db;
    const _id = parseInt(req.params.id);
    const result = await mongo.db(process.env.DATABASE_NAME).collection('Blogs').findOne({
      _id,
    });
    console.log(result);

    if (result) {
      console.log('Blog', _id, 'found, returning blog');
      res.status(200).json(result);
    } else {
      console.log('fail to find blog');
      // res.json(`fail to find blog ${_id}`)
      return next(new AppError('Can not get this blog with this id.', 404));
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.editBlog = async (req, res, next) => {
  try {
    const mongo = req.app.locals.db;
    const _id = parseInt(req.params.id);
    const newContent = req.body;
    console.log(newContent)
    const result = await mongo.db(process.env.DATABASE_NAME).collection('Blogs').updateOne({
      _id,
    }, {
      $set: newContent,
    });
    if (result) {
      console.log('job', _id, 'updated');
      res.status(200).json(result);
    } else {
      console.log('fail to delete');
      return next(new AppError('Not found this blog with id', 404));
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const mongo = req.app.locals.db;
    const _id = parseInt(req.params.id);
    const result = await mongo.db(process.env.DATABASE_NAME).collection('Blogs').deleteOne({
      _id,
    });
    if (result) {
      console.log('job', _id, 'deleted');
      res.status(204).json();
    } else {
      console.log('fail to delete');
      return next(new AppError('Not found this blog with id', 404));
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

// Comments Controller
exports.getAllComments = async (req, res, next) => {
  try {
    const mongo = req.app.locals.db;
    const blogId = parseInt(req.params.id);
    const result = await mongo.db(process.env.DATABASE_NAME).collection('Blogs').findOne({
      _id: blogId,
    });
    if (result) {
      console.log('job', blogId, 'found, returning comments');
      res.status(200).json(result.comments);
    } else {
      console.log('fail to find');
      return next(new AppError('Can not found with this blog id.', 404));
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.postComment = async (req, res, next) => {
  try {
    const mongo = req.app.locals.db;
    const blogId = parseInt(req.params.id);
    let payload = req.body;
    const [firstName, lastName] = payload.name.split(' ');

    const currentBlog = await mongo
      .db(process.env.DATABASE_NAME)
      .collection('Blogs')
      .findOne({
        _id: blogId,
      });

    const cid = currentBlog.comment_seq;
    await mongo
      .db(process.env.DATABASE_NAME)
      .collection('Blogs')
      .updateOne({
        _id: blogId,
      }, {
        $inc: {
          comment_seq: 1,
        },
      });

    payload.cid = cid;
    payload.timestamp = Date.now();

    const result = await mongo
      .db(process.env.DATABASE_NAME)
      .collection('Blogs')
      .findOneAndUpdate({
        _id: blogId,
      }, {
        $push: {
          comments: payload,
        },
      });

    if (result) {
      /*payload = {
        timestamp: Date.now(),
        string: 'You have new comment',
        status: 0,
        BlogId: blogId,
      };
      await notification.notifyPayload(mongo, [currentBlog.Employer], payload);*/
      // var notifyComment = new noti.CommentNotification(blogId)
      // notifyComment.notify(mongo, [currentBlog.Employer])

      // Call to get currentUser and not notify to myself
      const currentUser = await mongo.db(process.env.DATABASE_NAME).collection('Users').findOne({
        firstName,
        lastName
      });

      // if (currentBlog.Employer !== currentUser.email) {
      //   await notification.notifyPayload(mongo, [currentBlog.Employer], payload);
      // }

      console.log('comment', cid, 'added');
      // res.json(`${result.modifiedCount} commented`)
      res.status(201).json('comment is created');
    } else {
      console.log('fail to comment');
      // res.json(`fail to comment ${blogId}`)
      return next(new AppError('Fail to comment on this blog.', 404));
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.getComment = async (req, res, next) => {
  try {
    const mongo = req.app.locals.db;
    const blogId = parseInt(req.params.id);
    const payload = req.body;
    const cid = payload.cid;
    delete payload.cid;
    let result = await mongo.db(process.env.DATABASE_NAME).collection('Blogs').findOne({
      _id: blogId,
    });
    let result_comment = '';
    result.comments.forEach(function (comment) {
      if (comment.cid == cid) result_comment = comment;
    });
    if (result_comment) {
      console.log('job', blogId, 'found, returning comment');
      res.status(200).json(result_comment);
    } else {
      console.log('fail to find');
      // res.json(`fail to find blog ${blogId}`)
      return next(new AppError('Can not get this comment by id.', 404));
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.editComment = async (req, res, next) => {
  try {
    const mongo = req.app.locals.db;
    const blogId = parseInt(req.params.id);
    const payload = req.body;
    const cid = payload.cid;
    delete payload.cid;
    const result = await mongo
      .db(process.env.DATABASE_NAME)
      .collection('Blogs')
      .updateOne({
        _id: blogId,
        'comments.cid': cid,
      }, {
        $set: {
          'comments.$.msg': payload.msg,
        },
      });
    if (result.modifiedCount > 0) {
      console.log('comment', cid, 'edited');
      // res.json(`${result.modifiedCount} edited`)
      res.status(200).json(result);
    } else {
      console.log('fail to edit comment');
      // res.json(`fail to edit comment ${blogId}`)
      return next(new AppError('Can not edit this comment.', 404));
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const mongo = req.app.locals.db;
    const blogId = parseInt(req.params.id);
    const payload = req.body;
    const cid = payload.cid;
    delete payload.cid;
    const result = await mongo
      .db(process.env.DATABASE_NAME)
      .collection('Blogs')
      .updateOne({
        _id: blogId,
      }, {
        $pull: {
          comments: {
            cid,
          },
        },
      });
    if (result.modifiedCount > 0) {
      console.log('comment', cid, 'deleted');
      // res.json(`${result.modifiedCount} deleted`)
      res.status(204).json();
    } else {
      console.log('fail to edit deleted');
      // res.json(`fail to edit deleted ${blogId}`)
      return next(new AppError('Fail to delete this comment', 404));
    }
  } catch (err) {
    throw new Error(err.message);
  }
};