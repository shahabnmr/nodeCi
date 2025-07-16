import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchBlog } from '../../actions';
import ShareModal from './ShareModal';

class BlogShow extends Component {
  state = {
    shareModalOpen: false
  };

  componentDidMount() {
    this.props.fetchBlog(this.props.match.params._id);
  }

  handleShareClick = () => {
    this.setState({ shareModalOpen: true });
  };

  handleCloseShareModal = () => {
    this.setState({ shareModalOpen: false });
  };

  handleShareSuccess = () => {
    this.handleCloseShareModal();
  };

  render() {
    if (!this.props.blog) {
      return '';
    }

    const { title, content, isShared, sharedBy, shareMessage } = this.props.blog;
    const { shareModalOpen } = this.state;
    const blogId = this.props.match.params._id;

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>{title}</h3>
          {!isShared && (
            <button 
              className="btn" 
              onClick={this.handleShareClick}
            >
              Share Post
            </button>
          )}
        </div>
        
        {isShared && (
          <div style={{ 
            backgroundColor: '#e3f2fd', 
            padding: '15px', 
            borderRadius: '4px',
            marginBottom: '20px',
            borderLeft: '4px solid #2196f3'
          }}>
            <strong>Shared by:</strong> {sharedBy?.displayName}
            {shareMessage && (
              <div style={{ marginTop: '8px' }}>
                <strong>Message:</strong> {shareMessage}
              </div>
            )}
          </div>
        )}
        
        <p style={{ fontSize: '16px', lineHeight: '1.6' }}>{content}</p>
        
        <ShareModal
          isOpen={shareModalOpen}
          blogId={blogId}
          onClose={this.handleCloseShareModal}
          onShare={this.handleShareSuccess}
        />
      </div>
    );
  }
}

function mapStateToProps({ blogs }, ownProps) {
  const blogId = ownProps.match.params._id;
  return { 
    blog: blogs.blogs ? blogs.blogs[blogId] : null
  };
}

export default connect(mapStateToProps, { fetchBlog })(BlogShow);
