import React from 'react';
import BigDataPageHeader from '../../../components/BigDataPageHeader';
import SEO from '../../../components/SEO';
import '../BigData.css';

const AdminLogin: React.FC = () => {
  return (
    <>
      <SEO
        title="Admin Login - F3 RVA Big Data"
        description="Authenticate to access protected administrator tools."
        url="https://f3rva.org/bigdata/admin/login"
        type="website"
      />
      <div className="bigdata-page-container">
        <BigDataPageHeader
          title="Administrator Login"
          description="Sign in with your administrator credentials to review alias claims and manage PAX records."
          category="ADMIN"
        />
        <div className="bigdata-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <p style={{ color: '#a0a0a0', margin: 0 }}>Admin login form loading...</p>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
