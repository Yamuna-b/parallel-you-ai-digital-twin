import React, { useState } from 'react';
import { motion } from 'framer-motion';
console.log("React version in X:", React.version);

const TechnicalDocumentation = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    {
      id: 'overview',
      title: 'Technical Overview',
      icon: '🏗️',
      content: {
        title: 'Parallel You: AI-Generated Personalized Reality Simulator',
        subtitle: 'First Comprehensive Personal Digital Twin for Life Simulation',
        description: 'Unlike existing digital twins that model machines or processes, Parallel You creates the first comprehensive personal digital twin for life scenario simulation with multi-domain life modeling, branching scenario engine, and hybrid prediction framework.',
        features: [
          'Multi-domain life modeling: Career, health, relationships, education, finances',
          'Branching scenario engine: AI-powered alternate timeline generation',
          'Hybrid prediction framework: Statistical models + LLM narrative generation',
          'Interactive visualization: Real-time life path comparison and analysis',
          'Actionable feedback system: Personalized recommendations based on optimal outcomes'
        ]
      }
    },
    {
      id: 'architecture',
      title: 'System Architecture',
      icon: '⚙️',
      content: {
        title: 'Digital Twin Platform Stack Architecture',
        description: 'Following the Digital Twin Consortium\'s Platform Stack Architectural Framework',
        layers: [
          {
            name: 'Application Layer',
            description: 'Frontend, Visualization, User Interface',
            technologies: ['React.js 18+ with TypeScript', 'Framer Motion for animations', 'Chart.js/D3.js for visualization', 'Three.js for 3D visualization']
          },
          {
            name: 'Service Layer / APIs',
            description: 'Scenario Engine, ML Models, Authentication',
            technologies: ['Flask/FastAPI backend', 'RESTful APIs', 'WebSocket for real-time features', 'JWT authentication']
          },
          {
            name: 'Virtual Representation',
            description: 'Digital Twin Core, Life Models',
            technologies: ['Life simulation engine', 'ML prediction models', 'Scenario branching logic', 'Narrative generation']
          },
          {
            name: 'IT/OT Infrastructure',
            description: 'Cloud Services, Databases, Security',
            technologies: ['AWS Lambda serverless', 'MongoDB/DynamoDB', 'Amazon SageMaker ML', 'CloudFront CDN']
          }
        ]
      }
    },
    {
      id: 'research',
      title: 'Research Foundation',
      icon: '🔬',
      content: {
        title: 'Scientific Research & Technical Foundation',
        description: 'Based on extensive research from leading institutions and industry standards',
        research: [
          {
            institution: 'MIT Future You Project',
            description: 'Interactive digital twin for self-reflection and life planning',
            impact: 'Proven reduction in decision anxiety through scenario exploration'
          },
          {
            institution: 'Digital Twin Healthcare Applications',
            description: 'Personalized medicine and patient modeling research',
            impact: 'Foundation for personal health outcome prediction'
          },
          {
            institution: 'AI Life Simulation Research',
            description: 'Automated artificial life discovery using foundation models',
            impact: 'Advanced AI techniques for life path generation'
          },
          {
            institution: 'Digital Twin Maturity Models',
            description: 'IEEE and industry frameworks for digital twin implementation',
            impact: 'Industry-standard architectural guidelines'
          }
        ],
        standards: [
          'IEEE Digital Twin Standards 2025 - Architecture and interoperability guidelines',
          'Digital Twin Consortium Platform Stack - Industry-standard architectural framework',
          'AWS Digital Twin Framework - Cloud implementation best practices',
          'Industrial IoT Consortium Core Models - Standardized digital twin interfaces'
        ]
      }
    },
    {
      id: 'ai_ml',
      title: 'AI/ML Implementation',
      icon: '🤖',
      content: {
        title: 'Artificial Intelligence & Machine Learning Pipeline',
        description: 'Advanced ML models for life outcome prediction and narrative generation',
        models: [
          {
            name: 'Career Path Predictor',
            type: 'Random Forest Regressor',
            purpose: 'Predict salary and satisfaction outcomes',
            features: ['Education level', 'Experience', 'Skills', 'Location', 'Industry trends']
          },
          {
            name: 'Health Outcome Model',
            type: 'Neural Network',
            purpose: 'Predict health and wellness outcomes',
            features: ['Lifestyle factors', 'Genetic predisposition', 'Environmental factors', 'Medical history']
          },
          {
            name: 'Financial Planning Engine',
            type: 'Time Series Analysis',
            purpose: 'Predict financial outcomes and investment returns',
            features: ['Income trajectory', 'Spending patterns', 'Market conditions', 'Life events']
          },
          {
            name: 'Narrative Generator',
            type: 'Large Language Model',
            purpose: 'Generate personalized life stories and journal entries',
            model: 'GPT-3.5/4 or HuggingFace Transformers',
            features: ['Personal context', 'Predicted outcomes', 'Emotional tone', 'Writing style']
          }
        ],
        dataSources: [
          'Bureau of Labor Statistics (BLS) career data',
          'World Health Organization (WHO) health metrics',
          'Federal Reserve economic indicators',
          'Census Bureau demographic data',
          'Academic research databases'
        ]
      }
    },
    {
      id: 'cloud',
      title: 'Cloud Infrastructure',
      icon: '☁️',
      content: {
        title: 'AWS Cloud Deployment Architecture',
        description: 'Scalable, secure, and cost-effective cloud infrastructure',
        services: [
          {
            service: 'AWS Lambda',
            purpose: 'Serverless scenario processing',
            benefits: ['Auto-scaling', 'Pay-per-use', 'High availability']
          },
          {
            service: 'Amazon SageMaker',
            purpose: 'ML model hosting and training',
            benefits: ['Model versioning', 'A/B testing', 'Auto-scaling inference']
          },
          {
            service: 'Amazon DynamoDB',
            purpose: 'User profiles and scenario storage',
            benefits: ['NoSQL scalability', 'Global replication', 'Point-in-time recovery']
          },
          {
            service: 'Amazon S3',
            purpose: 'File storage (images, exports, 3D models)',
            benefits: ['99.999999999% durability', 'Global accessibility', 'Cost-effective']
          },
          {
            service: 'AWS API Gateway',
            purpose: 'RESTful API management',
            benefits: ['Rate limiting', 'Authentication', 'Monitoring']
          },
          {
            service: 'Amazon CloudFront',
            purpose: 'Global content delivery',
            benefits: ['Low latency', 'Global edge locations', 'DDoS protection']
          }
        ],
        security: [
          'AWS IAM for access control',
          'VPC for network isolation',
          'AWS KMS for encryption',
          'AWS WAF for web application firewall',
          'AWS Shield for DDoS protection'
        ]
      }
    },
    {
      id: 'innovation',
      title: 'Innovation & Impact',
      icon: '🚀',
      content: {
        title: 'Scientific Contribution & Societal Impact',
        description: 'Pioneering application of digital twin technology for personal empowerment',
        contributions: [
          {
            area: 'Scientific Contribution',
            items: [
              'First comprehensive personal digital twin for life simulation',
              'Novel hybrid prediction framework combining statistical modeling with narrative AI',
              'Interactive visualization techniques for complex life decision analysis',
              'Privacy-preserving architecture for sensitive personal data'
            ]
          },
          {
            area: 'Societal Impact',
            items: [
              'Democratizes access to life planning and decision support tools',
              'Reduces anxiety through "what-if" scenario exploration (proven by MIT research)',
              'Enables data-driven personal growth and optimization',
              'Bridges gap between digital twin technology and individual empowerment'
            ]
          },
          {
            area: 'Market Potential',
            items: [
              'Personal development market: $13.2B (2023)',
              'Digital twin market: $73.5B by 2030',
              'AI in personalization: $2.8B by 2025',
              'Target: 1M+ users in first year'
            ]
          }
        ]
      }
    }
  ];

  return (
    <div className="technical-documentation">
      <motion.div
        className="docs-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2>Technical Documentation & Research Foundation</h2>
        <p>Comprehensive technical implementation based on industry standards and academic research</p>
      </motion.div>

      <div className="docs-layout">
        <div className="docs-sidebar">
          <nav className="docs-nav">
            {sections.map((section) => (
              <motion.button
                key={section.id}
                className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="nav-icon">{section.icon}</span>
                <span className="nav-title">{section.title}</span>
              </motion.button>
            ))}
          </nav>
        </div>

        <div className="docs-content">
          <motion.div
            key={activeSection}
            className="content-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {sections.find(s => s.id === activeSection)?.content && (
              <div className="section-content">
                <h3>{sections.find(s => s.id === activeSection).content.title}</h3>
                <p className="section-description">
                  {sections.find(s => s.id === activeSection).content.description}
                </p>

                {/* Render different content based on section */}
                {activeSection === 'overview' && (
                  <div className="features-grid">
                    {sections.find(s => s.id === activeSection).content.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        className="feature-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="feature-icon">✨</div>
                        <p>{feature}</p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeSection === 'architecture' && (
                  <div className="architecture-layers">
                    {sections.find(s => s.id === activeSection).content.layers.map((layer, index) => (
                      <motion.div
                        key={index}
                        className="layer-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <h4>{layer.name}</h4>
                        <p>{layer.description}</p>
                        <div className="technologies">
                          {layer.technologies.map((tech, i) => (
                            <span key={i} className="tech-tag">{tech}</span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeSection === 'research' && (
                  <div className="research-content">
                    <div className="research-studies">
                      <h4>Key Research Studies</h4>
                      {sections.find(s => s.id === activeSection).content.research.map((study, index) => (
                        <motion.div
                          key={index}
                          className="study-card"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <h5>{study.institution}</h5>
                          <p>{study.description}</p>
                          <div className="impact">Impact: {study.impact}</div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="standards">
                      <h4>Technical Standards</h4>
                      <ul>
                        {sections.find(s => s.id === activeSection).content.standards.map((standard, index) => (
                          <li key={index}>{standard}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeSection === 'ai_ml' && (
                  <div className="ml-models">
                    {sections.find(s => s.id === activeSection).content.models.map((model, index) => (
                      <motion.div
                        key={index}
                        className="model-card"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <h4>{model.name}</h4>
                        <div className="model-type">{model.type}</div>
                        <p>{model.purpose}</p>
                        <div className="features">
                          <strong>Features:</strong>
                          <ul>
                            {model.features.map((feature, i) => (
                              <li key={i}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeSection === 'cloud' && (
                  <div className="cloud-services">
                    {sections.find(s => s.id === activeSection).content.services.map((service, index) => (
                      <motion.div
                        key={index}
                        className="service-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <h4>{service.service}</h4>
                        <p className="purpose">{service.purpose}</p>
                        <div className="benefits">
                          {service.benefits.map((benefit, i) => (
                            <span key={i} className="benefit-tag">{benefit}</span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeSection === 'innovation' && (
                  <div className="innovation-content">
                    {sections.find(s => s.id === activeSection).content.contributions.map((contribution, index) => (
                      <motion.div
                        key={index}
                        className="contribution-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <h4>{contribution.area}</h4>
                        <ul>
                          {contribution.items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalDocumentation;
