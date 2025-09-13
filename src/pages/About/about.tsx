import React from 'react';
import SEO from '../../components/SEO';
import { generateBreadcrumbSchema } from '../../utils/structuredData';
import './about.css';

/**
 * About page component for F3 RVA website
 * Provides detailed information about F3 mission, values, and local community
 * Educates visitors about the F3 movement and Richmond chapter specifics
 */
const AboutPage: React.FC = () => {
  const breadcrumbData = {
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://f3rva.org'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About',
        item: 'https://f3rva.org/about'
      }
    ]
  };

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbData);

  return (
    <div className="about-page-container">
      <SEO
        title="About F3RVA"
        description="Learn about F3RVA's mission, history, and values. Discover how we're transforming men and communities in Richmond, Virginia through fitness, fellowship, and faith."
        keywords={['f3rva', 'about', 'mission', 'history', 'values', 'fitness', 'fellowship', 'faith', 'richmond', 'virginia', 'community', 'men']}
        url="https://f3rva.org/about"
        type="website"
        structuredData={breadcrumbSchema}
      />
      <section className="about-hero-section">
        <div className="hero-content-wrapper">
          <h2 className="about-main-heading">About F3RVA</h2>
          <p className="about-description">
            Transforming men and communities in Richmond, Virginia.
          </p>
        </div>
      </section>

      <section className="mission-statement-section">
        <h3 className="section-main-title">Our Mission</h3>
        <div className="mission-content-wrapper">
          <p className="mission-description">
            The Mission of F3 is to plant, grow, and serve small workout groups for men for 
            the invigoration of male community leadership.
          </p>
        </div>
      </section>

      <section className="history-section">
        <h3 className="section-main-title">Our Story</h3>
        <div className="history-content-wrapper">
          <p className="history-description">
            F3 was founded in Charlotte, North Carolina in 2011 and has since expanded to hundreds 
            of regions across the United States. F3RVA launched in Richmond on 9/20/2014 at Gridiron.
            24 redwoods showed up that day to start a rapidly expanding chapter of F3 in the Richmond
            region.
          </p>
          <p className="history-description">
            What started as a small group of men looking for accountability in fitness has grown 
            into a community that impacts families, workplaces, and neighborhoods throughout 
            the Richmond area.
          </p>
          <p className="history-description">
            Expansion happened quickly, with new workout locations and groups forming throughout the
            Richmond area. All of this was organic, someone lived far away from one of the existing
            workouts, so he took the leadership to start a new workout. Today, F3RVA continues to grow, 
            welcoming men from all walks of life to join in.
          </p>
          <p className="history-description">
            Over the years, there have been many memorable moments and milestones for F3RVA. They
            are too numerous to list here, but when you come to your first workout, you will likely
            hear stories of the Blue Ridge Relay (BRR), The Century Classic, The Corporate Challenge,
            The Ghost Flag, The Podcast, The Sit-n-Sip, The Frozen Triangle, Thanksgiving History Lessons, 
            Chili Cookoffs, and many more.
          </p>
          <p className="history-description">
            These events served as a foundation for the culture that continues to grow within each of
            the nano-regions within F3RVA. Nano-regions is something we coined as well as a part of early
            F3RVA lore as a way to induce competition between the different areas of Richmond.
          </p>
          <p className="history-description">
            Now, F3RVA spans from the West End, the City of Richmond, Mechanicsville, New Kent, North and
            South Chesterfield, and even call our friends in Amelia as a part of our extended F3RVA family.
          </p>
          <p className="history-description">
            Outside of our region, we helped start F3 Hampton Roads and F3 Charlottesville to help expand
            the F3 movement throughout the Commonwealth of Virginia.
          </p>

          <p className="history-description">
            One of the most common questions we get is "What does faith mean?", or "Is this
            a prayer group?" The short answer is no. While faith is an important part of F3,
            we are not a religious organization. We welcome men from all backgrounds and
            beliefs to join us in our mission of self-improvement and community service.
            In this group, faith is believing that the world is bigger than yourself.
          </p>

          <p className="history-description">
            From Richmond to the surrounding counties, our nano regions ensure that 
            no matter where you live or work, there's an F3 workout group nearby. Each nano 
            region operates with its own identity and local leadership while remaining connected 
            to the broader F3RVA family. This structure allows us to maintain the intimate, 
            feel of smaller groups while leveraging the strength and resources of our 
            larger community.
          </p>
        </div>
      </section>

      <section className="values-section">
        <h3 className="section-main-title">F3 Explained</h3>
        <div className="values-grid-container">
          <div className="value-card-item">
            <h4 className="value-title">Fitness</h4>
            <p className="value-description">
              Open to men of any fitness level with peer led workouts designed to be
              challenging for all, while not leaving anyone behind
            </p>
          </div>
          
          <div className="value-card-item">
            <h4 className="value-title">Fellowship</h4>
            <p className="value-description">
              Bonds of genuine friendship are formed in the pre-dawn gloom and strengthened
              through social gatherings, races, and endurance challenges
            </p>
          </div>
          
          <div className="value-card-item">
            <h4 className="value-title">Faith</h4>
            <p className="value-description">
              Not a religious organization, but we believe we are not the center of the 
              universe and challenge each other to live for somethign bigger than ourselves
            </p>
          </div>
        </div>
      </section>
      {/* <section className="values-section">
        <h3 className="section-main-title">Our Values</h3>
        <div className="values-grid-container">
          <div className="value-card-item">
            <h4 className="value-title">Leadership</h4>
            <p className="value-description">
              Every man is encouraged to step up and lead, whether in workouts, 
              community service, or daily life.
            </p>
          </div>
          
          <div className="value-card-item">
            <h4 className="value-title">Accountability</h4>
            <p className="value-description">
              We challenge each other to show up, work hard, and be better 
              versions of ourselves every day.
            </p>
          </div>
          
          <div className="value-card-item">
            <h4 className="value-title">Service</h4>
            <p className="value-description">
              We serve our families, communities, and each other through 
              acts of service and leadership.
            </p>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default AboutPage;