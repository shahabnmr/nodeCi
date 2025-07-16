import mapKeys from 'lodash/mapKeys';
import { 
  FETCH_BLOGS, 
  FETCH_BLOG, 
  FETCH_SHARED_BLOGS,
  SEARCH_USERS,
  FETCH_BLOG_SHARES
} from '../actions/types';

const initialState = {
  blogs: {},
  sharedBlogs: {},
  searchedUsers: [],
  blogShares: {}
};

export default function(state = initialState, action) {
  switch (action.type) {
    case FETCH_BLOG:
      const blog = action.payload;
      return { 
        ...state, 
        blogs: { ...state.blogs, [blog._id]: blog }
      };
    case FETCH_BLOGS:
      return { 
        ...state, 
        blogs: { ...state.blogs, ...mapKeys(action.payload, '_id') }
      };
    case FETCH_SHARED_BLOGS:
      return {
        ...state,
        sharedBlogs: mapKeys(action.payload, '_id')
      };
    case SEARCH_USERS:
      return {
        ...state,
        searchedUsers: action.payload
      };
    case FETCH_BLOG_SHARES:
      return {
        ...state,
        blogShares: {
          ...state.blogShares,
          [action.payload.blogId]: action.payload
        }
      };
    default:
      return state;
  }
}
