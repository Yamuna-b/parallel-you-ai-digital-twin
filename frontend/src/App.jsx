import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import ProfileWizard from './components/ProfileWizard.jsx';
import AnimatedBackground from './components/AnimatedBackground';
import LifeScenarios from './components/LifeScenarios';
import TechnicalDocumentation from './components/TechnicalDocumentation';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    currentCareer: '',
    dreamCareer: '',
    education: '',
    location: '',
    habits: []
  });
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [scenarios, setScenarios] = useState([]);
  const [communityInsights, setCommunityInsights] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authData, setAuthData] = useState({ email: '', password: '', name: '' });
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [showTechnicalDocs, setShowTechnicalDocs] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState(['simulate']);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleHabitToggle = (habit) => {
    setFormData(prev => ({
      ...prev,
      habits: prev.habits.includes(habit)
        ? prev.habits.filter(h => h !== habit)
        : [...prev.habits, habit]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ message: 'Error connecting to simulation engine', score: 0 });
    }
    setIsLoading(false);
  };

  const habits = [
    'Exercise regularly', 'Read daily', 'Meditate', 'Learn new skills',
    'Network actively', 'Save money', 'Travel frequently', 'Volunteer'
  ];

  // Load scenarios and community insights on component mount
  React.useEffect(() => {
    fetchScenarios();
    fetchCommunityInsights();
    checkAuthStatus();
  }, []);

  // Add this effect to clear selectedScenario when tab changes
  React.useEffect(() => {
    setSelectedScenario(null);
  }, [activeTab]);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/auth/status', {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setUser({ user_id: data.user_id, email: data.email });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(authData)
      });
      const data = await res.json();
      
      if (res.ok) {
        setIsAuthenticated(true);
        setUser({ user_id: data.user_id, email: data.email });
        setShowAuthModal(false);
        setAuthData({ email: '', password: '', name: '' });
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (error) {
      alert('Authentication failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const fetchScenarios = async () => {
    try {
      const res = await fetch('http://localhost:5000/scenarios');
      const data = await res.json();
      setScenarios(data.scenarios || []);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
    }
  };

  const fetchCommunityInsights = async () => {
    try {
      const res = await fetch('http://localhost:5000/community/insights');
      const data = await res.json();
      setCommunityInsights(data);
    } catch (error) {
      console.error('Error fetching community insights:', error);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    try {
      const res = await fetch('http://localhost:5000/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: chatMessage,
          user_id: formData.name || 'anonymous'
        })
      });
      const data = await res.json();
      setChatResponse(data.response);
    } catch (error) {
      setChatResponse('Sorry, I had trouble processing your message. Please try again.');
    }
  };

  return (
    <div className="app">
      <AnimatedBackground />
      
      <motion.header 
        className="header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <motion.h1 
            className="logo"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Parallel You
          </motion.h1>
          <ProfileWizard />
          <motion.p 
            className="tagline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            AI-Generated Personalized Reality Simulator
          </motion.p>
          <motion.div 
            className="research-badges"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <span className="badge">🔬 Research-Backed</span>
          </motion.div>
        </div>
      </motion.header>

      {/* Navigation - Hidden on home page */}
      {activeTab !== 'home' && (
        <nav className="nav">
          <div className="container">
            <button 
              className="nav-btn home-btn"
              onClick={() => setActiveTab('home')}
            >
              🏠 Home
            </button>
            <button 
              className={`nav-btn ${activeTab === 'simulate' ? 'active' : ''}`}
              onClick={() => setActiveTab('simulate')}
            >
              🎯 Simulate Life
            </button>
            <button 
              className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Digital Twin Dashboard
            </button>
            <button 
              className={`nav-btn ${activeTab === 'scenarios' ? 'active' : ''}`}
              onClick={() => setActiveTab('scenarios')}
            >
              🎭 Life Scenarios
            </button>
            <button 
              className={`nav-btn ${activeTab === 'community' ? 'active' : ''}`}
              onClick={() => setActiveTab('community')}
            >
              👥 Community
            </button>
            <button 
              className={`nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              🤖 AI Chat
            </button>
            <button 
              className={`nav-btn ${activeTab === 'ar-vr' ? 'active' : ''}`}
              onClick={() => setActiveTab('ar-vr')}
            >
              🥽 AR/VR
            </button>
            <button 
              className={`nav-btn ${activeTab === 'technical' ? 'active' : ''}`}
              onClick={() => setActiveTab('technical')}
            >
              📚 Technical Docs
            </button>
            <button 
              className={`nav-btn ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              ℹ️ About
            </button>
            {!isAuthenticated ? (
              <button 
                className="nav-btn auth-btn"
                onClick={() => setShowAuthModal(true)}
              >
                🔐 Login
              </button>
            ) : (
              <button 
                className="nav-btn auth-btn"
                onClick={handleLogout}
              >
                👤 {user?.email} (Logout)
              </button>
            )}
          </div>
        </nav>
      )}

      <main className="main">
        <div className="container" style={{paddingTop: 0}}>
          {activeTab === 'home' && (
            <motion.div
              className="home-page"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="hero-section">
                <h1 className="hero-title">Welcome to Parallel You</h1>
                <p className="hero-subtitle">AI-Generated Personalized Reality Simulator</p>
                <p className="hero-description">
                  Explore alternate life paths, simulate different career choices, and discover 
                  what your future could look like with the power of AI and digital twin technology.
                </p>
                <div className="hero-actions">
                  <button 
                    className="cta-btn primary"
                    onClick={() => setActiveTab('simulate')}
                  >
                    🚀 Start Your Journey
                  </button>
                  <button 
                    className="cta-btn secondary"
                    onClick={() => setActiveTab('scenarios')}
                  >
                    🎭 Explore Scenarios
                  </button>
                </div>
              </div>
              
              <div className="features-preview">
                <h2>What You Can Do</h2>
                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-icon">🎯</div>
                    <h3>Life Simulation</h3>
                    <p>Simulate different career paths, education choices, and life decisions</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🤖</div>
                    <h3>AI-Powered Insights</h3>
                    <p>Get personalized recommendations based on data and AI analysis</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🥽</div>
                    <h3>AR/VR Experience</h3>
                    <p>Visualize your future in immersive 3D environments</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">👥</div>
                    <h3>Community Insights</h3>
                    <p>Learn from others' experiences and share your journey</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'simulate' && (
            <div className="simulation-panel">
              <div className="panel-header">
                <h2>Create Your Digital Twin</h2>
                <p>Enter your details to simulate alternate life paths and career outcomes</p>
              </div>

              <form onSubmit={handleSubmit} className="simulation-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Your current age"
                      min="18"
                      max="100"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Current Career</label>
                    <input
                      type="text"
                      name="currentCareer"
                      value={formData.currentCareer}
                      onChange={handleInputChange}
                      placeholder="What do you do now?"
                    />
                  </div>

                  <div className="form-group">
                    <label>Dream Career</label>
                    <input
                      type="text"
                      name="dreamCareer"
                      value={formData.dreamCareer}
                      onChange={handleInputChange}
                      placeholder="What would you love to do?"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Education Level</label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                    >
                      <option value="">Select education level</option>
                      <option value="high-school">High School</option>
                      <option value="associate">Associate Degree</option>
                      <option value="bachelor">Bachelor's Degree</option>
                      <option value="master">Master's Degree</option>
                      <option value="phd">PhD/Doctorate</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="habits-section">
                  <label>Life Habits & Activities</label>
                  <div className="habits-grid">
                    {habits.map(habit => (
                      <label key={habit} className="habit-item">
                        <input
                          type="checkbox"
                          checked={formData.habits.includes(habit)}
                          onChange={() => handleHabitToggle(habit)}
                        />
                        <span>{habit}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="simulate-btn"
                  disabled={isLoading}
                >
                  {isLoading ? '🔄 Simulating...' : '🚀 Simulate My Future'}
                </button>
              </form>

              {result && (
                <div className="result-panel">
                  <h3>Simulation Results</h3>
                  <div className="result-content">
                    <div className="success-score">
                      <div className="score-circle">
                        <span className="score-number">{result.score || 0}</span>
                        <span className="score-label">Success Score</span>
                      </div>
                    </div>
                    <div className="result-message">
                      <p>{result.message}</p>
                      {/* Images/videos support */}
                      {result.media && (
                        <div className="simulation-media">
                          {result.media.map((media, idx) =>
                            media.type === 'image' ? (
                              <img key={idx} src={media.url} alt="Simulation" />
                            ) : (
                              <video key={idx} src={media.url} controls />
                            )
                          )}
                        </div>
                      )}
                      
                      {result.insights && (
                        <div className="insights">
                          <h4>Key Insights:</h4>
                          <div className="insights-grid">
                            <div className="insight-item">
                              <span className="insight-label">Growth Potential:</span>
                              <span className="insight-value">{result.insights.career_growth_potential}</span>
                            </div>
                            <div className="insight-item">
                              <span className="insight-label">Time to Success:</span>
                              <span className="insight-value">{result.insights.time_to_success}</span>
                            </div>
                            <div className="insight-item">
                              <span className="insight-label">Risk Level:</span>
                              <span className="insight-value">{result.insights.risk_level}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {result.recommendations && result.recommendations.length > 0 && (
                        <div className="recommendations">
                          <h4>Actionable Recommendations:</h4>
                          <ul>
                            {result.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {result.simulation_id && (
                        <div className="simulation-id">
                          <small>Simulation ID: {result.simulation_id}</small>
                        </div>
                      )}
                      
                      {result.journal_entry && (
                        <div className="journal-entry">
                          <h4>📖 Digital Twin Journal Entry:</h4>
                          <div className="journal-content">
                            <pre>{result.journal_entry}</pre>
                          </div>
                        </div>
                      )}
                      
                      {result.multimedia_suggestions && result.multimedia_suggestions.length > 0 && (
                        <div className="multimedia-suggestions">
                          <h4>🎨 Multimedia Content Ideas:</h4>
                          <div className="suggestions-grid">
                            {result.multimedia_suggestions.map((suggestion, index) => (
                              <div key={index} className="suggestion-item">
                                {suggestion}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="dashboard">
              <h2>Digital Twin Dashboard</h2>
              <div className="dashboard-grid">
                <div className="metric-card">
                  <h3>Life Satisfaction</h3>
                  <div className="metric-value">87%</div>
                  <div className="metric-trend">↗ +12% this month</div>
                </div>
                <div className="metric-card">
                  <h3>Career Growth</h3>
                  <div className="metric-value">High</div>
                  <div className="metric-trend">↗ Accelerating</div>
                </div>
                <div className="metric-card">
                  <h3>Health Score</h3>
                  <div className="metric-value">92%</div>
                  <div className="metric-trend">↗ +5% this month</div>
                </div>
                <div className="metric-card">
                  <h3>Financial Health</h3>
                  <div className="metric-value">Good</div>
                  <div className="metric-trend">↗ Improving</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scenarios' && (
            <motion.div
              className="scenarios-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <LifeScenarios onScenarioSelect={setSelectedScenario} />
            </motion.div>
          )}

          {activeTab === 'community' && (
            <div className="community">
              <h2>Community Insights</h2>
              <p>See what others are exploring and discover popular career paths.</p>
              
              {communityInsights && (
                <div className="community-stats">
                  <div className="stat-card">
                    <h3>Total Simulations</h3>
                    <div className="stat-number">{communityInsights.total_simulations || 0}</div>
                  </div>
                  
                  {communityInsights.popular_careers && communityInsights.popular_careers.length > 0 && (
                    <div className="popular-careers">
                      <h3>Popular Career Choices</h3>
                      <div className="careers-list">
                        {communityInsights.popular_careers.slice(0, 5).map((career, index) => (
                          <div key={index} className="career-item">
                            <span className="career-name">{career._id || 'Unknown'}</span>
                            <span className="career-count">{career.count} simulations</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {communityInsights.education_impact && Object.keys(communityInsights.education_impact).length > 0 && (
                    <div className="education-impact">
                      <h3>Education Impact on Success</h3>
                      <div className="education-stats">
                        {Object.entries(communityInsights.education_impact).map(([edu, avgScore]) => (
                          <div key={edu} className="education-item">
                            <span className="education-level">{edu.replace('-', ' ').toUpperCase()}</span>
                            <span className="education-score">{avgScore.toFixed(1)}% avg score</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="chat">
              <h2>Chat with Your Digital Twin</h2>
              <p>Have a conversation with your AI digital twin about your future possibilities.</p>
              
              <div className="chat-container">
                <div className="chat-messages">
                  {chatResponse && (
                    <div className="message ai-message">
                      <div className="message-avatar">🤖</div>
                      <div className="message-content">
                        <div className="message-text">{chatResponse}</div>
                        <div className="message-time">{new Date().toLocaleTimeString()}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <form onSubmit={handleChatSubmit} className="chat-input-form">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask your digital twin about your future..."
                    className="chat-input"
                  />
                  <button type="submit" className="chat-send-btn">Send</button>
                </form>
              </div>
              
              <div className="chat-suggestions">
                <h4>Try asking:</h4>
                <div className="suggestion-chips">
                  <button onClick={() => setChatMessage("What career should I choose?")} className="suggestion-chip">
                    What career should I choose?
                  </button>
                  <button onClick={() => setChatMessage("How can I improve my success rate?")} className="suggestion-chip">
                    How can I improve my success rate?
                  </button>
                  <button onClick={() => setChatMessage("What skills should I learn?")} className="suggestion-chip">
                    What skills should I learn?
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ar-vr' && (
            <div className="ar-vr">
              <h2>AR/VR Experience</h2>
              <p>Explore your future in immersive 3D environments and augmented reality.</p>
              
              {result && result.ar_vr_suggestions && (
                <div className="ar-vr-content">
                  <div className="ar-vr-suggestions">
                    <h3>🥽 AR/VR Recommendations</h3>
                    <div className="suggestions-grid">
                      {result.ar_vr_suggestions.map((suggestion, index) => (
                        <div key={index} className="suggestion-card">
                          <div className="suggestion-icon">🥽</div>
                          <p>{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {result.avatar_data && (
                    <div className="avatar-section">
                      <h3>👤 Your 3D Avatar</h3>
                      <div className="avatar-card">
                        <div className="avatar-preview">
                          <div className="avatar-placeholder">
                            <span className="avatar-icon">👤</span>
                            <p>Avatar ID: {result.avatar_data.avatar_id}</p>
                          </div>
                        </div>
                        <div className="avatar-traits">
                          <h4>Personality Traits</h4>
                          <div className="trait-bars">
                            <div className="trait">
                              <span>Confidence</span>
                              <div className="trait-bar">
                                <div 
                                  className="trait-fill" 
                                  style={{width: `${result.avatar_data.personality_traits.confidence}%`}}
                                ></div>
                              </div>
                              <span>{result.avatar_data.personality_traits.confidence}%</span>
                            </div>
                            <div className="trait">
                              <span>Creativity</span>
                              <div className="trait-bar">
                                <div 
                                  className="trait-fill" 
                                  style={{width: `${result.avatar_data.personality_traits.creativity}%`}}
                                ></div>
                              </div>
                              <span>{result.avatar_data.personality_traits.creativity}%</span>
                            </div>
                            <div className="trait">
                              <span>Analytical</span>
                              <div className="trait-bar">
                                <div 
                                  className="trait-fill" 
                                  style={{width: `${result.avatar_data.personality_traits.analytical}%`}}
                                ></div>
                              </div>
                              <span>{result.avatar_data.personality_traits.analytical}%</span>
                            </div>
                            <div className="trait">
                              <span>Social</span>
                              <div className="trait-bar">
                                <div 
                                  className="trait-fill" 
                                  style={{width: `${result.avatar_data.personality_traits.social}%`}}
                                ></div>
                              </div>
                              <span>{result.avatar_data.personality_traits.social}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {!result && (
                <div className="ar-vr-placeholder">
                  <h3>🚀 Ready for AR/VR Experience</h3>
                  <p>Run a simulation first to generate your personalized AR/VR content and 3D avatar!</p>
                  <button 
                    className="simulate-btn"
                    onClick={() => setActiveTab('simulate')}
                  >
                    Start Simulation
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'scenarios' && (
            <motion.div
              className="scenarios-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <LifeScenarios onScenarioSelect={setSelectedScenario} />
            </motion.div>
          )}

          {activeTab === 'technical' && (
            <motion.div
              className="technical-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <TechnicalDocumentation />
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              className="about-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="about-hero">
                <h1>About Parallel You</h1>
                <p className="about-subtitle">Revolutionizing Personal Decision-Making with Digital Twin Technology</p>
              </div>

              <div className="about-sections">
                <section className="about-section">
                  <h2>What is Parallel You?</h2>
                  <p>
                    Parallel You is an innovative AI-powered platform that creates your personal digital twin, 
                    allowing you to simulate alternate life paths and explore "what-if" scenarios. Unlike traditional 
                    digital twins used in industry, we focus on personal life simulation, helping you make informed 
                    decisions about your career, relationships, health, and future.
                  </p>
                  <div className="highlight-box">
                    <h3>Our Mission</h3>
                    <p>To democratize access to life planning tools and empower individuals to make data-driven decisions about their future through AI-powered personal simulation.</p>
                  </div>
                </section>

                <section className="about-section">
                  <h2>Understanding Digital Twins</h2>
                  <p>
                    A digital twin is a virtual representation of a real-world entity that continuously receives 
                    data to mirror, predict, and optimize its behavior. While traditionally used for machines, 
                    factories, or city infrastructure, Parallel You applies this technology to personal life simulation.
                  </p>
                  
                  <div className="digital-twin-levels">
                    <h3>Digital Twin Maturity Levels</h3>
                    <div className="levels-grid">
                      <div className="level-card">
                        <div className="level-number">1</div>
                        <h4>Status</h4>
                        <p>Real-time data capture and visualization</p>
                      </div>
                      <div className="level-card">
                        <div className="level-number">2</div>
                        <h4>Informative</h4>
                        <p>Historical data integration with benchmarking</p>
                      </div>
                      <div className="level-card">
                        <div className="level-number">3</div>
                        <h4>Predictive</h4>
                        <p>ML/physics-based models for future prediction</p>
                      </div>
                      <div className="level-card">
                        <div className="level-number">4</div>
                        <h4>Optimization</h4>
                        <p>Scenario testing and "what-if" analysis</p>
                      </div>
                      <div className="level-card">
                        <div className="level-number">5</div>
                        <h4>Autonomous</h4>
                        <p>Self-optimizing systems with automated decisions</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="about-section">
                  <h2>Technology Stack</h2>
                  <div className="tech-stack">
                    <div className="tech-category">
                      <h3>AI & Machine Learning</h3>
                      <ul>
                        <li>Advanced prediction models for career and life outcomes</li>
                        <li>Natural language processing for narrative generation</li>
                        <li>Multi-objective optimization algorithms</li>
                        <li>Real-time scenario analysis and recommendations</li>
                      </ul>
                    </div>
                    <div className="tech-category">
                      <h3>Cloud Infrastructure</h3>
                      <ul>
                        <li>AWS Lambda for serverless processing</li>
                        <li>Amazon SageMaker for ML model hosting</li>
                        <li>DynamoDB for scalable data storage</li>
                        <li>CloudFront for global content delivery</li>
                      </ul>
                    </div>
                    <div className="tech-category">
                      <h3>Frontend & Visualization</h3>
                      <ul>
                        <li>React.js with Framer Motion animations</li>
                        <li>3D visualization with Three.js</li>
                        <li>Interactive charts and timeline rendering</li>
                        <li>AR/VR integration capabilities</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="about-section">
                  <h2>Development Team</h2>
                  <div className="team-grid">
                    <div className="team-member">
                      <div className="member-avatar">Y</div>
                      <h3>Yamuna</h3>
                      <p className="member-role">Lead Developer & Designer</p>
                      <p className="member-education">Computer Science Engineering</p>
                      <p className="member-bio">
                        Passionate about AI, machine learning, and creating innovative solutions 
                        that bridge technology with human experience. Specializes in full-stack 
                        development and user experience design.
                      </p>
                      <div className="member-skills">
                        <span className="skill-tag">React.js</span>
                        <span className="skill-tag">Python</span>
                        <span className="skill-tag">AI/ML</span>
                        <span className="skill-tag">AWS</span>
                        <span className="skill-tag">UI/UX</span>
                      </div>
                      <div className="member-links">
                        <a href="https://github.com/yamuna" target="_blank" rel="noopener noreferrer" className="github-link">
                          GitHub Profile
                        </a>
                        <a href="https://linkedin.com/in/yamuna" target="_blank" rel="noopener noreferrer" className="linkedin-link">
                          LinkedIn Profile
                        </a>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="about-section">
                  <h2>Project Vision</h2>
                  <div className="vision-stats">
                    <div className="stat-item">
                      <div className="stat-number">2024</div>
                      <div className="stat-label">Project Launch</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">10+</div>
                      <div className="stat-label">Life Scenarios</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">AI-Powered</div>
                      <div className="stat-label">Predictions</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">Privacy-First</div>
                      <div className="stat-label">Design</div>
                    </div>
                  </div>
                  
                  <div className="future-goals">
                    <h3>Future Goals</h3>
                    <ul>
                      <li>Expand to 50+ interactive life scenarios</li>
                      <li>Integrate wearable device data for real-time updates</li>
                      <li>Develop mobile AR/VR applications</li>
                      <li>Build community features for shared experiences</li>
                      <li>Launch enterprise version for career counseling</li>
                    </ul>
                  </div>
                </section>

                <section className="about-section">
                  <h2>Research & Innovation</h2>
                  <p>
                    Parallel You is built on cutting-edge research in digital twin technology, 
                    personal AI systems, and life simulation. We're contributing to the growing 
                    field of personal digital twins and human-AI collaboration.
                  </p>
                  
                  <div className="research-areas">
                    <div className="research-card">
                      <h4>Data Science</h4>
                      <p>Advanced statistical modeling for life outcome prediction</p>
                    </div>
                    <div className="research-card">
                      <h4>AI Research</h4>
                      <p>Novel approaches to personal AI and digital twin development</p>
                    </div>
                    <div className="research-card">
                      <h4>UX Innovation</h4>
                      <p>Intuitive interfaces for complex life simulation</p>
                    </div>
                    <div className="research-card">
                      <h4>Privacy Technology</h4>
                      <p>Privacy-preserving personal data processing</p>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Parallel You - AI-Generated Personalized Reality Simulator</p>
        </div>
      </footer>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{authMode === 'login' ? 'Login' : 'Register'}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAuthModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAuth} className="auth-form">
              {authMode === 'register' && (
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={authData.name}
                    onChange={(e) => setAuthData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={authData.email}
                  onChange={(e) => setAuthData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={authData.password}
                  onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button type="submit" className="auth-submit-btn">
                {authMode === 'login' ? 'Login' : 'Register'}
              </button>
              <p className="auth-switch">
                {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  className="auth-switch-btn"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                >
                  {authMode === 'login' ? 'Register' : 'Login'}
                </button>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
