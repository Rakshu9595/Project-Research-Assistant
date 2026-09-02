/**
 * ==========================================================================
 * AI RESEARCH ASSISTANT — ACADEMIC RESEARCH DISCOVERY (research.js)
 * ==========================================================================
 */

let allFetchedPapers = [];

document.addEventListener('DOMContentLoaded', () => {
  Auth.requireAuth();
  Auth.initNavUser();

  setupSearchForm();
  setupFilterListeners();
});

/**
 * Setup search form and topic pill clicks
 */
function setupSearchForm() {
  const form = document.getElementById('researchSearchForm');
  const searchInput = document.getElementById('researchSearchInput');
  const projectResearchBtn = document.getElementById('findProjectResearchBtn');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput?.value?.trim();
      if (query) {
        performResearchSearch(query);
      }
    });
  }

  if (projectResearchBtn) {
    projectResearchBtn.addEventListener('click', () => {
      findResearchFromProject();
    });
  }

  // Topic pills
  document.querySelectorAll('.topic-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const topic = tag.textContent.trim();
      if (searchInput) searchInput.value = topic;
      performResearchSearch(topic);
    });
  });
}

/**
 * Perform search for academic papers
 * @param {string} query 
 */
async function performResearchSearch(query) {
  const container = document.getElementById('researchResultsContainer');
  const searchBtn = document.getElementById('searchPapersSubmitBtn');
  if (!container) return;

  Utils.setButtonLoading(searchBtn, true);
  renderLoadingSkeletons(container);

  try {
    const res = await window.researchAPI.search(query);
    allFetchedPapers = Array.isArray(res) ? res : (res?.papers || []);
    applyFiltersAndRender();
  } catch (err) {
    container.innerHTML = Utils.renderErrorState(
      `Failed to fetch research papers: ${err.message || 'Please check backend API connection.'}`,
      `performResearchSearch('${Utils.escapeHtml(query)}')`
    );
  } finally {
    Utils.setButtonLoading(searchBtn, false, '<i class="bi bi-search me-1"></i> Search');
  }
}

/**
 * Perform context-aware project research extraction
 */
async function findResearchFromProject() {
  const container = document.getElementById('researchResultsContainer');
  const btn = document.getElementById('findProjectResearchBtn');
  if (!container) return;

  Utils.setButtonLoading(btn, true);
  renderLoadingSkeletons(container);

  try {
    const res = await window.researchAPI.getProjectResearch();
    allFetchedPapers = Array.isArray(res) ? res : (res?.papers || []);
    
    if (allFetchedPapers.length === 0) {
      container.innerHTML = Utils.renderEmptyState(
        'No project-specific papers found',
        'Upload your project reports first under Documents so the AI can extract your research domain and keywords.',
        'bi-journal-x',
        '<a href="documents.html" class="btn btn-primary btn-sm"><i class="bi bi-cloud-upload me-1"></i> Upload Reports</a>'
      );
      return;
    }

    applyFiltersAndRender();
    Utils.showToast('Discovered relevant academic literature based on your project!', 'success');
  } catch (err) {
    container.innerHTML = Utils.renderErrorState(
      'Unable to find project-related papers. Make sure documents are uploaded and backend is running.',
      'findResearchFromProject()'
    );
  } finally {
    Utils.setButtonLoading(btn, false, '<i class="bi bi-magic me-1"></i> Find Research Related to My Project');
  }
}

/**
 * Setup client-side filters for year, relevance, and source
 */
function setupFilterListeners() {
  const yearFilter = document.getElementById('filterYear');
  const relevanceFilter = document.getElementById('filterRelevance');
  const sourceFilter = document.getElementById('filterSource');

  [yearFilter, relevanceFilter, sourceFilter].forEach(el => {
    if (el) {
      el.addEventListener('change', () => applyFiltersAndRender());
    }
  });
}

/**
 * Filter, sort, and render papers list
 */
