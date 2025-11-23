import React, { useState, useEffect } from 'react';
import OfficialLayout from '../../layouts/official_layout';
import LogLayout from '../../layouts/login_logs/log_layout';


const OfficialLogPage = () => {

    return (
        <OfficialLayout>
            <LogLayout />
        </OfficialLayout>
    );
};

export default OfficialLogPage;