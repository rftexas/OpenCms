import React from "react";
import OrganizationList from "./components/OrganizationList";

const OrganizationScreen: React.FC = () => {
    // TODO: Add role-based logic if needed
    return (
        <div className="container mt-4">
            <h1>Organizations</h1>
            <OrganizationList isSuperUser={true} />
        </div>
    );
};

export default OrganizationScreen;
