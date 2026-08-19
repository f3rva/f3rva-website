import React from 'react';
import BigDataPageHeader from '../../../components/BigDataPageHeader';
import SEO from '../../../components/SEO';
import '../BigData.css';

const AdminManagePax: React.FC = () => {
  return (
    <>
      <SEO
        title="Manage PAX & Merger - F3 RVA Admin"
        description="Directly merge duplicate member entities and browse member directory."
        url="https://f3rva.org/bigdata/admin/manage-pax"
        type="website"
      />
      <div className="bigdata-page-container">
        <BigDataPageHeader
          title="Manage PAX & Direct Merger"
          description="Search the member directory and merge duplicate member entities directly."
          category="ADMIN"
        />
        <div className="bigdata-card">
          <p style={{ color: '#a0a0a0', margin: 0 }}>Direct PAX merger tool loading...</p>
        </div>
      </div>
    </>
  );
};

export default AdminManagePax;
