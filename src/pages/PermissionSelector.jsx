import React, { useState } from 'react';
import Select from 'react-select';

const PermissionSelector = () => {
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Your permission options
  const permissionOptions = [
    { value: 'create_user', label: 'Create User' },
    { value: 'read_user', label: 'Read User' },
    { value: 'update_user', label: 'Update User' },
    { value: 'delete_user', label: 'Delete User' },
    { value: 'create_post', label: 'Create Post' },
    { value: 'read_post', label: 'Read Post' },
    { value: 'update_post', label: 'Update Post' },
    { value: 'delete_post', label: 'Delete Post' },
    { value: 'manage_roles', label: 'Manage Roles' },
    { value: 'view_analytics', label: 'View Analytics' },
    { value: 'system_config', label: 'System Configuration' },
    { value: 'backup_manage', label: 'Manage Backups' },
    // Add more permissions as needed
  ];

  const handlePermissionChange = (selectedOptions) => {
    setSelectedPermissions(selectedOptions);
    // Extract just the values if needed for your form
    const permissionValues = selectedOptions.map(option => option.value);
    console.log('Selected permissions:', permissionValues);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '20px 0' }}>
      <label htmlFor="permission-select">Select Permissions:</label>
      <Select
        id="permission-select"
        isMulti
        options={permissionOptions}
        value={selectedPermissions}
        onChange={handlePermissionChange}
        placeholder="Choose permissions..."
        isSearchable
        closeMenuOnSelect={false}
      />
    </div>
  );
};

export default PermissionSelector;