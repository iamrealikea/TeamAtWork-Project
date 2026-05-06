document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search');
  const filterSelect = document.getElementById('filter');
  const sortSelect = document.getElementById('sort');
  const list = document.getElementById('assignment-list');

  if (!list) return;

  const cards = Array.from(list.querySelectorAll('.assignment-card'));

  const matchesSearch = (card, term) => {
    if (!term) return true;
    const title = card.dataset.title || '';
    const description = card.dataset.description || '';
    const haystack = `${title} ${description}`.toLowerCase();
    return haystack.includes(term);
  };

  const matchesFilter = (card, filterValue) => {
    if (filterValue === 'mine') return card.dataset.mine === 'true';
    return true;
  };

  const sortCards = (items, sortValue) => {
    const sorted = [...items];
    if (sortValue === 'title-asc') {
      sorted.sort((a, b) => (a.dataset.title || '').localeCompare(b.dataset.title || ''));
    } else if (sortValue === 'title-desc') {
      sorted.sort((a, b) => (b.dataset.title || '').localeCompare(a.dataset.title || ''));
    } else if (sortValue === 'due-desc') {
      sorted.sort((a, b) => new Date(b.dataset.due).getTime() - new Date(a.dataset.due).getTime());
    } else {
      sorted.sort((a, b) => new Date(a.dataset.due).getTime() - new Date(b.dataset.due).getTime());
    }
    return sorted;
  };

  const applyFilters = () => {
    const term = (searchInput?.value || '').trim().toLowerCase();
    const filterValue = filterSelect?.value || 'all';
    const sortValue = sortSelect?.value || 'due-asc';

    const visible = cards.filter((card) => (
      matchesSearch(card, term) && matchesFilter(card, filterValue)
    ));

    const sorted = sortCards(visible, sortValue);

    cards.forEach((card) => {
      card.parentElement.style.display = 'none';
    });

    sorted.forEach((card) => {
      card.parentElement.style.display = '';
      list.appendChild(card.parentElement);
    });
  };

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', applyFilters);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', applyFilters);
  }

  applyFilters();
});
