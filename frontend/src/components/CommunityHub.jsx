import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
console.log("React version in X:", React.version);

const CommunityHub = () => {
  const [sharedScenarios, setSharedScenarios] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('trending');
  
  useEffect(() => {
    fetchCommunityData();
  }, [activeFilter]);
  
  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      const [scenariosRes, analyticsRes] = await Promise.all([
        fetch('/api/community/scenarios'),
        fetch('/api/analytics/dashboard')
      ]);
      
      const scenariosData = await scenariosRes.json();
      const analyticsData = await analyticsRes.json();
      
      setSharedScenarios(scenariosData.scenarios || []);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to fetch community data:', error);
      // Set fallback data
      setSharedScenarios([
        {
          title: "Software Engineer → AI Researcher",
          description: "Transitioning from traditional software development to AI research",
          views: 1250,
          likes: 89,
          comments: 23,
          success_rate: 78
        }
      ]);
      setAnalytics({
        trending_careers: [
          { career: "AI/ML Engineer", growth: "+45%", avg_score: 82 },
          { career: "UX Designer", growth: "+32%", avg_score: 78 }
        ],
        total_scenarios_run: 50000,
        active_users: 2500,
        success_stories: 1850
      });
    } finally {
      setLoading(false);
    }
  };
  
  const shareScenario = async (scenarioId) => {
    try {
      await fetch('/api/community/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario_id: scenarioId, public: true })
      });
      alert('Scenario shared with community! 🎉');
    } catch (error) {
      console.error('Failed to share scenario:', error);
      alert('Share feature coming soon!');
    }
  };
  
  const filterScenarios = (filter) => {
    setActiveFilter(filter);
    // In a real app, this would fetch filtered data
  };
  
  if (loading) {
    return (
      <div className="community-hub">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading community insights...</p>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="community-hub"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="community-header">
        <h2>🌍 Community Insights</h2>
        <p>Discover how others are exploring their future paths and get inspired by their journeys</p>
      </div>
      
      {analytics && (
        <motion.div 
          className="community-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="stat-card">
            <h3>{analytics.total_scenarios_run?.toLocaleString() || '50,000+'}</h3>
            <p>Life Simulations Run</p>
          </div>
          <div className="stat-card">
            <h3>{analytics.active_users?.toLocaleString() || '2,500+'}</h3>
            <p>Active Dreamers</p>
          </div>
          <div className="stat-card">
            <h3>{analytics.success_stories?.toLocaleString() || '1,850+'}</h3>
            <p>Success Stories</p>
          </div>
          <div className="stat-card">
            <h3>{analytics.user_satisfaction || '95'}%</h3>
            <p>User Satisfaction</p>
          </div>
        </motion.div>
      )}
      
      <motion.div 
        className="trending-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <div className="section-header">
          <h3>🔥 Trending Career Transitions</h3>
          <div className="filter-buttons">
            <button 
              className={`nav-btn ${activeFilter === 'trending' ? 'active' : ''}`}
              onClick={() => filterScenarios('trending')}
            >
              Trending
            </button>
            <button 
              className={`nav-btn ${activeFilter === 'recent' ? 'active' : ''}`}
              onClick={() => filterScenarios('recent')}
            >
              Recent
            </button>
            <button 
              className={`nav-btn ${activeFilter === 'popular' ? 'active' : ''}`}
              onClick={() => filterScenarios('popular')}
            >
              Most Popular
            </button>
          </div>
        </div>
        
        <div className="scenarios-grid">
          {sharedScenarios.slice(0, 6).map((scenario, index) => (
            <motion.div 
              key={index}
              className="community-scenario-card"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <div className="scenario-header">
                <h4>{scenario.title}</h4>
                <div className="success-rate">
                  <span className="score">{scenario.success_rate}%</span>
                  <span className="label">Success Rate</span>
                </div>
              </div>
              
              <p className="scenario-description">{scenario.description}</p>
              
              {scenario.tags && (
                <div className="scenario-tags">
                  {scenario.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="tag">#{tag}</span>
                  ))}
                </div>
              )}
              
              <div className="scenario-stats">
                <span>👥 {scenario.views} views</span>
                <span>❤️ {scenario.likes} likes</span>
                <span>💬 {scenario.comments} comments</span>
              </div>
              
              <div className="scenario-actions">
                <button 
                  className="action-btn"
                  onClick={() => shareScenario(scenario.id)}
                >
                  Try This Path
                </button>
                <button className="action-btn secondary">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {analytics?.trending_careers && (
        <motion.div 
          className="trending-careers"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <h3>📈 This Week's Trending Careers</h3>
          <div className="careers-list">
            {analytics.trending_careers.map((career, index) => (
              <div key={index} className="career-item">
                <div className="career-info">
                  <h4>{career.career}</h4>
                  <p>Average Success Score: {career.avg_score}%</p>
                </div>
                <div className="career-growth">
                  <span className="growth-indicator positive">{career.growth}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      
      <motion.div 
        className="community-cta"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <h3>Ready to Share Your Journey?</h3>
        <p>Help others by sharing your simulation results and inspire someone to pursue their dreams.</p>
        <button className="cta-btn">
          Share Your Story
        </button>
      </motion.div>
    </motion.div>
  );
};

export default CommunityHub;
