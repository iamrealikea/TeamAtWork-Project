document.addEventListener('DOMContentLoaded', async () => {
	const countEl = document.getElementById('active-users-count');
	if (!countEl) return;

	try {
		const response = await fetch('/api/admin/users/active', {
			headers: { 'Accept': 'application/json' }
		});

		if (!response.ok) throw new Error(`Request failed: ${response.status}`);
		const data = await response.json();
		const count = Array.isArray(data)
			? data.length
			: (typeof data?.count === 'number' ? data.count : 0);

		countEl.textContent = String(count);
	} catch (error) {
		countEl.textContent = '0';
	}
});
