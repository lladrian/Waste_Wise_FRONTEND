import React, { useState, useEffect } from 'react';
import OfficialLayout from '../../layouts/official_layout';
import ProfileLayout from '../../layouts/profiles/profile_layout';


const OfficialUpdateProfilePage = () => {

    return (
        <OfficialLayout>
            <ProfileLayout />
        </OfficialLayout>
    );
};

export default OfficialUpdateProfilePage;