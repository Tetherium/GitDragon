/**
 * Fetches and parses GitHub contributions HTML page to calculate Tamagotchi dragon statistics.
 */
export async function getDragonStats(username) {
  try {
    const url = `https://github.com/users/${username}/contributions`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { error: 'Kullanıcı bulunamadı' };
      }
      return { error: `GitHub bağlantı hatası: ${response.status}` };
    }

    const html = await response.text();

    // Find the total contributions in the last year
    const headerRegex = /(\d{1,3}(?:[.,]\d{3})*)\s+contributions\s+in\s+the\s+last\s+year/i;
    const headerMatch = html.match(headerRegex);
    const totalContributions = headerMatch ? parseInt(headerMatch[1].replace(/[,.]/g, ''), 10) : 0;

    // Find all TD elements representing calendar days
    // Typically: <td class="ContributionCalendar-day" data-date="2026-07-04" data-level="1" ...>
    const tdMatches = html.match(/<td\s+[^>]*class="[^"]*ContributionCalendar-day[^"]*"[^>]*>/g) || 
                      html.match(/<td\s+[^>]*data-date="[^"]*"[^>]*>/g) || [];

    const days = tdMatches
      .map(tag => {
        const dateMatch = tag.match(/data-date="([^"]+)"/);
        const levelMatch = tag.match(/data-level="([^"]+)"/);
        if (dateMatch && levelMatch) {
          return {
            date: dateMatch[1],
            level: parseInt(levelMatch[1], 10)
          };
        }
        return null;
      })
      .filter(Boolean);

    if (days.length === 0) {
      return { error: 'Could not parse contribution data. GitHub calendar structure might have changed.' };
    }

    // Sort chronologically (oldest to newest)
    days.sort((a, b) => new Date(a.date) - new Date(b.date));

    const totalDays = days.length;
    const latestDay = days[totalDays - 1];

    // Find the last day with contributions
    let lastCommitDate = null;
    let daysSinceLastCommit = 999;

    const lastCommitDay = [...days].reverse().find(d => d.level > 0);
    
    if (lastCommitDay) {
      lastCommitDate = lastCommitDay.date;
      const latestDateObj = new Date(latestDay.date);
      const lastCommitDateObj = new Date(lastCommitDay.date);
      const diffTime = Math.abs(latestDateObj - lastCommitDateObj);
      daysSinceLastCommit = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    // Calculate current streak
    let currentStreak = 0;
    let streakStartIndex = -1;

    // Check if the user committed today or yesterday
    const todayCommit = days[totalDays - 1] && days[totalDays - 1].level > 0;
    const yesterdayCommit = days[totalDays - 2] && days[totalDays - 2].level > 0;

    if (todayCommit) {
      streakStartIndex = totalDays - 1;
    } else if (yesterdayCommit) {
      streakStartIndex = totalDays - 2;
    }

    if (streakStartIndex !== -1) {
      for (let i = streakStartIndex; i >= 0; i--) {
        if (days[i].level > 0) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak in the last year
    let longestStreak = 0;
    let tempStreak = 0;
    for (let i = 0; i < totalDays; i++) {
      if (days[i].level > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }

    // Determine state
    let state = 'egg';
    let stateName = 'Egg';
    let statusText = 'A mystical life waiting to sprout...';

    if (daysSinceLastCommit >= 5) {
      state = 'dead';
      stateName = 'Dead (Ghost)';
      statusText = 'Your dragon has died! Push a new commit to awaken a new egg.';
    } else if (daysSinceLastCommit >= 2) {
      state = 'sad';
      stateName = 'Sad / Starving';
      statusText = 'Your dragon is starving and weak! Wings dropped, eyes tearing up. Commit immediately to feed it!';
    } else {
      // Active states
      if (currentStreak >= 21) {
        state = 'legendary';
        stateName = 'Legendary Dragon';
        statusText = 'Unstoppable power! A majestic legend breathing fire!';
      } else if (currentStreak >= 8) {
        state = 'teenager';
        stateName = 'Teenager Dragon';
        statusText = 'Confident, energetic, and eager to fly!';
      } else if (currentStreak >= 3) {
        state = 'baby';
        stateName = 'Baby Dragon';
        statusText = 'Newly hatched! Exploring the world with curious eyes.';
      } else {
        state = 'egg';
        stateName = 'Egg';
        statusText = 'Warm and safe. Hatching soon!';
      }
    }

    // Calculate progress to next state
    let nextStateRequired = 3;
    let nextStateName = 'Baby';
    let progressPercentage = 0;

    if (state === 'egg') {
      nextStateRequired = 3;
      nextStateName = 'Baby';
      progressPercentage = Math.min(100, Math.round((currentStreak / 3) * 100));
    } else if (state === 'baby') {
      nextStateRequired = 8;
      nextStateName = 'Teenager';
      // baby is 3 to 7 days
      const currentInStage = currentStreak - 3;
      const stageRange = 8 - 3;
      progressPercentage = Math.min(100, Math.round((currentInStage / stageRange) * 100));
    } else if (state === 'teenager') {
      nextStateRequired = 21;
      nextStateName = 'Legendary';
      // teenager is 8 to 20 days
      const currentInStage = currentStreak - 8;
      const stageRange = 21 - 8;
      progressPercentage = Math.min(100, Math.round((currentInStage / stageRange) * 100));
    } else if (state === 'legendary') {
      nextStateRequired = null;
      nextStateName = 'Max Level';
      progressPercentage = 100;
    } else if (state === 'sad' || state === 'dead') {
      progressPercentage = 0;
      nextStateRequired = 1;
      nextStateName = 'Egg (Rebirth)';
    }

    // Energy / Food level (HP)
    // 100% when daysSinceLastCommit = 0, decreases to 0% at 5 days (dead)
    const hp = Math.max(0, Math.round(((5 - daysSinceLastCommit) / 5) * 100));

    return {
      username,
      totalContributions,
      currentStreak,
      longestStreak,
      daysSinceLastCommit,
      lastCommitDate,
      state,
      stateName,
      statusText,
      hp,
      progressPercentage,
      nextStateRequired,
      nextStateName
    };
  } catch (err) {
    console.error('Error fetching contributions:', err);
    return { error: 'An error occurred while retrieving contribution data.' };
  }
}
