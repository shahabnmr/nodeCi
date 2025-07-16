import React, { Component } from 'react';
import map from 'lodash/map';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchBlogs } from '../../actions';
import ShareModal from './ShareModal';

class BlogList extends Component {
  state = {
    shareModalOpen: false,
    selectedBlogId: null
  };

  componentDidMount() {
    this.props.fetchBlogs();
  }

  handleShareClick = (blogId) => {
    this.setState({
      shareModalOpen: true,
      selectedBlogId: blogId
    });
  };

  handleCloseShareModal = () => {
    this.setState({
      shareModalOpen: false,
      selectedBlogId: null
    });
  };

  handleShareSuccess = () => {
    this.handleCloseShareModal();
  };

  renderBlogs() {
    return map(this.props.blogs, blog => {
      return (
        <div className="card darken-1 horizontal" key={blog._id}>
          <div className="card-stacked">
            <div className="card-content">
              <span className="card-title">
                {blog.title}
                {blog.isShared && (
                  <span 
                    className="new badge blue" 
                    data-badge-caption=""
                    style={{ marginLeft: '10px', fontSize: '10px' }}
                  >
                    Shared by {blog.sharedBy?.displayName}
                  </span>
                )}
              </span>
              <p>{blog.content}</p>
              {blog.shareMessage && (
                <div style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '8px', 
                  borderRadius: '4px',
                  marginTop: '10px',
                  fontSize: '14px',
                  fontStyle: 'italic'
                }}>
                  <strong>Share message:</strong> {blog.shareMessage}
                </div>
              )}
            </div>
            <div className="card-action">
              <Link to={`/blogs/${blog._id}`}>Read</Link>
              {!blog.isShared && (
                <a 
                  href="#!"
                  onClick={() => this.handleShareClick(blog._id)}
                  style={{ marginLeft: '10px' }}
                >
                  Share
                </a>
              )}
            </div>
          </div>
        </div>
      );
    });
  }

  render() {
    const { shareModalOpen, selectedBlogId } = this.state;
    
    return (
      <div>
        {this.renderBlogs()}
        <ShareModal
          isOpen={shareModalOpen}
          blogId={selectedBlogId}
          onClose={this.handleCloseShareModal}
          onShare={this.handleShareSuccess}
        />
      </div>
    );
  }
}

function mapStateToProps({ blogs }) {
  return { 
    blogs: Object.values(blogs.blogs || {})
  };
}

export default connect(mapStateToProps, { fetchBlogs })(BlogList);
