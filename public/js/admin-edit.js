document.addEventListener('DOMContentLoaded', () => {
  const teamModal = document.getElementById('admin-team-modal');
  const userModal = document.getElementById('admin-user-modal');
  const teamForm = document.getElementById('admin-team-form');
  const userForm = document.getElementById('admin-user-form');
  const deleteTeamButton = document.getElementById('admin-delete-team');

  const showPopup = (message, variant = 'info') => {
    const existing = document.querySelector('.popup-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';

    const card = document.createElement('div');
    card.className = `popup-card popup-card--${variant}`;
    card.textContent = message;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    window.setTimeout(() => {
      overlay.classList.add('popup-overlay--hide');
    }, 1200);

    window.setTimeout(() => {
      overlay.remove();
    }, 1600);
  };

  const openModal = (modal) => {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  };

  const bindClose = (modal) => {
    if (!modal) return;
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal(modal);
    });
  };

  bindClose(teamModal);
  bindClose(userModal);

  document.querySelectorAll('.admin-edit-team').forEach((button) => {
    button.addEventListener('click', () => {
      const teamId = button.dataset.teamId;
      const name = button.dataset.teamName || '';
      const description = button.dataset.teamDescription || '';

      const idInput = document.getElementById('admin-team-id');
      const nameInput = document.getElementById('admin-team-name');
      const descInput = document.getElementById('admin-team-description');

      if (idInput) idInput.value = teamId || '';
      if (nameInput) nameInput.value = name;
      if (descInput) descInput.value = description;

      openModal(teamModal);
    });
  });

  document.querySelectorAll('.admin-edit-user').forEach((button) => {
    button.addEventListener('click', () => {
      const userId = button.dataset.userId;
      const firstname = button.dataset.userFirstname || '';
      const lastname = button.dataset.userLastname || '';
      const email = button.dataset.userEmail || '';
      const username = button.dataset.userUsername || '';

      const idInput = document.getElementById('admin-user-id');
      const firstInput = document.getElementById('admin-user-firstname');
      const lastInput = document.getElementById('admin-user-lastname');
      const emailInput = document.getElementById('admin-user-email');
      const userInput = document.getElementById('admin-user-username');

      if (idInput) idInput.value = userId || '';
      if (firstInput) firstInput.value = firstname;
      if (lastInput) lastInput.value = lastname;
      if (emailInput) emailInput.value = email;
      if (userInput) userInput.value = username;

      openModal(userModal);
    });
  });

  if (teamForm) {
    teamForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const teamId = document.getElementById('admin-team-id')?.value;
      if (!teamId) return;

      const payload = {
        name: document.getElementById('admin-team-name')?.value || '',
        description: document.getElementById('admin-team-description')?.value || ''
      };

      try {
        const response = await fetch(`/api/admin/teams/${teamId}`, {
          method: 'PATCH',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const message = data?.error || data?.message || 'Unable to update team.';
          showPopup(message, 'error');
          return;
        }

        showPopup('Team updated.', 'success');
        closeModal(teamModal);
        window.location.reload();
      } catch (error) {
        showPopup('Unable to update team.', 'error');
        console.error('Error updating team:', error);
      }
    });
  }

  if (deleteTeamButton) {
    deleteTeamButton.addEventListener('click', async () => {
      const teamId = document.getElementById('admin-team-id')?.value;
      const teamName = document.getElementById('admin-team-name')?.value || 'this team';
      if (!teamId) return;

      const confirmed = window.confirm(`Delete ${teamName}? This cannot be undone.`);
      if (!confirmed) return;

      try {
        const response = await fetch(`/api/admin/teams/${teamId}`, {
          method: 'DELETE',
          headers: { 'Accept': 'application/json' }
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const message = data?.error || data?.message || 'Unable to delete team.';
          showPopup(message, 'error');
          return;
        }

        showPopup('Team deleted.', 'success');
        closeModal(teamModal);
        window.location.reload();
      } catch (error) {
        showPopup('Unable to delete team.', 'error');
        console.error('Error deleting team:', error);
      }
    });
  }

  if (userForm) {
    userForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const userId = document.getElementById('admin-user-id')?.value;
      if (!userId) return;

      const payload = {
        firstname: document.getElementById('admin-user-firstname')?.value || '',
        lastname: document.getElementById('admin-user-lastname')?.value || '',
        email: document.getElementById('admin-user-email')?.value || '',
        username: document.getElementById('admin-user-username')?.value || ''
      };

      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const message = data?.error || data?.message || 'Unable to update user.';
          showPopup(message, 'error');
          return;
        }

        showPopup('User updated.', 'success');
        closeModal(userModal);
        window.location.reload();
      } catch (error) {
        showPopup('Unable to update user.', 'error');
        console.error('Error updating user:', error);
      }
    });
  }
});
