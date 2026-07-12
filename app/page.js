"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { dragonAssets } from '@/lib/dragonAssets';

export default function Home() {
  const [inputVal, setInputVal] = useState('gaearon');
  const [username, setUsername] = useState('gaearon');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('markdown');
  const [copied, setCopied] = useState(false);
  const [feedMsg, setFeedMsg] = useState('');

  const [origin, setOrigin] = useState('https://dragon-tamagotchi.vercel.app');

  // Safely grab the client-side origin after mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  // Fetch stats for active username
  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      setFeedMsg('');
      try {
        const res = await fetch(`/api/dragon?username=${username}&format=json`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Could not fetch stats.');
        }
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [username]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setUsername(inputVal.trim());
    }
  };

  const handleFeed = () => {
    if (stats?.state === 'dead') {
      setFeedMsg('Your dragon has died! You need to push at least 1 commit to GitHub to revive it. It will restart from an egg!');
    } else {
      setFeedMsg('You cannot feed your dragon from the console! Write code and commit on GitHub, it will be fed automatically!');
    }
  };

  const badgeUrl = `${origin}/api/dragon?username=${username}`;

  const getCodeSnippet = () => {
    if (selectedTab === 'markdown') {
      return `[![GitHub Tamagotchi](${badgeUrl})](${origin})`;
    } else if (selectedTab === 'html') {
      return `<a href="${origin}"><img src="${badgeUrl}" alt="GitHub Tamagotchi" /></a>`;
    } else {
      return badgeUrl;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Share messages
  const tweetText = stats 
    ? `I kept my GitHub Tamagotchi dragon alive for ${stats.currentStreak} days of consecutive commits! Hatch yours here: `
    : `Hatch a retro Tamagotchi dragon that grows with your GitHub commits! `;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}&hashtags=GitHub,Tamagotchi,BuildInPublic`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}`;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.retroTitle}>DRAGON</h1>
        <p className={styles.subtitle}>
          A retro pixel art Tamagotchi dragon that evolves or dies based on your GitHub commit streaks! Add it to your profile README and keep your pet alive.
        </p>
      </header>

      {/* Main Grid */}
      <main className={styles.mainGrid}>
        
        {/* Left Side: Console & Search */}
        <section className={styles.consoleSection}>
          
          {/* Search Box */}
          <div className={styles.searchBox}>
            <form onSubmit={handleSearch}>
              <label htmlFor="username" className={styles.formLabel}>
                ENTER GITHUB USERNAME:
              </label>
              <div className={styles.inputGroup}>
                <input
                  id="username"
                  type="text"
                  className={styles.input}
                  placeholder="e.g. gaearon"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                />
                <button type="submit" className={styles.btn}>
                  CONNECT
                </button>
              </div>
            </form>
          </div>

          {/* Tamagotchi Console */}
          <div className={`${styles.tamagotchi} ${styles[stats?.state || 'active']}`}>
            <div className={styles.brand}>TAMAGOTCHI</div>
            
            <div className={styles.screenOuter}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '142px' }}>
                  <div className={styles.loadingSpinner}></div>
                </div>
              ) : error ? (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '142px', padding: '1rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '1.5rem', color: '#f85149', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '8px' }}>ERROR</span>
                  <span style={{ fontSize: '0.8rem', color: '#f85149', fontFamily: 'monospace' }}>{error}</span>
                </div>
              ) : (
                <div className={styles.badgeContainer}>
                  {/* Dynamic Badge Image */}
                  <img
                    src={`/api/dragon?username=${username}&t=${new Date(stats?.lastCommitDate || '').getTime()}`}
                    alt="GitHub Tamagotchi Badge"
                    className={styles.badgeImg}
                  />
                </div>
              )}
            </div>

            {/* Console Buttons */}
            <div className={styles.controls}>
              <div className={styles.speakerGrid}>
                <div className={styles.speakerHole}></div>
                <div className={styles.speakerHole}></div>
                <div className={styles.speakerHole}></div>
                <div className={styles.speakerHole}></div>
                <div className={styles.speakerHole}></div>
                <div className={styles.speakerHole}></div>
                <div className={styles.speakerHole}></div>
                <div className={styles.speakerHole}></div>
              </div>

              <div className={styles.actionButtons}>
                <button className={`${styles.circleButton} ${styles.a}`} onClick={handleFeed}>
                  <span className={styles.buttonLabel}>FEED</span>
                </button>
                <button className={`${styles.circleButton} ${styles.b}`} onClick={() => setFeedMsg('Button B: The dragon\'s evolution is automatically synced with your GitHub commit activity!')}>
                  <span className={styles.buttonLabel}>STATUS</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Stats & Markdown copy */}
        <section className={styles.infoSection}>
          
          {/* Stats Terminal */}
          <div className={styles.terminalCard}>
            <div className={styles.terminalHeader}>
              <div className={styles.terminalDots}>
                <div className={`${styles.dot} ${styles.dotRed}`}></div>
                <div className={`${styles.dot} ${styles.dotYellow}`}></div>
                <div className={`${styles.dot} ${styles.dotGreen}`}></div>
              </div>
              <div className={styles.terminalTitle}>DRAGON_SYSTEM_v1.0.exe</div>
              <div></div>
            </div>
            
            <div className={styles.terminalBody}>
              {loading ? (
                <p>Loading data...</p>
              ) : error ? (
                <p style={{ color: '#f85149' }}>System Error: Could not resolve contribution data.</p>
              ) : stats ? (
                <>
                  <div className={styles.terminalLine}>
                    <span className={styles.termLabel}>USER:</span>
                    <span className={styles.termVal}>{stats.username}</span>
                  </div>
                  <div className={styles.terminalLine}>
                    <span className={styles.termLabel}>CURRENT STATE:</span>
                    <span className={`${styles.termVal} ${styles.termHighlight}`}>{stats.stateName.toUpperCase()}</span>
                  </div>
                  <div className={styles.terminalLine}>
                    <span className={styles.termLabel}>ACTIVE STREAK:</span>
                    <span className={styles.termVal} style={{ color: '#58a6ff' }}>{stats.currentStreak} DAYS</span>
                  </div>
                  <div className={styles.terminalLine}>
                    <span className={styles.termLabel}>LONGEST STREAK:</span>
                    <span className={styles.termVal}>{stats.longestStreak} DAYS</span>
                  </div>
                  <div className={styles.terminalLine}>
                    <span className={styles.termLabel}>CONTRIBUTIONS (YEAR):</span>
                    <span className={styles.termVal}>{stats.totalContributions} COMMITS</span>
                  </div>
                  <div className={styles.terminalLine}>
                    <span className={styles.termLabel}>LAST COMMIT:</span>
                    <span className={styles.termVal}>{stats.daysSinceLastCommit === 0 ? 'Committed today' : `${stats.daysSinceLastCommit} days ago`}</span>
                  </div>

                  <div className={`${styles.statusText} ${styles[stats.state]}`}>
                    <strong>SYSTEM MESSAGE:</strong> {stats.statusText}
                  </div>

                  {feedMsg && (
                    <div className={styles.statusText} style={{ borderColor: '#58a6ff', marginTop: '1rem', animation: 'pulse 1s infinite' }}>
                      {feedMsg}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>

          {/* Copy Badges Card */}
          <div className={styles.shareCard}>
            <h3 className={styles.shareTitle}>ADD TO PROFILE</h3>
            
            <div className={styles.tabHeader}>
              <button 
                className={`${styles.tabBtn} ${selectedTab === 'markdown' ? styles.active : ''}`}
                onClick={() => setSelectedTab('markdown')}
              >
                Markdown
              </button>
              <button 
                className={`${styles.tabBtn} ${selectedTab === 'html' ? styles.active : ''}`}
                onClick={() => setSelectedTab('html')}
              >
                HTML
              </button>
              <button 
                className={`${styles.tabBtn} ${selectedTab === 'url' ? styles.active : ''}`}
                onClick={() => setSelectedTab('url')}
              >
                Raw URL
              </button>
            </div>

            <div className={styles.codeArea}>
              <code>{getCodeSnippet()}</code>
              <button className={styles.copyBtn} onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <h3 className={styles.shareTitle} style={{ marginTop: '2rem' }}>SHARE YOUR DRAGON</h3>
            <div className={styles.shareActions}>
              <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" className={`${styles.shareBtn} ${styles.shareX}`}>
                Share on X / Twitter
              </a>
              <a href={linkedinShareUrl} target="_blank" rel="noopener noreferrer" className={`${styles.shareBtn} ${styles.shareLinkedIn}`}>
                Share on LinkedIn
              </a>
            </div>
          </div>

        </section>
      </main>

      {/* Rules Section */}
      <section className={styles.rulesSection}>
        <h2 className={styles.rulesTitle}>DRAGON EVOLUTION GUIDE</h2>
        
        <div className={styles.rulesGrid}>
          {/* Egg */}
          <div className={styles.ruleCard}>
            <div className={styles.ruleImageContainer}>
              <img src={dragonAssets.egg} alt="Egg" className={styles.ruleImg} />
            </div>
            <span className={styles.ruleStateName}>Egg</span>
            <div className={styles.ruleRange}>0 - 2 Days</div>
            <p className={styles.ruleDesc}>The developer has just started committing. A mystical egg showing signs of life.</p>
          </div>

          {/* Baby */}
          <div className={styles.ruleCard}>
            <div className={styles.ruleImageContainer}>
              <img src={dragonAssets.baby} alt="Baby" className={styles.ruleImg} />
            </div>
            <span className={styles.ruleStateName}>Baby</span>
            <div className={styles.ruleRange}>3 - 7 Days</div>
            <p className={styles.ruleDesc}>A cute baby dragon newly hatched from its egg. Has tiny wings and explores with curious eyes.</p>
          </div>

          {/* Teenager */}
          <div className={styles.ruleCard}>
            <div className={styles.ruleImageContainer}>
              <img src={dragonAssets.teenager} alt="Teenager" className={styles.ruleImg} />
            </div>
            <span className={styles.ruleStateName}>Teenager</span>
            <div className={styles.ruleRange}>8 - 20 Days</div>
            <p className={styles.ruleDesc}>A proud and energetic teenage dragon. Eagerly testing its wings and gaining confidence.</p>
          </div>

          {/* Legendary */}
          <div className={styles.ruleCard}>
            <div className={styles.ruleImageContainer}>
              <img src={dragonAssets.legendary} alt="Legendary" className={styles.ruleImg} />
            </div>
            <span className={styles.ruleStateName}>Legendary</span>
            <div className={styles.ruleRange}>21+ Days</div>
            <p className={styles.ruleDesc}>A majestic adult dragon breathing fire. The ultimate symbol of developer dedication!</p>
          </div>

          {/* Sad */}
          <div className={styles.ruleCard}>
            <div className={styles.ruleImageContainer}>
              <img src={dragonAssets.sad} alt="Sad / Starving" className={styles.ruleImg} />
            </div>
            <span className={styles.ruleStateName}>Sad / Starving</span>
            <div className={styles.ruleRange}>48-Hour Gap</div>
            <p className={styles.ruleDesc}>No commits in the last 48 hours. Wings dropped, teary eyes, in urgent need of a commit to feed.</p>
          </div>

          {/* Dead */}
          <div className={styles.ruleCard}>
            <div className={styles.ruleImageContainer}>
              <img src={dragonAssets.dead} alt="Dead" className={styles.ruleImg} />
            </div>
            <span className={styles.ruleStateName}>Dead</span>
            <div className={styles.ruleRange}>5-Day Gap</div>
            <p className={styles.ruleDesc}>No commits in the last 5 days. The dragon has turned into a skeleton ghost. Can be revived with a new commit.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
