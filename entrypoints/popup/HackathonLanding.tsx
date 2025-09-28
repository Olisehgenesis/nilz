import React from 'react';
import { Search, Users, Trophy, Calendar, MapPin, ExternalLink, Github, Play, ArrowLeft } from 'lucide-react';
import { ReusableButton } from './components/ReusableButton';
import './HackathonLanding.css';

interface HackathonLandingProps {
  onBack?: () => void;
}

export function HackathonLanding({ onBack }: HackathonLandingProps) {
  return (
    <div className="hackathon-landing">
      {/* Header */}
      <header className="hackathon-header">
        <div className="header-content">
          {onBack && (
            <div className="back-button">
              <ReusableButton variant="small" onClick={onBack}>
                <ArrowLeft className="icon" />
                Back
              </ReusableButton>
            </div>
          )}
          <div className="logo-section">
            <div className="logo-icon">🏆</div>
            <h1>Welcome to Nilz</h1>
            <p>Search for hackathons, companies, developers, events and discussions</p>
          </div>
          
          <div className="search-section">
            <div className="search-bar">
              <Search className="search-icon" />
              <input 
                type="text" 
                placeholder="Search hackathons, projects, people..." 
                className="search-input"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="hackathon-nav">
        <div className="nav-links">
          <a href="#" className="nav-link active">Discover</a>
          <a href="#" className="nav-link">Hackathons</a>
          <a href="#" className="nav-link">People</a>
          <a href="#" className="nav-link">Bounties</a>
          <a href="#" className="nav-link">Projects</a>
          <a href="#" className="nav-link">Technology Owners</a>
        </div>
        
        <div className="nav-actions">
          <ReusableButton variant="small">Give us feedback</ReusableButton>
          <ReusableButton variant="small">Request feature</ReusableButton>
          <ReusableButton variant="small">Report issue</ReusableButton>
        </div>
      </nav>

      {/* Main Content */}
      <main className="hackathon-main">
        {/* Featured Hackathon */}
        <section className="featured-hackathon">
          <div className="hackathon-card">
            <div className="hackathon-header-card">
              <div className="hackathon-status">
                <span className="status-badge">Submissions Open</span>
                <h2>RealFi Hack</h2>
                <p className="hackathon-subtitle">Funding the Commons</p>
              </div>
              
              <div className="hackathon-actions">
                <ReusableButton variant="primary">
                  <Github className="icon" />
                  Create Project
                </ReusableButton>
              </div>
            </div>

            <div className="hackathon-tabs">
              <button className="tab active">Overview</button>
              <button className="tab">Schedule</button>
              <button className="tab">Participants</button>
              <button className="tab">Prizes</button>
              <button className="tab">Judges/Mentors</button>
              <button className="tab">Partners</button>
              <button className="tab">FAQs</button>
              <button className="tab">Resources</button>
              <button className="tab">Projects</button>
              <button className="tab">Leaderboard</button>
            </div>

            <div className="hackathon-content">
              <div className="team-section">
                <div className="team-card">
                  <h3>I'm looking for team members</h3>
                  <p>Let other participants know that they can send you a request to team up. Browse participants to find team members.</p>
                  <ReusableButton variant="secondary">Browse participants</ReusableButton>
                </div>
              </div>

              <div className="hackathon-info">
                <div className="info-grid">
                  <div className="info-item">
                    <MapPin className="info-icon" />
                    <span>virtual hackathon</span>
                  </div>
                  <div className="info-item">
                    <Calendar className="info-icon" />
                    <span>August 26, 2025 - October 16, 2025</span>
                  </div>
                  <div className="info-item">
                    <Users className="info-icon" />
                    <span>133 Participants</span>
                  </div>
                  <div className="info-item">
                    <Trophy className="info-icon" />
                    <span>0/5 Projects submitted</span>
                  </div>
                </div>

                <div className="hackathon-cta">
                  <ReusableButton variant="primary">
                    Join our Discord
                  </ReusableButton>
                  <ReusableButton variant="secondary">
                    Hackathon Rules
                  </ReusableButton>
                </div>
              </div>

              <div className="schedule-section">
                <h3>UP NEXT</h3>
                <div className="schedule-item">
                  <div className="schedule-date">
                    <Calendar className="schedule-icon" />
                    <span>September 30, 2025 @ 2:00 PM</span>
                  </div>
                  <h4>Logos Workshop #1</h4>
                  <ReusableButton variant="small">
                    <ExternalLink className="icon" />
                    View Full schedule
                  </ReusableButton>
                </div>
              </div>

              <div className="judges-section">
                <h3>Judges/Mentor</h3>
                <ReusableButton variant="secondary">
                  <ExternalLink className="icon" />
                  View ALL
                </ReusableButton>
              </div>

              <div className="resources-section">
                <h3>Resources</h3>
                <ReusableButton variant="secondary">
                  <ExternalLink className="icon" />
                  View ALL
                </ReusableButton>
              </div>

              <div className="announcements-section">
                <h3>📣 Latest Announcement via</h3>
                <p>No announcements yet</p>
              </div>

              <div className="about-section">
                <h3>About</h3>
                <p>
                  Join us to build tools for the real world. 🌐<br/><br/>
                  RealFi Hack is a global virtual hackathon for builders working at the edge of technology and tangible impact. We're looking for projects that push the boundaries of what's possible when decentralized systems and open tools are applied to real-world coordination challenges—from funding and financial access to trust, identity, AI, and planetary governance.
                </p>
                <ReusableButton variant="small">View more</ReusableButton>
              </div>

              <div className="tracks-section">
                <h3>Challenge Tracks</h3>
                <div className="tracks-grid">
                  {[
                    '🔒 Privacy Meets Identity',
                    '🌐 Secure Onboarding to RealFi',
                    '🎨 RealFi Content Bounty',
                    '🗂️ Private Data Manager (PDM)',
                    '👁️‍🗨️ Combined Privacy + DeFi App',
                    '🤖 Privacy-Preserving AI',
                    '🏘️ EdgeOS Civic Tech for Network Societies',
                    '👤 Human Passport: Portable Keycard Identity',
                    '🌐 Logos x Tor: Privacy Infrastructure',
                    '🥷 Resilient Activist Technology',
                    '🔎 Proof Your Rental Receipt',
                    '💻 Proof Your GPU Usage',
                    '🛠 Build RealFi',
                    '💸 Community Finance Systems & Coordination',
                    '📰 Resilient Anonymous Publishing',
                    '🗂️ Private Data Manager (PDM)'
                  ].map((track, index) => (
                    <div key={index} className="track-item">
                      {track}
                    </div>
                  ))}
                </div>
              </div>

              <div className="challenge-overview">
                <h3>🧩 Challenge Overview</h3>
                <p>
                  Build a browser extension for Nillion's Private Storage that gives non-developers full control over their User Owned Collections. Today, interacting with Nillion's SecretVaultUserClient requires developer skills and backend flows that force users to trust apps with their keys. What's missing is a user-facing interface that:
                </p>
                <ul>
                  <li>Manages a user's DID and keypair securely in the browser</li>
                  <li>Provides a dashboard to create, view, and delete private data</li>
                  <li>Lets users grant and revoke app permissions for read-only or full access</li>
                </ul>
                <p>
                  The goal: make privacy-preserving storage usable by everyday people while giving apps the access they need through user consent.
                </p>
              </div>

              <div className="submission-requirements">
                <h3>📋 Submission Essentials</h3>
                <ul>
                  <li>Demo or prototype of the browser extension (Chrome or Firefox)</li>
                  <li>Documentation covering:
                    <ul>
                      <li>How DID generation and storage are handled</li>
                      <li>How data is created, listed, viewed, and deleted</li>
                      <li>How permissions are granted/revoked through the UI</li>
                    </ul>
                  </li>
                  <li>Short video walkthrough (≤5 min) demonstrating the end-to-end flow with a sample app (e.g., a health tracker requesting read access)</li>
                  <li>(Optional) Activity log or audit trail of permission changes</li>
                </ul>
              </div>

              <div className="required-technologies">
                <h3>⚙️ Required Technologies</h3>
                <ul>
                  <li>Nillion Private Storage (User Owned Collections)</li>
                  <li>SecretVaults-ts library</li>
                  <li>Nillion Private Storage Docs</li>
                  <li>Browser Extension APIs (Chrome/Firefox)</li>
                  <li>Secure storage for keypairs within the extension</li>
                  <li>postMessage API for app–extension communication</li>
                  <li>(Optional) Privy Chrome Extension SDK for identity/wallet UX</li>
                </ul>
              </div>

              <div className="prizes-section">
                <h3>Prizes</h3>
                <div className="prizes-grid">
                  <div className="prize-item">
                    <Trophy className="prize-icon" />
                    <h4>$3,000 in NIL</h4>
                    <p>Challenge Winner</p>
                  </div>
                  <div className="prize-item">
                    <Trophy className="prize-icon" />
                    <h4>$2,000 in NIL</h4>
                    <p>Runner-up</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="hackathon-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="#">Terms of Service</a>
            <a href="#">Manifesto</a>
            <a href="#">Press & Media</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Code of Conduct</a>
            <a href="#">Pricing model</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-bottom">
            <span>beta logo</span>
            <p>Copyright © 2025 DevSpot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
