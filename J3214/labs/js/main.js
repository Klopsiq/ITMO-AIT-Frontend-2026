/**
 * Omagad — основной JS-файл
 * Обработчики событий для всех страниц
 */

document.addEventListener('DOMContentLoaded', function () {

  /* =============================================
     LOGIN PAGE
     ============================================= */
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      // Имитация успешного входа — редирект на дашборд
      window.location.href = 'dashboard.html';
    });
  }

  /* =============================================
     REGISTER PAGE
     ============================================= */
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const password = document.getElementById('regPassword').value;
      const confirm = document.getElementById('regConfirm').value;
      const errorEl = document.getElementById('passwordError');

      if (password !== confirm) {
        errorEl.classList.remove('d-none');
        document.getElementById('regPassword').classList.add('is-invalid');
        document.getElementById('regConfirm').classList.add('is-invalid');
        return;
      }
      if (errorEl) errorEl.classList.add('d-none');

      // Показываем модалку успеха
      const modal = new bootstrap.Modal(document.getElementById('successModal'));
      modal.show();
    });

    // Сброс ошибки при вводе
    ['regPassword', 'regConfirm'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', function () {
          el.classList.remove('is-invalid');
          const err = document.getElementById('passwordError');
          if (err) err.classList.add('d-none');
        });
      }
    });
  }

  /* =============================================
     SEARCH PAGE — фильтрация курсов
     ============================================= */
  const searchInput = document.getElementById('courseSearch');
  const courseCards = document.querySelectorAll('.course-card-wrap');
  const noResults = document.getElementById('noResults');

  function filterCourses() {
    if (!courseCards.length) return;

    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const checkedSubjects = [...document.querySelectorAll('input[name="subject"]:checked')].map(i => i.value);
    const selectedLevel = document.querySelector('input[name="level"]:checked');
    const selectedPrice = document.querySelector('input[name="price"]:checked');

    let visible = 0;

    courseCards.forEach(function (wrap) {
      const title = (wrap.dataset.title || '').toLowerCase();
      const subject = wrap.dataset.subject || '';
      const level = wrap.dataset.level || '';
      const price = parseInt(wrap.dataset.price || '0');

      let show = true;

      // Поиск по названию
      if (query && !title.includes(query)) show = false;

      // Фильтр по предмету
      if (checkedSubjects.length && !checkedSubjects.includes(subject)) show = false;

      // Фильтр по уровню
      if (selectedLevel && selectedLevel.value !== 'all' && level !== selectedLevel.value) show = false;

      // Фильтр по цене
      if (selectedPrice) {
        const pv = selectedPrice.value;
        if (pv === 'free' && price !== 0) show = false;
        if (pv === '1000' && (price === 0 || price > 1000)) show = false;
        if (pv === '5000' && (price === 0 || price > 5000)) show = false;
      }

      wrap.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (noResults) {
      noResults.style.display = visible === 0 ? '' : 'none';
    }
  }

  if (searchInput) searchInput.addEventListener('input', filterCourses);

  document.querySelectorAll('input[name="subject"], input[name="level"], input[name="price"]')
    .forEach(function (el) {
      el.addEventListener('change', filterCourses);
    });

  const resetFilters = document.getElementById('resetFilters');
  if (resetFilters) {
    resetFilters.addEventListener('click', function () {
      document.querySelectorAll('input[name="subject"]').forEach(i => i.checked = false);
      const allLevel = document.querySelector('input[name="level"][value="all"]');
      if (allLevel) allLevel.checked = true;
      const allPrice = document.querySelector('input[name="price"][value="all"]');
      if (allPrice) allPrice.checked = true;
      if (searchInput) searchInput.value = '';
      filterCourses();
    });
  }

  /* =============================================
     DASHBOARD — переключение боковой панели (мобайл)
     ============================================= */
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function () {
      sidebar.classList.toggle('show');
      if (sidebarOverlay) sidebarOverlay.style.display = sidebar.classList.contains('show') ? 'block' : 'none';
    });
  }
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', function () {
      if (sidebar) sidebar.classList.remove('show');
      sidebarOverlay.style.display = 'none';
    });
  }

  /* =============================================
     COURSE PAGE — запись на курс
     ============================================= */
  const enrollBtn = document.getElementById('enrollBtn');
  if (enrollBtn) {
    enrollBtn.addEventListener('click', function () {
      const modal = new bootstrap.Modal(document.getElementById('enrollModal'));
      modal.show();
    });
  }

  // Открытие видео-лекции
  document.querySelectorAll('.open-video').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const title = btn.dataset.title || 'Лекция';
      const titleEl = document.getElementById('videoModalTitle');
      if (titleEl) titleEl.textContent = title;
      const modal = new bootstrap.Modal(document.getElementById('videoModal'));
      modal.show();
    });
  });

  // Добавление комментария
  const commentForm = document.getElementById('commentForm');
  if (commentForm) {
    commentForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = document.getElementById('commentInput');
      const text = input ? input.value.trim() : '';
      if (!text) return;

      const list = document.getElementById('commentsList');
      const now = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
      const item = document.createElement('div');
      item.className = 'comment-item';
      item.innerHTML = `
        <div class="comment-avatar">Я</div>
        <div class="comment-body">
          <span class="comment-author">Вы</span>
          <span class="comment-date">${now}</span>
          <p class="comment-text">${text.replace(/</g, '&lt;')}</p>
        </div>`;
      list.prepend(item);
      if (input) input.value = '';
    });
  }

  /* =============================================
     INSTRUCTOR — управление курсами
     ============================================= */
  // Подтверждение удаления
  let deletingRow = null;
  document.querySelectorAll('.delete-course').forEach(function (btn) {
    btn.addEventListener('click', function () {
      deletingRow = btn.closest('tr');
      const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
      modal.show();
    });
  });

  const confirmDelete = document.getElementById('confirmDelete');
  if (confirmDelete) {
    confirmDelete.addEventListener('click', function () {
      if (deletingRow) {
        deletingRow.remove();
        deletingRow = null;
      }
      bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
    });
  }

  // Сброс формы при закрытии модалки создания курса
  const courseFormModal = document.getElementById('courseFormModal');
  if (courseFormModal) {
    courseFormModal.addEventListener('hidden.bs.modal', function () {
      const form = document.getElementById('courseForm');
      if (form) {
        form.reset();
        document.getElementById('courseFormTitle').textContent = 'Создать курс';
      }
    });
  }

  // Кнопки «Редактировать»
  document.querySelectorAll('.edit-course').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const row = btn.closest('tr');
      const title = row.querySelector('.course-title-cell') ? row.querySelector('.course-title-cell').textContent : '';
      document.getElementById('courseFormTitle').textContent = 'Редактировать курс';
      const nameInput = document.getElementById('courseName');
      if (nameInput) nameInput.value = title.trim();
      const modal = new bootstrap.Modal(document.getElementById('courseFormModal'));
      modal.show();
    });
  });

  /* =============================================
     СЕРТИФИКАТ — предпросмотр
     ============================================= */
  document.querySelectorAll('.view-cert').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const name = btn.dataset.course || 'Курс';
      const certName = document.getElementById('certCourseName');
      if (certName) certName.textContent = name;
      const modal = new bootstrap.Modal(document.getElementById('certModal'));
      modal.show();
    });
  });

});
