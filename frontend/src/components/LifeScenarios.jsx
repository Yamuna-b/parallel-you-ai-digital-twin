import React, { useState } from 'react';
import { motion } from 'framer-motion';

const LifeScenarios = ({ onScenarioSelect = () => {} }) => {
  const [selectedScenario, setSelectedScenario] = useState(null);

  const scenarios = [
    {
      id: 'health_wellness',
      name: 'Health & Wellness Path',
      icon: '🏃‍♂️',
      description: 'Simulate adopting healthy habits, sports, or routines and their life effects',
      difficulty: 'Easy',
      category: 'Personal Development',
      color: '#10b981',
      details: {
        variables: ['Exercise frequency', 'Diet quality', 'Sleep patterns', 'Stress management'],
        outcomes: ['Life expectancy', 'Energy levels', 'Medical costs', 'Quality of life'],
        timeframe: '3-12 months',
        research: 'Based on Harvard Health Study and WHO guidelines'
      }
    },
    {
      id: 'relationship_decisions',
      name: 'Relationship Decisions',
      icon: '💕',
      description: 'Explore outcomes of relationship choices—moving in, marriage, family planning',
      difficulty: 'Medium',
      category: 'Social Life',
      color: '#ec4899',
      details: {
        variables: ['Relationship status', 'Living arrangements', 'Family planning', 'Social network'],
        outcomes: ['Relationship satisfaction', 'Financial impact', 'Life stability', 'Personal growth'],
        timeframe: '1-5 years',
        research: 'Based on relationship psychology research and demographic studies'
      }
    },
    {
      id: 'financial_milestones',
      name: 'Financial Milestones',
      icon: '💰',
      description: 'What if you invest early vs. late? Buy or rent? Major life purchases',
      difficulty: 'Medium',
      category: 'Financial Planning',
      color: '#f59e0b',
      details: {
        variables: ['Investment strategy', 'Housing decisions', 'Career income', 'Spending habits'],
        outcomes: ['Net worth', 'Retirement readiness', 'Financial freedom', 'Risk tolerance'],
        timeframe: '5-30 years',
        research: 'Based on financial planning models and economic forecasting'
      }
    },
    {
      id: 'global_mobility',
      name: 'Global Mobility',
      icon: '🌍',
      description: 'Simulate working or living abroad, immigration scenarios',
      difficulty: 'Hard',
      category: 'Career & Location',
      color: '#06b6d4',
      details: {
        variables: ['Destination country', 'Visa status', 'Language skills', 'Cultural adaptation'],
        outcomes: ['Career opportunities', 'Cultural exposure', 'Financial impact', 'Personal growth'],
        timeframe: '2-10 years',
        research: 'Based on immigration data and expat success studies'
      }
    },
    {
      id: 'life_setbacks',
      name: 'Major Life Setbacks',
      icon: '🛡️',
      description: 'What if you face job loss, illness, or market crashes? Resilience paths',
      difficulty: 'Hard',
      category: 'Crisis Management',
      color: '#ef4444',
      details: {
        variables: ['Emergency fund', 'Support network', 'Skills backup', 'Mental resilience'],
        outcomes: ['Recovery time', 'Personal growth', 'New opportunities', 'Life lessons'],
        timeframe: '6 months - 3 years',
        research: 'Based on resilience psychology and crisis recovery studies'
      }
    },
    {
      id: 'passion_projects',
      name: 'Passion Project/Creativity',
      icon: '🎨',
      description: 'Focus on hobby, art, or passion—how it shapes life, happiness, career',
      difficulty: 'Easy',
      category: 'Personal Fulfillment',
      color: '#8b5cf6',
      details: {
        variables: ['Time investment', 'Skill development', 'Market potential', 'Personal satisfaction'],
        outcomes: ['Creative fulfillment', 'Side income', 'Career pivot', 'Life satisfaction'],
        timeframe: '6 months - 5 years',
        research: 'Based on creativity research and entrepreneurial studies'
      }
    },
    {
      id: 'retirement_legacy',
      name: 'Retirement & Legacy',
      icon: '👴',
      description: 'Early/late retirement, volunteering, legacy planning outcomes',
      difficulty: 'Medium',
      category: 'Long-term Planning',
      color: '#6b7280',
      details: {
        variables: ['Retirement age', 'Savings rate', 'Volunteer work', 'Estate planning'],
        outcomes: ['Retirement security', 'Life purpose', 'Family impact', 'Community contribution'],
        timeframe: '10-50 years',
        research: 'Based on retirement planning models and longevity studies'
      }
    },
    {
      id: 'climate_environment',
      name: 'Climate & Environment',
      icon: '🌱',
      description: 'Choices with long-term eco/sustainability impacts',
      difficulty: 'Medium',
      category: 'Environmental Impact',
      color: '#059669',
      details: {
        variables: ['Carbon footprint', 'Sustainable choices', 'Green investments', 'Lifestyle changes'],
        outcomes: ['Environmental impact', 'Cost savings', 'Health benefits', 'Future readiness'],
        timeframe: '1-20 years',
        research: 'Based on climate science and sustainability research'
      }
    },
    {
      id: 'tech_adoption',
      name: 'Tech Adoption Curve',
      icon: '🤖',
      description: 'How using or avoiding new tech affects career and lifestyle',
      difficulty: 'Easy',
      category: 'Technology',
      color: '#3b82f6',
      details: {
        variables: ['Tech adoption rate', 'Learning investment', 'Career relevance', 'Digital lifestyle'],
        outcomes: ['Career competitiveness', 'Efficiency gains', 'Learning curve', 'Future readiness'],
        timeframe: '1-5 years',
        research: 'Based on technology adoption studies and digital transformation research'
      }
    },
    {
      id: 'social_political',
      name: 'Social/Political Engagement',
      icon: '🗳️',
      description: 'Effects of volunteering, activism, or civic engagement',
      difficulty: 'Medium',
      category: 'Social Impact',
      color: '#dc2626',
      details: {
        variables: ['Volunteer hours', 'Civic participation', 'Social causes', 'Community involvement'],
        outcomes: ['Social impact', 'Network expansion', 'Personal growth', 'Community standing'],
        timeframe: '1-10 years',
        research: 'Based on civic engagement studies and social impact research'
      }
    }
  ];

  const handleScenarioClick = (scenario) => {
    setSelectedScenario(scenario);
    onScenarioSelect(scenario);
  };

  return (
    <div className="life-scenarios">
      <motion.div
        className="scenarios-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2>Interactive Life Scenarios</h2>
        <p>Explore comprehensive life path simulations based on research and data science</p>
        <div className="research-badge">
          <span className="badge-icon">🔬</span>
          <span>Research-Backed Predictions</span>
        </div>
      </motion.div>

      <div className="scenarios-grid">
        {scenarios.map((scenario, index) => (
          <motion.div
            key={scenario.id}
            className={`scenario-card ${selectedScenario?.id === scenario.id ? 'selected' : ''}`}
            style={{ '--scenario-color': scenario.color }}
            onClick={() => handleScenarioClick(scenario)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.05,
              y: -10,
              boxShadow: `0 20px 40px rgba(0,0,0,0.3)`
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="scenario-icon" style={{ color: scenario.color }}>
              {scenario.icon}
            </div>
            <div className="scenario-content">
              <h3>{scenario.name}</h3>
              <p>{scenario.description}</p>
              <div className="scenario-meta">
                <span className={`difficulty difficulty-${scenario.difficulty.toLowerCase()}`}>
                  {scenario.difficulty}
                </span>
                <span className="category">{scenario.category}</span>
              </div>
              <div className="scenario-details">
                <div className="detail-item">
                  <strong>Timeframe:</strong> {scenario.details.timeframe}
                </div>
                <div className="detail-item">
                  <strong>Research:</strong> {scenario.details.research}
                </div>
              </div>
            </div>
            <motion.div
              className="scenario-overlay"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="overlay-content">
                <h4>Key Variables</h4>
                <ul>
                  {scenario.details.variables.map((variable, i) => (
                    <li key={i}>{variable}</li>
                  ))}
                </ul>
                <h4>Predicted Outcomes</h4>
                <ul>
                  {scenario.details.outcomes.map((outcome, i) => (
                    <li key={i}>{outcome}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {selectedScenario && (
        <motion.div
          className="scenario-detail-modal"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div className="modal-content">
            <h3>{selectedScenario.name}</h3>
            <p>{selectedScenario.description}</p>
            <div className="detail-sections">
              <div className="detail-section">
                <h4>Research Foundation</h4>
                <p>{selectedScenario.details.research}</p>
              </div>
              <div className="detail-section">
                <h4>Simulation Variables</h4>
                <ul>
                  {selectedScenario.details.variables.map((variable, i) => (
                    <li key={i}>{variable}</li>
                  ))}
                </ul>
              </div>
              <div className="detail-section">
                <h4>Predicted Outcomes</h4>
                <ul>
                  {selectedScenario.details.outcomes.map((outcome, i) => (
                    <li key={i}>{outcome}</li>
                  ))}
                </ul>
              </div>
            </div>
            <button 
              className="start-simulation-btn"
              onClick={() => onScenarioSelect(selectedScenario)}
            >
              Start {selectedScenario.name} Simulation
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LifeScenarios;
