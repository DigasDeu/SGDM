document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('notificationBtn');
    const dropdown = document.getElementById('notificationDropdown');
    const countEl = document.getElementById('notificationCount');
    const list = document.getElementById('notificationList');

    if (!btn || !dropdown || !countEl || !list) return;

    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdown.classList.toggle('active');
    });

    // Close when clicking outside
    document.addEventListener('click', function () {
        dropdown.classList.remove('active');
    });

    // Example helper to update count from items with class 'notification-item'
    function updateCount() {
        const items = list.querySelectorAll('.notification-item');
        const count = items.length;
        countEl.textContent = count;
        if (count > 0) countEl.classList.add('has-items'); else countEl.classList.remove('has-items');
    }

    // Expose helpers for other scripts
    window.notificationDropdown = {
        add(notificationHtml) {
            // remove placeholder
            const empty = list.querySelector('.empty-notification');
            if (empty) empty.remove();
            const wrapper = document.createElement('div');
            wrapper.className = 'notification-item';
            wrapper.innerHTML = notificationHtml;
            list.prepend(wrapper);
            updateCount();
        },
        clear() {
            list.innerHTML = '<p class="empty-notification">Nenhuma notificação.</p>';
            updateCount();
        },
        open() { dropdown.classList.add('active'); },
        close() { dropdown.classList.remove('active'); }
    };

    updateCount();
});
