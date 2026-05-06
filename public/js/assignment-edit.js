document.addEventListener('DOMContentLoaded', () => {
  const formEl = document.getElementById('assignment-edit-form');
  const memberContainer = document.getElementById('claimed-member-list');
  const memberList = memberContainer?.querySelector('.flexlist');
  const memberEmpty = document.getElementById('claimed-member-empty');
  const unclaimedContainer = document.getElementById('unclaimed-member-list');
  const unclaimedList = unclaimedContainer?.querySelector('.flexlist');
  const unclaimedEmpty = document.getElementById('unclaimed-member-empty');
  const backButton = document.getElementById('back-btn');
  const deleteButton = document.getElementById('delete-btn');
  if (!formEl) return;

  const showPopup = (message, variant = 'info', shouldRedirect = false) => {
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
      if (shouldRedirect) {
        const teamId = formEl.dataset.teamId;
        const assignId = formEl.dataset.assignId;
        if (teamId && assignId) {
          window.location.href = `/team/${teamId}/assign/${assignId}?action=view`;
        } else {
          window.location.reload();
        }
      }
    }, 1600);
  };

  formEl.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData(formEl);
      const body = new URLSearchParams(formData);
      const response = await fetch(formEl.action, {
        method: 'POST',
        body,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data?.error || data?.message || 'Unable to save changes.';
        showPopup(message, 'error');
        return;
      }

      const message = data?.message || 'Changes saved.';
      showPopup(message, 'success', true);
    } catch (error) {
      showPopup('Unable to save changes.', 'error');
      console.error('Error saving assignment:', error);
    }
  });

  if (backButton) {
    backButton.addEventListener('click', () => {
      const teamId = formEl.dataset.teamId;
      const assignId = formEl.dataset.assignId;
      if (!teamId || !assignId) return;
      window.location.href = `/team/${teamId}/assign/${assignId}?action=view`;
    });
  }

  if (deleteButton) {
    deleteButton.addEventListener('click', async () => {
      const teamId = formEl.dataset.teamId;
      const assignId = formEl.dataset.assignId;
      if (!teamId || !assignId) return;

      const confirmed = window.confirm('Delete this assignment? This cannot be undone.');
      if (!confirmed) return;

      try {
        const response = await fetch(`/api/team/${teamId}/assign/${assignId}`, {
          method: 'DELETE',
          headers: { 'Accept': 'application/json' }
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const message = data?.error || data?.message || 'Unable to delete assignment.';
          showPopup(message, 'error');
          return;
        }

        showPopup('Assignment deleted.', 'success');
        window.setTimeout(() => {
          window.location.href = `/team/${teamId}?action=view`;
        }, 800);
      } catch (error) {
        showPopup('Unable to delete assignment.', 'error');
        console.error('Error deleting assignment:', error);
      }
    });
  }

  const assignedMembers = (members) => {
    if (!memberList) return;
    memberList.innerHTML = '';
    members.forEach((member) => {
      const card = document.createElement('div');
      card.className = 'member-card member-card--action';

      const avatar = document.createElement('img');
      avatar.className = 'member-avatar';
      avatar.alt = `${member.firstname || ''} ${member.lastname || ''}`.trim() || 'Member avatar';
      avatar.src = (member.avatar_hash && member.avatar_ext)
        ? `/uploads/profiles/${member.avatar_hash}${member.avatar_ext}`
        : '/default-avatar.png';

      const info = document.createElement('div');
      info.className = 'member-info';

      const name = document.createElement('div');
      name.className = 'member-name';
      name.textContent = `${member.firstname || ''} ${member.lastname || ''}`.trim() || 'Unnamed member';

      const status = document.createElement('div');
      status.className = 'member-status';
      status.textContent = member.status || 'Claimed';

      const actionWrap = document.createElement('div');
      actionWrap.className = 'member-action';

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'btn member-action-btn';
      removeBtn.textContent = 'Unassign';

      removeBtn.addEventListener('click', async () => {
        const teamId = memberContainer?.dataset.teamId;
        const assignId = memberContainer?.dataset.assignId;
        if (!teamId || !assignId) return;

        try {
          const response = await fetch(`/api/team/${teamId}/assign/${assignId}/members/${member.id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' }
          });

          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            const message = data?.error || data?.message || 'Unable to unassign member.';
            showPopup(message, 'error');
            return;
          }

          showPopup('Member unassigned.', 'success');
          loadClaimedMembers();
          loadUnclaimedMembers();
        } catch (error) {
          showPopup('Unable to unassign member.', 'error');
          console.error('Error unassigning member:', error);
        }
      });

      info.appendChild(name);
      info.appendChild(status);
      actionWrap.appendChild(removeBtn);
      card.appendChild(avatar);
      card.appendChild(info);
      card.appendChild(actionWrap);
      memberList.appendChild(card);
    });
  };

  const renderUnclaimedMembers = (members) => {
    if (!unclaimedList) return;
    unclaimedList.innerHTML = '';
    members.forEach((member) => {
      const card = document.createElement('div');
      card.className = 'member-card member-card--action';

      const avatar = document.createElement('img');
      avatar.className = 'member-avatar';
      avatar.alt = `${member.firstname || ''} ${member.lastname || ''}`.trim() || 'Member avatar';
      avatar.src = (member.avatar_hash && member.avatar_ext)
        ? `/uploads/profiles/${member.avatar_hash}${member.avatar_ext}`
        : '/default-avatar.png';

      const info = document.createElement('div');
      info.className = 'member-info';

      const name = document.createElement('div');
      name.className = 'member-name';
      name.textContent = `${member.firstname || ''} ${member.lastname || ''}`.trim() || 'Unnamed member';

      const status = document.createElement('div');
      status.className = 'member-status';
      status.textContent = 'Not assigned';

      const actionWrap = document.createElement('div');
      actionWrap.className = 'member-action';

      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'btn member-action-btn';
      addBtn.textContent = 'Add';

      addBtn.addEventListener('click', async () => {
        const teamId = unclaimedContainer?.dataset.teamId;
        const assignId = unclaimedContainer?.dataset.assignId;
        if (!teamId || !assignId) return;

        try {
          const response = await fetch(`/api/team/${teamId}/assign/${assignId}/members`, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: member.id })
          });

          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            const message = data?.error || data?.message || 'Unable to add member.';
            showPopup(message, 'error');
            return;
          }

          showPopup('Member added.', 'success');
          loadClaimedMembers();
          loadUnclaimedMembers();
        } catch (error) {
          showPopup('Unable to add member.', 'error');
          console.error('Error adding member:', error);
        }
      });

      info.appendChild(name);
      info.appendChild(status);
      actionWrap.appendChild(addBtn);
      card.appendChild(avatar);
      card.appendChild(info);
      card.appendChild(actionWrap);
      unclaimedList.appendChild(card);
    });
  };

  const loadClaimedMembers = async () => {
    if (!memberContainer || !memberList) return;
    const teamId = memberContainer.dataset.teamId;
    const assignId = memberContainer.dataset.assignId;
    if (!teamId || !assignId) return;

    try {
      const response = await fetch(`/api/team/${teamId}/assign/${assignId}/claimed`, {
        headers: { 'Accept': 'application/json' }
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data?.error || data?.message || 'Unable to load members.';
        if (memberList) memberList.innerHTML = '';
        if (memberEmpty) memberEmpty.textContent = message;
        if (memberEmpty) memberEmpty.style.display = 'block';
        return;
      }

      const members = Array.isArray(data?.members) ? data.members : [];
      if (members.length === 0) {
        if (memberList) memberList.innerHTML = '';
        if (memberEmpty) memberEmpty.style.display = 'block';
        return;
      }

      if (memberEmpty) memberEmpty.style.display = 'none';
      assignedMembers(members);
    } catch (error) {
      if (memberList) memberList.innerHTML = '';
      if (memberEmpty) {
        memberEmpty.textContent = 'Unable to load members.';
        memberEmpty.style.display = 'block';
      }
      console.error('Error loading claimed members:', error);
    }
  };

  const loadUnclaimedMembers = async () => {
    if (!unclaimedContainer || !unclaimedList) return;
    const teamId = unclaimedContainer.dataset.teamId;
    const assignId = unclaimedContainer.dataset.assignId;
    if (!teamId || !assignId) return;

    try {
      const response = await fetch(`/api/team/${teamId}/assign/${assignId}/unclaimed`, {
        headers: { 'Accept': 'application/json' }
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data?.error || data?.message || 'Unable to load members.';
        if (unclaimedList) unclaimedList.innerHTML = '';
        if (unclaimedEmpty) unclaimedEmpty.textContent = message;
        if (unclaimedEmpty) unclaimedEmpty.style.display = 'block';
        return;
      }

      const members = Array.isArray(data?.members) ? data.members : [];
      if (members.length === 0) {
        if (unclaimedList) unclaimedList.innerHTML = '';
        if (unclaimedEmpty) unclaimedEmpty.style.display = 'block';
        return;
      }

      if (unclaimedEmpty) unclaimedEmpty.style.display = 'none';
      renderUnclaimedMembers(members);
    } catch (error) {
      if (unclaimedList) unclaimedList.innerHTML = '';
      if (unclaimedEmpty) {
        unclaimedEmpty.textContent = 'Unable to load members.';
        unclaimedEmpty.style.display = 'block';
      }
      console.error('Error loading unclaimed members:', error);
    }
  };

  loadClaimedMembers();
  loadUnclaimedMembers();
});
