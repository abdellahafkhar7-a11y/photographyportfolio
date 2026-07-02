// ============================================
// Admin Dashboard — Photography Pixel
// Vanilla JS · Fetches from existing backend APIs
// Auto-refreshes every 60 seconds
// ============================================

(function () {
  'use strict';

  // — Config —
  var API_STATS = '/api/stats';
  var API_ANALYTICS = '/api/analytics';
  var API_VIDEOS = '/api/videos';
  var REFRESH_INTERVAL = 60; // seconds
  var STORAGE_KEY = 'pp_admin_history';

  // — State —
  var countdown = REFRESH_INTERVAL;
  var countdownTimer = null;

  // — DOM refs —
  var el = {};
  function cacheDom() {
    el.totalViews = document.getElementById('total-views');
    el.totalLikes = document.getElementById('total-likes');
    el.totalShares = document.getElementById('total-shares');
    el.totalVideos = document.getElementById('total-videos');
    el.todayViews = document.getElementById('today-views');
    el.todayLikes = document.getElementById('today-likes');
    el.todayShares = document.getElementById('today-shares');
    el.todayBarViews = document.getElementById('today-bar-views');
    el.todayBarLikes = document.getElementById('today-bar-likes');
    el.todayBarShares = document.getElementById('today-bar-shares');
    el.mostViewedSlug = document.getElementById('most-viewed-slug');
    el.mostViewedCount = document.getElementById('most-viewed-count');
    el.mostLikedSlug = document.getElementById('most-liked-slug');
    el.mostLikedCount = document.getElementById('most-liked-count');
    el.weeklyChart = document.getElementById('weekly-chart');
    el.monthlyChart = document.getElementById('monthly-chart');
    el.topCategories = document.getElementById('top-categories');
    el.topVideos = document.getElementById('top-videos');
    el.lastUpdated = document.getElementById('last-updated');
    el.countdown = document.getElementById('countdown');
    el.manualRefresh = document.getElementById('manual-refresh');
    el.year = document.getElementById('year');
  }

  // — Fetch helpers —
  function fetchJson(url) {
    return fetch(url, { headers: { 'Accept': 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      });
  }

  function fetchAll() {
    return Promise.all([
      fetchJson(API_STATS).catch(function () { return null; }),
      fetchJson(API_ANALYTICS).catch(function () { return null; }),
      fetchJson(API_VIDEOS).catch(function () { return null; })
    ]);
  }

  // — localStorage snapshot system —
  function getHistory() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveSnapshot(today) {
    if (!today) return;
    var history = getHistory();
    var todayStr = new Date().toISOString().split('T')[0];
    var existing = history.find(function (h) { return h.date === todayStr; });

    if (existing) {
      existing.views = today.views;
      existing.likes = today.likes;
      existing.shares = today.shares;
    } else {
      history.push({ date: todayStr, views: today.views, likes: today.likes, shares: today.shares });
    }

    // Keep last 30 days only
    if (history.length > 30) history = history.slice(-30);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {}
  }

  // — Render: Stat cards —
  function renderStats(stats) {
    if (!stats || !stats.success) {
      el.totalViews.textContent = '—';
      el.totalLikes.textContent = '—';
      el.totalShares.textContent = '—';
      return;
    }
    var t = stats.totals || {};
    el.totalViews.textContent = formatNum(t.views);
    el.totalLikes.textContent = formatNum(t.likes);
    el.totalShares.textContent = formatNum(t.shares);

    // Highlights
    var mv = stats.most_viewed;
    if (mv) {
      el.mostViewedSlug.textContent = mv.video_slug || '—';
      el.mostViewedCount.textContent = formatNum(mv.count) + ' views';
    }
    var ml = stats.most_liked;
    if (ml) {
      el.mostLikedSlug.textContent = ml.video_slug || '—';
      el.mostLikedCount.textContent = formatNum(ml.count) + ' likes';
    }
  }

  // — Render: Today's metrics —
  function renderToday(analytics) {
    if (!analytics || !analytics.success) {
      el.todayViews.textContent = '—';
      el.todayLikes.textContent = '—';
      el.todayShares.textContent = '—';
      return;
    }
    var today = analytics.today || {};
    var v = today.views || 0;
    var l = today.likes || 0;
    var s = today.shares || 0;

    el.todayViews.textContent = formatNum(v);
    el.todayLikes.textContent = formatNum(l);
    el.todayShares.textContent = formatNum(s);

    // Bar fills — relative to max
    var max = Math.max(v, l, s, 1);
    el.todayBarViews.style.width = ((v / max) * 100) + '%';
    el.todayBarLikes.style.width = ((l / max) * 100) + '%';
    el.todayBarShares.style.width = ((s / max) * 100) + '%';

    // Save snapshot for charts
    saveSnapshot(today);
  }

  // — Render: Video count —
  function renderVideoCount(videos) {
    if (!videos || !videos.success) {
      el.totalVideos.textContent = '—';
      return;
    }
    el.totalVideos.textContent = formatNum(videos.total || 0);
  }

  // — Render: Weekly chart —
  function renderWeeklyChart() {
    var history = getHistory();
    var days7 = history.slice(-7);

    if (days7.length === 0) {
      el.weeklyChart.innerHTML = '<div class="chart-loading">No historical data yet. Data is collected daily.</div>';
      return;
    }

    var html = '<div class="chart-legend">' +
      '<div class="legend-item"><span class="legend-dot legend-dot--views"></span> Views</div>' +
      '<div class="legend-item"><span class="legend-dot legend-dot--likes"></span> Likes</div>' +
      '<div class="legend-item"><span class="legend-dot legend-dot--shares"></span> Shares</div>' +
    '</div>';

    html += '<div class="chart-bar-container" style="display:flex;align-items:flex-end;gap:0.5rem;flex:1;">';

    var maxVal = 1;
    days7.forEach(function (d) {
      maxVal = Math.max(maxVal, d.views, d.likes, d.shares);
    });

    days7.forEach(function (d) {
      var vPct = (d.views / maxVal) * 100;
      var lPct = (d.likes / maxVal) * 100;
      var sPct = (d.shares / maxVal) * 100;
      var label = d.date.split('-')[2] + '/' + d.date.split('-')[1];

      html +=
        '<div class="chart-bar-group">' +
          '<div class="chart-bar-stack">' +
            '<div class="chart-bar-segment chart-bar-segment--views" style="height:' + vPct + '%"></div>' +
            '<div class="chart-bar-segment chart-bar-segment--likes" style="height:' + lPct + '%"></div>' +
            '<div class="chart-bar-segment chart-bar-segment--shares" style="height:' + sPct + '%"></div>' +
          '</div>' +
          '<span class="chart-bar-label">' + label + '</span>' +
        '</div>';
    });

    html += '</div>';
    el.weeklyChart.innerHTML = html;
    el.weeklyChart.style.flexDirection = 'column';
  }

  // — Render: Monthly chart —
  function renderMonthlyChart() {
    var history = getHistory();
    var days30 = history.slice(-30);

    if (days30.length === 0) {
      el.monthlyChart.innerHTML = '<div class="chart-loading">No historical data yet. Data is collected daily.</div>';
      return;
    }

    var html = '<div class="chart-legend">' +
      '<div class="legend-item"><span class="legend-dot legend-dot--views"></span> Views</div>' +
      '<div class="legend-item"><span class="legend-dot legend-dot--likes"></span> Likes</div>' +
      '<div class="legend-item"><span class="legend-dot legend-dot--shares"></span> Shares</div>' +
    '</div>';

    html += '<div style="display:flex;align-items:flex-end;gap:2px;flex:1;">';

    var maxVal = 1;
    days30.forEach(function (d) {
      maxVal = Math.max(maxVal, d.views, d.likes, d.shares);
    });

    days30.forEach(function (d) {
      var vPct = (d.views / maxVal) * 100;
      var lPct = (d.likes / maxVal) * 100;
      var sPct = (d.shares / maxVal) * 100;

      html +=
        '<div class="chart-bar-group" style="min-width:0;">' +
          '<div class="chart-bar-stack" style="height:120px;">' +
            '<div class="chart-bar-segment chart-bar-segment--views" style="height:' + vPct + '%"></div>' +
            '<div class="chart-bar-segment chart-bar-segment--likes" style="height:' + lPct + '%"></div>' +
            '<div class="chart-bar-segment chart-bar-segment--shares" style="height:' + sPct + '%"></div>' +
          '</div>' +
        '</div>';
    });

    html += '</div>';
    el.monthlyChart.innerHTML = html;
    el.monthlyChart.style.flexDirection = 'column';
  }

  // — Render: Top categories —
  function renderTopCategories(analytics) {
    if (!analytics || !analytics.success || !analytics.top_categories || analytics.top_categories.length === 0) {
      el.topCategories.innerHTML = '<div class="rank-loading">No data yet</div>';
      return;
    }

    var items = analytics.top_categories;
    var maxCount = items[0] ? items[0].count : 1;

    var html = items.map(function (item, i) {
      var pct = (item.count / maxCount) * 100;
      return (
        '<div class="rank-item">' +
          '<span class="rank-number">' + (i + 1) + '</span>' +
          '<span class="rank-name">' + escapeHtml(item.category) + '</span>' +
          '<div class="rank-bar"><div class="rank-bar-fill" style="width:' + pct + '%"></div></div>' +
          '<span class="rank-count">' + formatNum(item.count) + '</span>' +
        '</div>'
      );
    }).join('');

    el.topCategories.innerHTML = html;
  }

  // — Render: Top videos —
  function renderTopVideos(analytics) {
    if (!analytics || !analytics.success || !analytics.top_videos || analytics.top_videos.length === 0) {
      el.topVideos.innerHTML = '<div class="rank-loading">No data yet</div>';
      return;
    }

    var items = analytics.top_videos.slice(0, 10);
    var maxCount = items[0] ? items[0].count : 1;

    var html = items.map(function (item, i) {
      var pct = (item.count / maxCount) * 100;
      return (
        '<div class="rank-item">' +
          '<span class="rank-number">' + (i + 1) + '</span>' +
          '<span class="rank-name">' + escapeHtml(item.video_slug) + '</span>' +
          '<div class="rank-bar"><div class="rank-bar-fill" style="width:' + pct + '%"></div></div>' +
          '<span class="rank-count">' + formatNum(item.count) + '</span>' +
        '</div>'
      );
    }).join('');

    el.topVideos.innerHTML = html;
  }

  // — Helpers —
  function formatNum(n) {
    if (n === null || n === undefined) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function updateTimestamp() {
    var now = new Date();
    el.lastUpdated.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  // — Auto-refresh —
  function startCountdown() {
    countdown = REFRESH_INTERVAL;
    el.countdown.textContent = countdown;
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(function () {
      countdown--;
      if (countdown <= 0) {
        clearInterval(countdownTimer);
        load();
      } else {
        el.countdown.textContent = countdown;
      }
    }, 1000);
  }

  // — Main load —
  function load() {
    fetchAll().then(function (results) {
      var stats = results[0];
      var analytics = results[1];
      var videos = results[2];

      renderStats(stats);
      renderToday(analytics);
      renderVideoCount(videos);
      renderWeeklyChart();
      renderMonthlyChart();
      renderTopCategories(analytics);
      renderTopVideos(analytics);
      updateTimestamp();
      startCountdown();
    });
  }

  // — Init —
  document.addEventListener('DOMContentLoaded', function () {
    cacheDom();
    if (el.year) el.year.textContent = new Date().getFullYear();
    if (el.manualRefresh) {
      el.manualRefresh.addEventListener('click', function () {
        if (countdownTimer) clearInterval(countdownTimer);
        load();
      });
    }
    load();
  });
})();
