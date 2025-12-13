import React, { useState, useEffect } from 'react';
import StaffLayout from '../../../layouts/admin_layout';
import UserRequestApprovalLayout from '../../../layouts/approvals/user_request_approval_layout';


const StaffUserRequestApprovalPage = () => {

    return (
        <StaffLayout>
            <UserRequestApprovalLayout />
        </StaffLayout>
    );
};

export default StaffUserRequestApprovalPage;