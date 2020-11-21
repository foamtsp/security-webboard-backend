const Counter = require('../models/counterModel');
const AppError = require('../utils/appError');
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

    if (result) {
      console.log('Blog', _id, 'found, returning blog');
      res.status(200).json(result);
    } else {
      console.log('fail to find blog');
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

      console.log('comment', cid, 'added');
      res.status(201).json('comment is created');
    } else {
      console.log('fail to comment');
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
          'comments.$.comment': payload.msg,
        },
      });
    if (result.modifiedCount > 0) {
      console.log('comment', cid, 'edited');
      res.status(200).json(result);
    } else {
      console.log('fail to edit comment');
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
      res.status(204).json();
    } else {
      console.log('fail to edit deleted');
      return next(new AppError('Fail to delete this comment', 404));
    }
  } catch (err) {
    throw new Error(err.message);
  }
};