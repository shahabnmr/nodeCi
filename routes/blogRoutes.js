const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const cleanCache = require("../middlewares/cleanCache");

const Blog = mongoose.model("Blog");
const SharedPost = mongoose.model("SharedPost");
const User = mongoose.model("User");

module.exports = (app) => {
  app.get("/api/blogs/:id", requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id,
    });

    res.send(blog);
  });

  app.get("/api/blogs", requireLogin, async (req, res) => {
    // Get user's own blogs
    const ownBlogs = await Blog.find({ _user: req.user.id }).populate('_user');
    
    // Get blogs shared with this user
    const sharedPosts = await SharedPost.find({ _sharedWith: req.user.id })
      .populate({
        path: '_blog',
        populate: {
          path: '_user',
          model: 'User'
        }
      })
      .populate('_sharedBy');
    
    // Extract blogs from shared posts and add sharing info
    const sharedBlogs = sharedPosts.map(share => ({
      ...share._blog.toObject(),
      isShared: true,
      sharedBy: share._sharedBy,
      sharedAt: share.sharedAt,
      shareMessage: share.message
    }));
    
    // Combine own blogs and shared blogs
    const allBlogs = [
      ...ownBlogs.map(blog => ({ ...blog.toObject(), isShared: false })),
      ...sharedBlogs
    ];

    res.send(allBlogs);
  });

  app.post("/api/blogs", requireLogin, cleanCache, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id,
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });

  // Search for users to share with
  app.get("/api/users/search", requireLogin, async (req, res) => {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.send([]);
    }

    try {
      const users = await User.find({
        _id: { $ne: req.user.id }, // Exclude current user
        displayName: { $regex: query, $options: 'i' }
      }).limit(10);

      res.send(users);
    } catch (err) {
      res.status(400).send(err);
    }
  });

  // Share a blog post with specific users
  app.post("/api/blogs/:id/share", requireLogin, async (req, res) => {
    const { userIds, message } = req.body;
    const blogId = req.params.id;

    try {
      // Check if the blog exists and belongs to the user
      const blog = await Blog.findOne({ _id: blogId, _user: req.user.id });
      if (!blog) {
        return res.status(404).send({ error: "Blog not found or you don't have permission to share it" });
      }

      // Create shared post entries
      const sharePromises = userIds.map(userId => {
        const sharedPost = new SharedPost({
          _blog: blogId,
          _sharedBy: req.user.id,
          _sharedWith: userId,
          message: message || ''
        });
        return sharedPost.save().catch(err => {
          // Handle duplicate sharing (already shared with this user)
          if (err.code === 11000) {
            return null; // Skip duplicates
          }
          throw err;
        });
      });

      const results = await Promise.all(sharePromises);
      const successfulShares = results.filter(result => result !== null);

      res.send({ 
        message: `Blog shared with ${successfulShares.length} user(s)`,
        sharedWith: successfulShares
      });
    } catch (err) {
      res.status(400).send(err);
    }
  });

  // Get shared posts for a specific blog
  app.get("/api/blogs/:id/shares", requireLogin, async (req, res) => {
    const blogId = req.params.id;

    try {
      // Check if the blog belongs to the user
      const blog = await Blog.findOne({ _id: blogId, _user: req.user.id });
      if (!blog) {
        return res.status(404).send({ error: "Blog not found or you don't have permission to view shares" });
      }

      const shares = await SharedPost.find({ _blog: blogId })
        .populate('_sharedWith', 'displayName')
        .populate('_sharedBy', 'displayName');

      res.send(shares);
    } catch (err) {
      res.status(400).send(err);
    }
  });

  // Remove sharing (unshare)
  app.delete("/api/blogs/:id/unshare", requireLogin, async (req, res) => {
    const { userId } = req.body;
    const blogId = req.params.id;

    try {
      // Check if the blog belongs to the user
      const blog = await Blog.findOne({ _id: blogId, _user: req.user.id });
      if (!blog) {
        return res.status(404).send({ error: "Blog not found or you don't have permission to unshare it" });
      }

      await SharedPost.findOneAndDelete({
        _blog: blogId,
        _sharedBy: req.user.id,
        _sharedWith: userId
      });

      res.send({ message: "Blog unshared successfully" });
    } catch (err) {
      res.status(400).send(err);
    }
  });

  // Get only shared posts (separate endpoint)
  app.get("/api/blogs/shared", requireLogin, async (req, res) => {
    try {
      const sharedPosts = await SharedPost.find({ _sharedWith: req.user.id })
        .populate({
          path: '_blog',
          populate: {
            path: '_user',
            model: 'User'
          }
        })
        .populate('_sharedBy')
        .sort({ sharedAt: -1 });

      const sharedBlogs = sharedPosts.map(share => ({
        ...share._blog.toObject(),
        isShared: true,
        sharedBy: share._sharedBy,
        sharedAt: share.sharedAt,
        shareMessage: share.message
      }));

      res.send(sharedBlogs);
    } catch (err) {
      res.status(400).send(err);
    }
  });
};
