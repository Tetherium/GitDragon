// Empty days allowed between commits before the streak breaks.
export const MAX_GAP_DAYS = 3;
// After this many days without a commit the dragon looks sad (streak still safe).
export const SAD_AFTER_DAYS = 2;

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

    // Filter out future dates from the calendar grid.
    // GitHub calendar displays days until the end of the current week (Saturday).
    // We filter out any future dates, but keep any future dates that have active commits (level > 0) to support all timezones.
    const utcTodayStr = new Date().toISOString().substring(0, 10);
    const activeDays = days.filter(d => d.date <= utcTodayStr || d.level > 0);

    if (activeDays.length === 0) {
      return { error: 'Could not parse active contribution calendar days.' };
    }

    const totalDays = activeDays.length;
    const latestDay = activeDays[totalDays - 1];

    // Find the last day with contributions
    let lastCommitDate = null;
    let daysSinceLastCommit = 999;

    const lastCommitDay = [...activeDays].reverse().find(d => d.level > 0);
    
    if (lastCommitDay) {
      lastCommitDate = lastCommitDay.date;
      const latestDateObj = new Date(latestDay.date);
      const lastCommitDateObj = new Date(lastCommitDay.date);
      const diffTime = Math.abs(latestDateObj - lastCommitDateObj);
      daysSinceLastCommit = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    // Streak = number of commit days in a chain. Up to MAX_GAP_DAYS empty days
    // between commits are forgiven, so the dragon keeps growing from where it left off.
    const streakAlive = daysSinceLastCommit <= MAX_GAP_DAYS;

    let currentStreak = 0;
    if (streakAlive) {
      let emptyRun = 0;
      for (let i = totalDays - 1; i >= 0; i--) {
        if (activeDays[i].level > 0) {
          currentStreak++;
          emptyRun = 0;
        } else if (currentStreak > 0 && ++emptyRun > MAX_GAP_DAYS) {
          break;
        }
      }
    }

    // Longest streak in the last year, with the same gap tolerance
    let longestStreak = 0;
    let tempStreak = 0;
    let emptyRun = 0;
    for (let i = 0; i < totalDays; i++) {
      if (activeDays[i].level > 0) {
        tempStreak++;
        emptyRun = 0;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else if (++emptyRun > MAX_GAP_DAYS) {
        tempStreak = 0;
      }
    }

    // Days left to commit before the streak is lost (0 when already lost)
    const graceDaysLeft = streakAlive ? MAX_GAP_DAYS + 1 - daysSinceLastCommit : 0;

    // Determine state
    let state = 'egg';
    let stateName = 'Egg';
    let statusText = 'A mystical life waiting to sprout...';

    if (!streakAlive) {
      state = 'dead';
      stateName = 'Dead (Ghost)';
      statusText = 'Your dragon has died! Commit to hatch a new egg.';
    } else if (daysSinceLastCommit >= SAD_AFTER_DAYS) {
      state = 'sad';
      stateName = 'Sad / Starving';
      statusText = graceDaysLeft === 1
        ? 'Starving! Commit today or your dragon dies.'
        : `Starving! Commit within ${graceDaysLeft} days to keep growing.`;
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

    // Growth stage reached by the streak. A sad dragon keeps its stage and progress.
    const stage = currentStreak >= 21 ? 'legendary'
      : currentStreak >= 8 ? 'teenager'
      : currentStreak >= 3 ? 'baby'
      : 'egg';

    // Calculate progress to next state
    let nextStateRequired = 3;
    let nextStateName = 'Baby';
    let progressPercentage = 0;

    if (state === 'dead') {
      progressPercentage = 0;
      nextStateRequired = 1;
      nextStateName = 'Egg (Rebirth)';
    } else if (stage === 'egg') {
      nextStateRequired = 3;
      nextStateName = 'Baby';
      progressPercentage = Math.min(100, Math.round((currentStreak / 3) * 100));
    } else if (stage === 'baby') {
      nextStateRequired = 8;
      nextStateName = 'Teenager';
      // baby is 3 to 7 days
      progressPercentage = Math.min(100, Math.round(((currentStreak - 3) / (8 - 3)) * 100));
    } else if (stage === 'teenager') {
      nextStateRequired = 21;
      nextStateName = 'Legendary';
      // teenager is 8 to 20 days
      progressPercentage = Math.min(100, Math.round(((currentStreak - 8) / (21 - 8)) * 100));
    } else {
      nextStateRequired = null;
      nextStateName = 'Max Level';
      progressPercentage = 100;
    }

    // Energy / Food level (HP)
    // 100% on the commit day, drops each empty day, 0% when the streak is lost.
    const hp = Math.max(0, Math.round(((MAX_GAP_DAYS + 1 - daysSinceLastCommit) / (MAX_GAP_DAYS + 1)) * 100));

    return {
      username,
      totalContributions,
      currentStreak,
      longestStreak,
      daysSinceLastCommit,
      lastCommitDate,
      state,
      stage,
      graceDaysLeft,
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
