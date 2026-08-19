import React from 'react';
import BigDataPageHeader from '../../../components/BigDataPageHeader';
import SEO from '../../../components/SEO';
import '../BigData.css';

const AdminAliasRequests: React.FC = () => {
  return (
    <>
      <SEO
        title="Alias Claim Requests - F3 RVA Admin"
        description="Review, approve, or reject member alias claims."
        url="https://f3rva.org/bigdata/admin/alias-requests"
        type="website"
      />
      <div className="bigdata-page-container">
        <BigDataPageHeader
          title="Pending Alias Requests"
          description="Review and approve member alias claims to merge duplicate PAX records."
          category="ADMIN"
        />
        <div className="bigdata-card">
          <p style={{ color: '#a0a0a0', margin: 0 }}>Admin alias requests review queue loading...</p>
        </div>
      </div>
    </>
  );
};

export default AdminAliasRequests;
