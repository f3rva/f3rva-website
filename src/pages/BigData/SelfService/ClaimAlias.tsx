import React from 'react';
import BigDataPageHeader from '../../../components/BigDataPageHeader';
import SEO from '../../../components/SEO';
import '../BigData.css';

const ClaimAlias: React.FC = () => {
  return (
    <>
      <SEO
        title="Claim Member Alias - F3 RVA Self-Service"
        description="Associate an alternate F3 name or duplicate record with your primary profile."
        url="https://f3rva.org/bigdata/claim-alias"
        type="website"
      />
      <div className="bigdata-page-container">
        <BigDataPageHeader
          title="Claim Member Alias"
          description="Link an alternate nickname or duplicate attendance record to your primary F3 member profile."
          category="SELF-SERVICE"
        />
        <div className="bigdata-card">
          <p style={{ color: '#a0a0a0', margin: 0 }}>Self-service alias claim form loading...</p>
        </div>
      </div>
    </>
  );
};

export default ClaimAlias;
