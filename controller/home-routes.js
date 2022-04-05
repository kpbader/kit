const withAuth = require('../utils/auth')
const router = require('express').Router();
const sequelize = require('../config/connection');
const { Post, User, Comment } = require('../model');

// router.get('/', withAuth, (req, res) => {
//     res.render('home',{layout: 'main'});
// });

router.get('/', withAuth, (req, res) => {
  Post.findAll({
    attributes: [
      'id',
      'title',
      'content',
      'created_at',
      [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
    ],
    include: [
      {
        model: Comment,
        attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
        include: {
          model: User,
          attributes: ['firstname', 'lastname']
        }
      },
      {
        model: User,
        attributes: ['firstname', 'lastname']
      }
    ]
  })
    .then(dbPostData => {
      // pass a single post object into the homepage template
      // console.log(dbPostData[0]);
      const posts = dbPostData.map(post => post.get({ plain: true }));
      res.render('home', { posts });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/post/:id', withAuth, (req, res) => {
  Post.findOne({
    where: {
      id: req.params.id
    },
    attributes: [
      'id',
      'title',
      'content',
      'created_at',
      [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
    ],
    include: [
      {
        model: Comment,
        attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
        include: {
          model: User,
          attributes: ['firstname', 'lastname']
        }
      },
      {
        model: User,
        attributes: ['firstname', 'lastname']
      }
    ]
  })
    .then(dbPostData => {
      if (!dbPostData) {
        res.status(404).json({ message: 'No post found with this id' });
        return;
      }

      // serialize the data
      const post = dbPostData.get({ plain: true });

      // pass data to template
      res.render('single-post', { post });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/home', withAuth, (req, res) => {
  console.log(req.session)
  res.render('home',{layout: 'main'});
});

router.get('/login', (req, res) => {
  res.render('login',{layout: 'main'});
});

module.exports = router;