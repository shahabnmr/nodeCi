import React, { Component } from 'react';
import { connect } from 'react-redux';
import { shareBlog } from '../../actions';
import UserSearch from './UserSearch';

class ShareModal extends Component {
  state = {
    selectedUsers: [],
    message: '',
    isSharing: false
  };

  handleUserSelect = (users) => {
    this.setState({ selectedUsers: users });
  };

  handleMessageChange = (e) => {
    this.setState({ message: e.target.value });
  };

  handleShare = async () => {
    const { selectedUsers, message } = this.state;
    const { blogId, onShare } = this.props;
    
    if (selectedUsers.length === 0) {
      alert('Please select at least one user to share with');
      return;
    }

    this.setState({ isSharing: true });
    
    try {
      const userIds = selectedUsers.map(user => user._id);
      await this.props.shareBlog(blogId, userIds, message);
      
      alert(`Blog shared with ${selectedUsers.length} user(s)!`);
      this.setState({ selectedUsers: [], message: '' });
      if (onShare) onShare();
    } catch (error) {
      alert('Failed to share blog. Please try again.');
    }
    
    this.setState({ isSharing: false });
  };

  render() {
    const { isOpen, onClose } = this.props;
    const { message, isSharing, selectedUsers } = this.state;

    if (!isOpen) return null;

    return (
      <div className="modal-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div className="modal-content" style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <h4>Share Blog Post</h4>
          
          <UserSearch onUserSelect={this.handleUserSelect} />
          
          <div className="input-field" style={{ marginTop: '20px' }}>
            <textarea
              placeholder="Add an optional message..."
              value={message}
              onChange={this.handleMessageChange}
              rows="3"
              style={{ 
                width: '100%', 
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            <label className="active">Message (Optional)</label>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '10px',
            marginTop: '20px'
          }}>
            <button 
              className="btn-flat"
              onClick={onClose}
              disabled={isSharing}
            >
              Cancel
            </button>
            <button 
              className="btn"
              onClick={this.handleShare}
              disabled={isSharing || selectedUsers.length === 0}
            >
              {isSharing ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(null, { shareBlog })(ShareModal);