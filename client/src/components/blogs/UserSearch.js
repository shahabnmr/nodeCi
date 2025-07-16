import React, { Component } from 'react';
import { connect } from 'react-redux';
import { searchUsers } from '../../actions';

class UserSearch extends Component {
  state = {
    query: '',
    selectedUsers: []
  };

  handleSearchChange = (e) => {
    const query = e.target.value;
    this.setState({ query });
    
    if (query.length >= 2) {
      this.props.searchUsers(query);
    }
  };

  handleUserSelect = (user) => {
    const { selectedUsers } = this.state;
    if (!selectedUsers.find(u => u._id === user._id)) {
      this.setState({
        selectedUsers: [...selectedUsers, user],
        query: ''
      });
      this.props.onUserSelect([...selectedUsers, user]);
    }
  };

  handleUserRemove = (userId) => {
    const selectedUsers = this.state.selectedUsers.filter(u => u._id !== userId);
    this.setState({ selectedUsers });
    this.props.onUserSelect(selectedUsers);
  };

  renderSearchResults() {
    const { searchedUsers } = this.props;
    const { query, selectedUsers } = this.state;
    
    if (!query || query.length < 2) return null;

    return (
      <div className="search-results" style={{ 
        position: 'absolute', 
        background: 'white', 
        border: '1px solid #ddd',
        borderRadius: '4px',
        zIndex: 1000,
        width: '100%',
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        {searchedUsers.map(user => {
          const isSelected = selectedUsers.find(u => u._id === user._id);
          return (
            <div 
              key={user._id}
              className={`search-result-item ${isSelected ? 'disabled' : ''}`}
              style={{ 
                padding: '10px', 
                cursor: isSelected ? 'default' : 'pointer',
                backgroundColor: isSelected ? '#f5f5f5' : 'white'
              }}
              onClick={() => !isSelected && this.handleUserSelect(user)}
            >
              {user.displayName} {isSelected && '(Selected)'}
            </div>
          );
        })}
      </div>
    );
  }

  renderSelectedUsers() {
    const { selectedUsers } = this.state;
    
    if (selectedUsers.length === 0) return null;

    return (
      <div className="selected-users" style={{ marginBottom: '10px' }}>
        <p style={{ fontSize: '14px', color: '#666' }}>Selected Users:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {selectedUsers.map(user => (
            <div 
              key={user._id}
              className="chip"
              style={{
                backgroundColor: '#26a69a',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '16px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {user.displayName}
              <span 
                style={{ cursor: 'pointer', fontWeight: 'bold' }}
                onClick={() => this.handleUserRemove(user._id)}
              >
                ×
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div style={{ position: 'relative' }}>
        {this.renderSelectedUsers()}
        <div className="input-field">
          <input
            type="text"
            placeholder="Search for users to share with..."
            value={this.state.query}
            onChange={this.handleSearchChange}
          />
          <label className="active">Search Users</label>
        </div>
        {this.renderSearchResults()}
      </div>
    );
  }
}

function mapStateToProps({ blogs }) {
  return { 
    searchedUsers: blogs.searchedUsers || []
  };
}

export default connect(mapStateToProps, { searchUsers })(UserSearch);