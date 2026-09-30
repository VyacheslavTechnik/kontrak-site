'use strict';

/**
 * CONFIGURATION
 * Public HTTPS address of the n8n webhook.
 * No Telegram bot token or other private secrets belong in frontend code.
 */
const SITE_CONFIG = Object.freeze({
  webhookUrl: 'https://n8n.vahta-podbor.ru/webhook/leads',
  yandexMetricaId: 113226768,
});

const JOBS = Object.freeze({
  driver: {
    name: 'Водители B, C, D, E',
    description: 'От 300 000 ₽ в месяц. Работа на служебном транспорте: УАЗ Патриот, УРАЛ, КАМАЗ. Перевозки и сопровождение грузов. Нужны права выбранной категории.'
  },
  security: {
    name: 'Охрана объектов инфраструктуры',
    description: 'От 280 000 ₽ в месяц. Охрана инфраструктурных и гражданских объектов в тылу. Сопровождение грузов. Можно без опыта.'
  },
  laborer: {
    name: 'Разнорабочий',
    description: 'От 230 000 ₽ в месяц. Работа на окопах, погрузка и разгрузка, МТО, стройка. Можно без опыта.'
  },
  rembat: {
    name: 'Рембат: механики / слесари',
    description: 'От 280 000 ₽ в месяц. Ремонт и обслуживание механизированной техники. Разбор техники. Требуется опыт.'
  },
  welder: {
    name: 'Сварщик',
    description: 'От 280 000 ₽ в месяц. Сварочные работы на объектах и технике. От 2 разряда.'
  },
  tanker: {
    name: 'Водитель бензовоза',
    description: 'От 300 000 ₽ в месяц. Работа на служебном транспорте, снабжение на бензовозе и водовозе. Перевозки и сопровождение грузов. Нужны права выбранной категории.'
  },
  vohr: {
    name: 'Военизированная охрана (ВОХР)',
    description: 'От 280 000 ₽ в месяц. Охрана особо важных государственных и стратегических объектов, грузов, зданий и территорий. Можно без опыта.'
  },
  uav: {
    name: 'Оператор БПЛА',
    description: 'От 300 000 ₽ в месяц. Оператор БПЛА с обучением. Можно без опыта, опыт желателен.'
  },
  reb: {
    name: 'Специалист РЭБ',
    description: 'От 280 000 ₽ в месяц. Подавление связи, борьба с дронами, защита техники, радиоразведка. Требуется опыт.'
  },
  electrician: {
    name: 'Электрик',
    description: 'От 250 000 ₽ в месяц. Обслуживание электросетей и техники. Требуется опыт.'
  }
});

document.documentElement.classList.add('js-enabled');

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');

function closeMenu() {
  mobileNav.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
}

menuToggle.addEventListener('click', () => {
  const open = mobileNav.hidden;
  mobileNav.hidden = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});

mobileNav.querySelectorAll('a, button').forEach(el => el.addEventListener('click', closeMenu));

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) closeMenu();
});

const modalContact = document.querySelector('#contact-modal');
const modalJob = document.querySelector('#job-modal');

let lastFocus = null;
let activeJob = '';

function openModal(dialog) {
  if (typeof dialog.showModal !== 'function') return;
  lastFocus = document.activeElement;
  dialog.showModal();

  const focusTarget = dialog.querySelector('input:not([type=checkbox]), .modal-close');
  if (focusTarget) focusTarget.focus({ preventScroll: true });
}

function closeModal(dialog) {
  if (dialog.open) dialog.close();
}

[modalContact, modalJob].forEach(dialog => {
  dialog.querySelector('.modal-close').addEventListener('click', () => closeModal(dialog));

  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeModal(dialog);
  });

  dialog.addEventListener('close', () => {
    if (lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
  });
});

function eventGoal(goal) {
  const id = SITE_CONFIG.yandexMetricaId;

  if (id && typeof window.ym === 'function') {
    window.ym(id, 'reachGoal', goal);
  }
}

function openContact(vacancy = '') {
  modalContact.querySelector('input[name="vacancy"]').value = vacancy;

  const selectedJob = modalContact.querySelector('#selected-vacancy');
  selectedJob.hidden = !vacancy;

  modalContact.querySelector('#selected-vacancy-name').textContent = vacancy;

  openModal(modalContact);
  eventGoal('open_contact');
}

document.querySelectorAll('[data-open-contact]').forEach(button => {
  button.addEventListener('click', () => openContact());
});

document.querySelectorAll('[data-job]').forEach(button => {
  button.addEventListener('click', event => {
    event.preventDefault();

    activeJob = button.dataset.job;
    const job = JOBS[activeJob];

    if (!job) return;

    document.querySelector('#job-title').textContent = job.name;
    document.querySelector('#job-description').textContent = job.description;

    openModal(modalJob);
    eventGoal('view_vacancy');
  });
});