function applyFiltersAndRender() {
  const container = document.getElementById('researchResultsContainer');
  const resultsCountBadge = document.getElementById('researchCountBadge');
  if (!container) return;

  const yearVal = document.getElementById('filterYear')?.value || 'all';
  const relVal = document.getElementById('filterRelevance')?.value || 'all';
  const sourceVal = document.getElementById('filterSource')?.value || 'all';

  let filtered = [...allFetchedPapers];

  // Year filter
  if (yearVal !== 'all') {
    const minYear = parseInt(yearVal, 10);
    filtered = filtered.filter(p => (p.year || 0) >= minYear);
  }

  // Relevance filter
  if (relVal !== 'all') {
    const minScore = parseFloat(relVal);
    filtered = filtered.filter(p => {
      const score = (p.relevance_score ?? p.relevance ?? 0.8);
      const normalizedScore = score > 1 ? score / 100 : score;
      return normalizedScore >= minScore;
    });
  }

  // Source filter
  if (sourceVal !== 'all') {
    filtered = filtered.filter(p => (p.source || '').toLowerCase().includes(sourceVal.toLowerCase()));
  }

  if (resultsCountBadge) {
    resultsCountBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'Paper' : 'Papers'}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = Utils.renderEmptyState(
      'No papers match your filters',
      'Try broadening your search query or resetting your filter criteria.',
      'bi-filter-circle'
    );
    return;
  }

  let html = '<div class="papers-list">';

  filtered.forEach((paper, index) => {
    const title = Utils.escapeHtml(paper.title || 'Untitled Academic Paper');
    const authors = Array.isArray(paper.authors) 
      ? paper.authors.map(a => typeof a === 'string' ? a : a.name).join(', ') 
      : (paper.authors || 'Unknown Authors');
    const year = paper.year || '2024';
    const abstract = Utils.escapeHtml(paper.abstract || paper.summary || 'Abstract not available.');
    const source = Utils.escapeHtml(paper.source || 'Semantic Scholar');
    const url = paper.url || paper.doi ? `https://doi.org/${paper.doi}` : '#';
    const reason = Utils.escapeHtml(paper.reason || paper.relevance_reason || 'Discusses relevant methodology and architectural benchmarks.');

    // Relevance scoring
    const rawScore = paper.relevance_score ?? paper.relevance ?? 0.85;
    const scoreVal = rawScore > 1 ? rawScore : Math.round(rawScore * 100);

    let badgeClass = 'relevance-mod';
    let badgeText = `Moderate (${scoreVal}%)`;
    if (scoreVal >= 90) {
      badgeClass = 'relevance-high';
      badgeText = `Highly Relevant (${scoreVal}%)`;
    } else if (scoreVal >= 80) {
      badgeClass = 'relevance-med';
      badgeText = `Relevant (${scoreVal}%)`;
    }

    const paperCardId = `paper-card-${index}`;

    html += `
      <article class="paper-card" id="${paperCardId}">
        <div class="paper-header">
          <div>
            <h3 class="paper-title">
              <a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>
            </h3>
            <div class="paper-meta mt-2">
              <span class="paper-authors"><i class="bi bi-people me-1"></i>${Utils.escapeHtml(authors)}</span>
              <span class="paper-year"><i class="bi bi-calendar3 me-1"></i>${year}</span>
              <span class="paper-source"><i class="bi bi-journal-bookmark me-1"></i>${source}</span>
            </div>
          </div>
          <div>
            <span class="relevance-badge ${badgeClass}">
              <i class="bi bi-stars"></i> ${badgeText}
            </span>
          </div>
        </div>

        <div>
          <p class="paper-abstract clamped" id="abstract-${index}">${abstract}</p>
          ${abstract.length > 200 ? `
            <button class="abstract-toggle-btn" onclick="toggleAbstract(${index})">
              Show more <i class="bi bi-chevron-down"></i>
            </button>
          ` : ''}
        </div>

        <div class="why-relevant-box">
          <div class="why-relevant-title">
            <i class="bi bi-lightbulb-fill"></i> Why this paper is relevant
          </div>
          <div>${reason}</div>
        </div>

        <div class="paper-actions">
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-outline-primary btn-sm" onclick="discussPaperInChat('${Utils.escapeHtml(title)}')">
              <i class="bi bi-chat-dots me-1"></i> Ask in Chat
            </button>
            <button class="btn btn-ghost btn-sm" onclick="Utils.copyToClipboard('${url}')" title="Copy Paper Link">
              <i class="bi bi-link-45deg me-1"></i> Copy Link
            </button>
          </div>
          ${url !== '#' ? `
            <a href="${url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
              View Publication <i class="bi bi-box-arrow-up-right ms-1"></i>
            </a>
          ` : ''}
        </div>
      </article>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

/**
 * Toggle abstract clamp
 * @param {number} index 
 */
function toggleAbstract(index) {
  const el = document.getElementById(`abstract-${index}`);
  const btn = el?.nextElementSibling;
  if (!el || !btn) return;

  if (el.classList.contains('clamped')) {
    el.classList.remove('clamped');
    btn.innerHTML = 'Show less <i class="bi bi-chevron-up"></i>';
  } else {
    el.classList.add('clamped');
    btn.innerHTML = 'Show more <i class="bi bi-chevron-down"></i>';
  }
}

/**
 * Navigate to chat with prompt about selected paper
 * @param {string} paperTitle 
 */
function discussPaperInChat(paperTitle) {
  const prompt = `Can you explain the main contributions of the research paper "${paperTitle}" and how it compares to my uploaded project reports?`;
  window.location.href = `chat.html?prompt=${encodeURIComponent(prompt)}`;
}

/**
 * Render loading skeletons
 * @param {HTMLElement} container 
 */
function renderLoadingSkeletons(container) {
  container.innerHTML = `
    <div class="papers-list">
      ${[1, 2, 3].map(() => `
        <div class="paper-card">
          <div class="d-flex justify-content-between mb-2">
            <div class="skeleton" style="height: 24px; width: 65%;"></div>
            <div class="skeleton" style="height: 24px; width: 15%;"></div>
          </div>
          <div class="skeleton mb-3" style="height: 16px; width: 40%;"></div>
          <div class="skeleton mb-2" style="height: 14px; width: 100%;"></div>
          <div class="skeleton mb-2" style="height: 14px; width: 90%;"></div>
          <div class="skeleton" style="height: 48px; width: 100%; border-radius: 8px;"></div>
        </div>
      `).join('')}
    </div>
  `;
}

window.toggleAbstract = toggleAbstract;
window.discussPaperInChat = discussPaperInChat;
window.performResearchSearch = performResearchSearch;
window.findResearchFromProject = findResearchFromProject;
