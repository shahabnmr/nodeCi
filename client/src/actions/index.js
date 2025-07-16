import axios from 'axios';
import { 
  FETCH_USER, 
  FETCH_BLOGS, 
  FETCH_BLOG,
  SEARCH_USERS,
  SHARE_BLOG,
  FETCH_SHARED_BLOGS,
  FETCH_BLOG_SHARES
} from './types';

export const fetchUser = () => async dispatch => {
  const res = await axios.get('/api/current_user');

  dispatch({ type: FETCH_USER, payload: res.data });
};

export const handleToken = token => async dispatch => {
  const res = await axios.post('/api/stripe', token);

  dispatch({ type: FETCH_USER, payload: res.data });
};

export const submitBlog = (values, history) => async dispatch => {
  const res = await axios.post('/api/blogs', values);

  history.push('/blogs');
  dispatch({ type: FETCH_BLOG, payload: res.data });
};

export const fetchBlogs = () => async dispatch => {
  const res = await axios.get('/api/blogs');

  dispatch({ type: FETCH_BLOGS, payload: res.data });
};

export const fetchBlog = id => async dispatch => {
  const res = await axios.get(`/api/blogs/${id}`);

  dispatch({ type: FETCH_BLOG, payload: res.data });
};

export const searchUsers = query => async dispatch => {
  const res = await axios.get(`/api/users/search?query=${query}`);

  dispatch({ type: SEARCH_USERS, payload: res.data });
};

export const shareBlog = (blogId, userIds, message) => async dispatch => {
  const res = await axios.post(`/api/blogs/${blogId}/share`, { userIds, message });

  dispatch({ type: SHARE_BLOG, payload: res.data });
};

export const fetchSharedBlogs = () => async dispatch => {
  const res = await axios.get('/api/blogs/shared');

  dispatch({ type: FETCH_SHARED_BLOGS, payload: res.data });
};

export const fetchBlogShares = blogId => async dispatch => {
  const res = await axios.get(`/api/blogs/${blogId}/shares`);

  dispatch({ type: FETCH_BLOG_SHARES, payload: res.data });
};

export const unshareBlogs = (blogId, userId) => async dispatch => {
  await axios.delete(`/api/blogs/${blogId}/unshare`, { data: { userId } });
  
  // Refetch the blog shares after unsharing
  dispatch(fetchBlogShares(blogId));
};