document.querySelectorAll('[data-apply-job]').forEach(button => {
  button.addEventListener('click', () => {
    const job = JOBS[button.dataset.applyJob];
    openContact(job?.name || '');
  });
});

document.querySelector('#job-contact').addEventListener('click', () => {
  const job = JOBS[activeJob];

  closeModal(modalJob);

  if (job) openContact(job.name);
});

if (
  'IntersectionObserver' in window &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches
) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: .06,
    rootMargin: '0px 0px 70px 0px'
  });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
}

function phoneDigits(value) {
  let digits = String(value).replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('8')) {
    digits = '7' + digits.slice(1);
  }

  return digits;
}

function maskPhone(value) {
  let digits = phoneDigits(value);

  if (!digits) return '';

  if (digits.startsWith('9')) {
    digits = '7' + digits;
  }

  if (!digits.startsWith('7')) {
    return '+' + digits.slice(0, 15);
  }

  const rest = digits.slice(1, 11);

  let result = '+7';

  if (rest) result += ' (' + rest.slice(0, 3);
  if (rest.length >= 3) result += ')';
  if (rest.length > 3) result += ' ' + rest.slice(3, 6);
  if (rest.length > 6) result += '-' + rest.slice(6, 8);
  if (rest.length > 8) result += '-' + rest.slice(8, 10);

  return result;
}

document.querySelectorAll('input[name="phone"]').forEach(input => {
  input.addEventListener('input', () => {
    input.value = maskPhone(input.value);
  });
});

function getTracking() {
  const params = new URLSearchParams(window.location.search);

  return Object.fromEntries(
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid']
      .map(key => [key, params.get(key) || ''])
  );
}

function setStatus(form, message, state) {
  const status = form.querySelector('.form-status');
  status.textContent = message;
  status.dataset.state = state;
}

function validateForm(form) {
  let firstBad = null;

  for (const field of form.querySelectorAll('[required]')) {
    const bad = field.type === 'checkbox'
      ? !field.checked
      : !field.value.trim();

    field.setAttribute('aria-invalid', String(bad));

    if (bad && !firstBad) firstBad = field;
  }

  const fullName = form.elements.full_name;

  if (fullName.value.trim().split(/\s+/).filter(Boolean).length < 2) {
    fullName.setAttribute('aria-invalid', 'true');
    firstBad ||= fullName;
  }

  const phone = form.elements.phone;

  if (
    phoneDigits(phone.value).length !== 11 ||
    !phoneDigits(phone.value).startsWith('7')
  ) {
    phone.setAttribute('aria-invalid', 'true');
    firstBad ||= phone;
  }

  const age = form.elements.age;
  const ageNumber = Number(age.value);

  if (
    !Number.isInteger(ageNumber) ||
    ageNumber < 18 ||
    ageNumber > 64
  ) {
    age.setAttribute('aria-invalid', 'true');
    firstBad ||= age;
  }

  if (firstBad) {
    firstBad.focus();

    setStatus(
      form,
      'Проверьте ФИО (минимум два слова), телефон и возраст (18–64 года), а также согласие.',
      'error'
    );

    eventGoal('form_error');

    return false;
  }

  return true;
}

for (const form of document.querySelectorAll('.contact-form')) {
  form.addEventListener('input', event => {
    if (event.target.hasAttribute('aria-invalid')) {
      event.target.removeAttribute('aria-invalid');
    }
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();

    if (!validateForm(form)) return;

    if (!SITE_CONFIG.webhookUrl) {
      setStatus(
        form,
        'Демо: форма проверена, но данные не отправлены. Для реальных заявок необходимо подключить webhook.',
        'demo'
      );

      return;
    }

    const button = form.querySelector('[type="submit"]');

    button.disabled = true;

    const originalText = button.innerHTML;

    button.textContent = 'Отправляем…';

    try {
      const result = await fetch(SITE_CONFIG.webhookUrl, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        signal: AbortSignal.timeout(18000),

        body: JSON.stringify({
          full_name: form.elements.full_name.value.trim(),
          phone: phoneDigits(form.elements.phone.value),
          age: Number(form.elements.age.value),
          vacancy: form.elements.vacancy.value,
          consent: form.elements.consent.checked,
          website: form.elements.website?.value || '',
          source_url: location.href,
          ...getTracking(),
        }),
      });

      const payload = await result.json().catch(() => null);

      if (!result.ok || payload?.ok !== true) {
        throw new Error(
          `HTTP ${result.status}: ${payload?.message || payload?.error || 'send_failed'}`
        );
      }

      setStatus(
        form,
        'Заявка отправлена. Благодарим за обращение.',
        'success'
      );

      eventGoal('lead_success');

      form.reset();

    } catch (error) {
      console.error('Не удалось отправить форму:', error);

      setStatus(
        form,
        'Не удалось отправить заявку. Попробуйте ещё раз позже.',
        'error'
      );

      eventGoal('form_error');

    } finally {
      button.disabled = false;
      button.innerHTML = originalText;
    }
  });
}
