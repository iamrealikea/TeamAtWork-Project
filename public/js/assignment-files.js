function getFileType(ext) {
    const exts = {
    image: [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"],
    video: [".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v"],
    audio: [".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a"],
    document: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".md"],
    archive: [".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"],
  };
    ext = ext.toLowerCase();
    if (exts.image.includes(ext)) return 'image';
    if (exts.video.includes(ext)) return 'video';
    if (exts.audio.includes(ext)) return 'audio';
    if (exts.document.includes(ext)) return 'document';
    if (exts.archive.includes(ext)) return 'archive';
    return 'otherfile';
}

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('submission-files');
  const listEl = container?.querySelector('.flexlist');
  const emptyEl = document.getElementById('submission-empty');
  const formEl = document.getElementById('submission-form');
  const fileInput = document.getElementById('submissionFileInput');
  const filePreview = document.getElementById('submissionFilePreview');
  const fileClearBtn = document.getElementById('submissionClearBtn');
  const dropzone = document.getElementById('submissionDropzone');
  const allContainer = document.getElementById('submission-all');
  const allListEl = allContainer?.querySelector('.flexlist');
  const allEmptyEl = document.getElementById('submission-all-empty');

  if (!container || !listEl || !emptyEl) return;

  const teamId = container.dataset.teamId;
  const assignId = container.dataset.assignId;
  const assignmentCreatorId = Number(container.dataset.assignmentCreatorId);
  const claimBtn = document.getElementById('claim-assign');
  const abandonBtn = document.getElementById('abandon-assign');
  const markBtn = document.getElementById('mark-assign');

  const renderEmpty = () => {
    emptyEl.style.display = 'block';
  };

  const showPopup = (message, variant = 'info', shouldRefresh = false) => {
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
      if (shouldRefresh) window.location.reload();
    }, 1600);
  };

  const renderFilePreview = (files) => {
    if (!filePreview) return;
    filePreview.innerHTML = '';

    if (!files || files.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'file-preview-empty';
      empty.textContent = 'No files chosen.';
      filePreview.appendChild(empty);
      return;
    }

    Array.from(files).forEach((file) => {
      const item = document.createElement('div');
      item.className = 'file-preview-item';

      const icon = document.createElement('img');
      const ext = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '';
      const type = getFileType(ext);
      icon.src = `/icon/${type}.svg`;
      icon.alt = type;
      icon.className = `file-preview-icon`;

      const name = document.createElement('span');
      name.className = 'file-preview-name';
      name.textContent = file.name;

      const size = document.createElement('span');
      size.textContent = `${Math.ceil(file.size / 1024)} KB`;

      item.appendChild(icon);
      item.appendChild(name);
      item.appendChild(size);
      filePreview.appendChild(item);
    });
  };

  if (fileInput) {
    renderFilePreview(fileInput.files);
    fileInput.addEventListener('change', () => {
      renderFilePreview(fileInput.files);
    });
  }

  if (dropzone.classList.contains('disabled')) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
        dropzone.addEventListener(event, e => {
            e.preventDefault();
            e.stopPropagation();
        });
    });
}

  if (dropzone && fileInput) {
    const stopDefaults = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    ['dragenter', 'dragover'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (event) => {
        stopDefaults(event);
        dropzone.classList.add('is-dragover');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (event) => {
        stopDefaults(event);
        dropzone.classList.remove('is-dragover');
      });
    });

    dropzone.addEventListener('drop', (event) => {
      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const dataTransfer = new DataTransfer();
      Array.from(files).forEach((file) => dataTransfer.items.add(file));
      fileInput.files = dataTransfer.files;
      renderFilePreview(fileInput.files);
    });
  }

  if (fileClearBtn && fileInput) {
    fileClearBtn.addEventListener('click', () => {
      fileInput.value = '';
      renderFilePreview([]);
    });
  }

  if (formEl) {
    formEl.addEventListener('submit', async (event) => {
      event.preventDefault();

      const selectedInput = fileInput || formEl.querySelector('input[type="file"]');
      if (!selectedInput || !selectedInput.files || selectedInput.files.length === 0) {
        showPopup('Please choose file(s) to upload.', 'error');
        return;
      }

      try {
        const formData = new FormData(formEl);
        const response = await fetch(formEl.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) throw new Error('Upload failed');

        showPopup('Upload complete.', 'success', true);
      } catch (error) {
        showPopup('Upload failed. Please try again.', 'error');
      }
    });
  }

  const handleClaimAction = async (action) => {
    try {
      const response = await fetch(
        `/api/team/${teamId}/assign/${assignId}?action=${action}`,
        { method: 'PATCH', headers: { 'Accept': 'application/json' } }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data?.error || data?.message || 'Unable to update assignment.';
        showPopup(message, 'error');
        return;
      }

      const message = data?.message || 'Assignment updated.';
      showPopup(message, 'success', true);
    } catch (error) {
      showPopup('Unable to update assignment.', 'error');
      console.error('Error updating assignment:', error);
    }
  };

  if (claimBtn) {
    claimBtn.addEventListener('click', () => handleClaimAction('claim'));
  }

  if (abandonBtn) {
    abandonBtn.addEventListener('click', () => handleClaimAction('unclaim'));
  }

  const handleMarkAssignment = async () => {
    const label = markBtn?.textContent || '';
    const isUnmark = label.toLowerCase().includes('unmark');
    const nextStatus = isUnmark ? 'Pending' : 'Submitted';
    try {
      const response = await fetch(
        `/api/team/${teamId}/assign/${assignId}/mark`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: nextStatus })
        }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data?.error || data?.message || 'Unable to mark assignment.';
        showPopup(message, 'error');
        return;
      }

      const message = data?.message || (isUnmark
        ? 'Assignment marked as pending.'
        : 'Assignment marked as finished.');
      showPopup(message, 'success', true);
    } catch (error) {
      showPopup('Unable to mark assignment.', 'error');
      console.error('Error marking assignment:', error);
    }
  };

  if (markBtn) {
    markBtn.addEventListener('click', handleMarkAssignment);
  }

  const renderList = (files) => {
    listEl.innerHTML = '';
    files.sort((a, b) => {
      const aCreator = Number(a.user_id) === assignmentCreatorId ? 0 : 1;
      const bCreator = Number(b.user_id) === assignmentCreatorId ? 0 : 1;
      if (aCreator !== bCreator) return aCreator - bCreator;
      return 0;
    });
    files.forEach((file) => {
      const fileId = file.file_id;
      const ext = file.file_ext || '';
      const original = file.file_original || `file${ext}`;
      const href = `/api/team/${teamId}/assign/${assignId}/files/download/${fileId}${ext}`;
      const type = getFileType(ext);

      const card = document.createElement('div');
      card.className = 'file-card';

      const icon = document.createElement('img');
      icon.className = `file-icon file-icon--${type}`;
      icon.setAttribute('aria-hidden', 'true');
      icon.src = `/icon/${type}.svg`;
      icon.alt = `${type}`;

      const info = document.createElement('div');
      info.className = 'file-info';

      const link = document.createElement('a');
      link.href = href;
      link.className = 'file-name';
      link.textContent = original+ext;
      link.title = 'Click to download';

      info.appendChild(link);

      const currentUserId = Number(container.dataset.currentUserId);
      if (Number(file.user_id) === currentUserId) {
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'file-delete';
        del.textContent = 'Delete';

        del.addEventListener('click', async () => {
          try {
            const response = await fetch(
              `/api/team/${teamId}/assign/${assignId}/files/${fileId}${ext}`,
              { method: 'DELETE', headers: { 'Accept': 'application/json' } }
            );

            if (!response.ok) throw new Error('Delete failed');
            showPopup('File deleted.', 'success', true);
          } catch (error) {
            showPopup('Unable to delete file.', 'error');
            console.error('Error deleting file:', error);
          }
        });

        info.appendChild(del);
      }

      card.appendChild(icon);
      card.appendChild(info);
      listEl.appendChild(card);
    });
  };

  const renderAllSubmissions = (grouped) => {
    if (!allListEl) return;
    allListEl.innerHTML = '';
    Object.values(grouped).forEach((entry) => {
      const user = entry.user || {};
      const files = entry.files || [];

      const card = document.createElement('div');
      card.className = 'member-card';

      const avatar = document.createElement('img');
      avatar.className = 'member-avatar';
      avatar.alt = `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Member avatar';
      avatar.src = (user.avatar_hash && user.avatar_ext)
        ? `/uploads/profiles/${user.avatar_hash}${user.avatar_ext}`
        : '/default-avatar.png';

      const info = document.createElement('div');
      info.className = 'member-info';

      const name = document.createElement('div');
      name.className = 'member-name';
      name.textContent = `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Unnamed member';

      const status = document.createElement('div');
      status.className = 'member-status';
      status.textContent = user.status || 'Submitted';

      const fileList = document.createElement('div');
      fileList.className = 'member-files';

      if (files.length === 0) {
        const emptyFiles = document.createElement('span');
        emptyFiles.className = 'member-files-empty';
        emptyFiles.textContent = 'No files uploaded yet.';
        fileList.appendChild(emptyFiles);
      } else {
        files.forEach((file) => {
          const fileId = file.file_id;
          const ext = file.file_ext || '';
          const original = file.file_original || `file${ext}`;
          const href = `/api/team/${teamId}/assign/${assignId}/files/download/${fileId}${ext}`;

          const link = document.createElement('a');
          link.href = href;
          link.className = 'file-name';
          link.textContent = `${original}${ext}`;
          link.title = 'Click to download';
          fileList.appendChild(link);
        });
      }

      info.appendChild(name);
      info.appendChild(status);
      info.appendChild(fileList);
      card.appendChild(avatar);
      card.appendChild(info);
      allListEl.appendChild(card);
    });
  };


  
  try {
    const response = await fetch(`/api/team/${teamId}/assign/${assignId}/files`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`Request failed: ${response.status}`);

    const data = await response.json();
    const files = Array.isArray(data?.files) ? data.files : [];

    if (files.length === 0) {
      renderEmpty();
      return;
    }

    emptyEl.style.display = 'none';
    renderList(files);
    
  } catch (error) {
    emptyEl.textContent = 'Unable to load files.';
    emptyEl.style.display = 'block';
    console.error('Error fetching files:', error);
  }

  if (allContainer && allListEl && allEmptyEl) {
    try {
      const [filesResponse, claimedResponse] = await Promise.all([
        fetch(`/api/team/${teamId}/assign/${assignId}/files/all`, {
          headers: { 'Accept': 'application/json' }
        }),
        fetch(`/api/team/${teamId}/assign/${assignId}/claimed`, {
          headers: { 'Accept': 'application/json' }
        })
      ]);

      const filesData = await filesResponse.json().catch(() => ({}));
      const claimedData = await claimedResponse.json().catch(() => ({}));

      if (!filesResponse.ok && !claimedResponse.ok) {
        const message = filesData?.error || claimedData?.error || filesData?.message || claimedData?.message || 'Unable to load submissions.';
        allEmptyEl.textContent = message;
        allEmptyEl.style.display = 'block';
        return;
      }

      const grouped = filesResponse.ok ? (filesData?.files || {}) : {};
      const claimed = claimedResponse.ok ? (claimedData?.members || []) : [];
      const merged = { ...grouped };

      claimed.forEach((member) => {
        const key = String(member.id);
        if (!merged[key]) {
          merged[key] = {
            user: {
              id: member.id,
              firstname: member.firstname,
              lastname: member.lastname,
              avatar_hash: member.avatar_hash,
              avatar_ext: member.avatar_ext,
              status: member.status,
              submitted_at: member.submitted_at
            },
            files: []
          };
          return;
        }

        const existing = merged[key].user || {};
        merged[key].user = {
          id: existing.id || member.id,
          firstname: existing.firstname || member.firstname,
          lastname: existing.lastname || member.lastname,
          avatar_hash: existing.avatar_hash || member.avatar_hash,
          avatar_ext: existing.avatar_ext || member.avatar_ext,
          status: existing.status || member.status,
          submitted_at: existing.submitted_at || member.submitted_at
        };
      });

      const sortedEntries = Object.entries(merged).sort(([aId, aEntry], [bId, bEntry]) => {
        const aIsCreator = Number(aEntry.user.id) === assignmentCreatorId;
        const bIsCreator = Number(bEntry.user.id) === assignmentCreatorId;
        if (aIsCreator && !bIsCreator) return -1;
        if (!aIsCreator && bIsCreator) return 1;
        return aEntry.user.firstname.localeCompare(bEntry.user.firstname) || aEntry.user.lastname.localeCompare(bEntry.user.lastname);
      });

      const mergedOrdered = Object.fromEntries(sortedEntries);
      const hasEntries = Object.keys(mergedOrdered).length > 0;
      if (!hasEntries) {
        allEmptyEl.style.display = 'block';
        return;
      }

      allEmptyEl.style.display = 'none';
      renderAllSubmissions(mergedOrdered);
    } catch (error) {
      allEmptyEl.textContent = 'Unable to load submissions.';
      allEmptyEl.style.display = 'block';
      console.error('Error fetching submissions:', error);
    }
  }
});

const btnEdit = document.getElementById('edit-assign');
if (btnEdit) {
  btnEdit.addEventListener('click', () => {
    const container = document.getElementById('submission-files');
    const tId = container?.dataset.teamId;
    const aId = container?.dataset.assignId;
    if (!tId || !aId) return;
    window.location.href = `/team/${tId}/assign/${aId}?action=edit`;
  });
}