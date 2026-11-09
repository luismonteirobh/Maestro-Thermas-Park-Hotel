/**
 * Motor de Orçamento e Reservas - Estilo Enjoy Hotéis
 * Maestro Thermas Park Hotel
 * Envio Direto para WhatsApp / LeadLinker
 */

(function () {
  'use strict';

  const CONFIG = {
    destino: 'circuito-aguas-quentes',
    hotel: 'Maestro Thermas Park & Hotel Fazenda',
    leadLinkerBase: 'https://leadlinker.com.br/?',
    googleAdsConversion: {
      send_to: 'AW-998789437/VhEgCMn8t9IZEL2iodwD'
    }
  };

  const SHORT_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const SHORT_WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Datas padrão: Entrada hoje e Saída 2 dias depois
  const now = new Date();
  let checkIn = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let checkOut = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

  let adults = 2;
  let children = 0;
  let rooms = 1;
  let childrenAges = [];
  let isSubmitting = false;

  // DOM Elements
  let valCheckin, valCheckout, valGuests;
  let dateInputCheckin, dateInputCheckout;
  let boxGuests, dropGuests;
  let countAdultsEl, countChildrenEl;
  let btnMinusAdult, btnPlusAdult, btnMinusChild, btnPlusChild;
  let agesContainer, btnDoneGuests;
  let inputName, inputPhone, btnSubmit, errorBanner, errorBannerText;

  function toIso(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function formatDateQuery(d) {
    if (!d) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const y = d.getFullYear();
    return `${day}/${m}/${y}`;
  }

  function toDisplay(d) {
    const w = SHORT_WEEKDAYS[d.getDay()];
    const day = String(d.getDate()).padStart(2, '0');
    const m = SHORT_MONTHS[d.getMonth()];
    return `${w}, ${day} De ${m}.`;
  }

  function parseIso(isoStr) {
    if (!isoStr) return null;
    const parts = isoStr.split('-');
    if (parts.length !== 3) return null;
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  function updateDisplays() {
    if (valCheckin) valCheckin.textContent = toDisplay(checkIn);
    if (valCheckout) valCheckout.textContent = toDisplay(checkOut);
    if (dateInputCheckin) dateInputCheckin.value = toIso(checkIn);
    if (dateInputCheckout) dateInputCheckout.value = toIso(checkOut);

    if (valGuests) {
      valGuests.textContent = `${adults} ${adults === 1 ? 'Adulto' : 'Adultos'}, ${children} ${children === 1 ? 'Criança' : 'Crianças'}`;
    }

    if (countAdultsEl) countAdultsEl.textContent = String(adults);
    if (countChildrenEl) countChildrenEl.textContent = String(children);

    if (btnMinusAdult) btnMinusAdult.disabled = (adults <= 1);
    if (btnMinusChild) btnMinusChild.disabled = (children <= 0);

    renderChildrenAges();
  }

  function renderChildrenAges() {
    if (!agesContainer) return;
    if (children <= 0) {
      agesContainer.style.display = 'none';
      agesContainer.innerHTML = '';
      return;
    }

    agesContainer.style.display = 'block';
    while (childrenAges.length < children) childrenAges.push(5);
    while (childrenAges.length > children) childrenAges.pop();

    let html = '<div class="enjoy-ages-header">Idade das Crianças:</div><div class="enjoy-ages-grid">';
    for (let i = 0; i < children; i++) {
      html += `
        <div class="enjoy-age-col">
          <label>Criança ${i + 1}</label>
          <select data-idx="${i}" class="enjoy-select-age">
            ${Array.from({ length: 13 }, (_, a) => `
              <option value="${a}" ${childrenAges[i] === a ? 'selected' : ''}>
                ${a === 0 ? 'Até 1 ano (bebê)' : a === 1 ? '1 ano' : `${a} anos`}
              </option>
            `).join('')}
          </select>
        </div>
      `;
    }
    html += '</div>';
    agesContainer.innerHTML = html;

    agesContainer.querySelectorAll('select').forEach(sel => {
      // Bloqueia a propagação para não fechar o dropdown ao interagir com o select
      ['click', 'mousedown', 'mouseup', 'pointerdown', 'touchstart'].forEach(evt => {
        sel.addEventListener(evt, function (e) {
          e.stopPropagation();
        });
      });

      sel.addEventListener('change', function (e) {
        e.stopPropagation();
        const idx = Number(this.getAttribute('data-idx'));
        childrenAges[idx] = Number(this.value);
      });
    });
  }

  function maskPhone(val) {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits.length ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function showError(msg, boxEl) {
    if (errorBanner && errorBannerText) {
      errorBannerText.textContent = msg;
      errorBanner.style.display = 'flex';
    }
    if (boxEl) {
      boxEl.classList.add('box-error');
      setTimeout(() => boxEl.classList.remove('box-error'), 4000);
    }
  }

  function clearError() {
    if (errorBanner) errorBanner.style.display = 'none';
    document.querySelectorAll('.enjoy-box.box-error').forEach(b => b.classList.remove('box-error'));
  }

  function handleSubmit() {
    if (isSubmitting) return;
    clearError();

    // 1. Validar Nome
    const nameVal = inputName ? inputName.value.trim() : '';
    if (!nameVal) {
      showError('Por favor, informe seu nome para receber o orçamento no WhatsApp.', inputName ? inputName.closest('.enjoy-box') : null);
      if (inputName) inputName.focus();
      return;
    }

    // 2. Validar WhatsApp
    const rawPhone = inputPhone ? inputPhone.value.replace(/\D/g, '') : '';
    if (rawPhone.length < 10) {
      showError('Por favor, informe seu WhatsApp com DDD para envio da cotação.', inputPhone ? inputPhone.closest('.enjoy-box') : null);
      if (inputPhone) inputPhone.focus();
      return;
    }

    // 3. Montar dados
    isSubmitting = true;
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span>ENVIANDO PARA O WHATSAPP...</span>';
    }

    const entradaStr = formatDateQuery(checkIn);
    const saidaStr = formatDateQuery(checkOut);
    const idadesStr = childrenAges.slice(0, children).join(',');

    const params = new URLSearchParams();
    params.set('destino', CONFIG.destino);
    params.set('entrada', entradaStr);
    params.set('saida', saidaStr);
    params.set('adultos', String(adults));
    params.set('criancas', String(children));
    params.set('hotel', CONFIG.hotel);
    params.set('idade_crianca', idadesStr);
    params.set('nome', nameVal);
    params.set('whatsapp', rawPhone);

    const targetUrl = `${CONFIG.leadLinkerBase}${params.toString()}`;

    let opened = false;
    function openTarget() {
      if (opened) return;
      opened = true;
      window.open(targetUrl, '_blank');

      if (btnSubmit) {
        btnSubmit.innerHTML = '<span>ORÇAMENTO ENVIADO COM SUCESSO!</span>';
      }

      setTimeout(() => {
        if (inputName) inputName.value = '';
        if (inputPhone) inputPhone.value = '';
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = `
            <svg viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
            <span>RECEBER ORÇAMENTO NO WHATSAPP</span>
          `;
        }
        isSubmitting = false;
      }, 4000);
    }

    // Conversão Google Ads com fallback seguro
    if (typeof window.gtag === 'function') {
      try {
        window.gtag('event', 'conversion', {
          send_to: CONFIG.googleAdsConversion.send_to,
          event_callback: openTarget
        });
        setTimeout(openTarget, 1000);
      } catch (err) {
        openTarget();
      }
    } else {
      openTarget();
    }
  }

  function openDatePicker(inputEl) {
    if (!inputEl) return;
    if (typeof inputEl.showPicker === 'function') {
      try {
        inputEl.showPicker();
        return;
      } catch (err) {
        // Fallback se o navegador lançar erro de estado
      }
    }
    try {
      inputEl.focus();
      inputEl.click();
    } catch (e) {}
  }

  function init() {
    valCheckin = document.getElementById('enjoyValCheckin');
    valCheckout = document.getElementById('enjoyValCheckout');
    valGuests = document.getElementById('enjoyValGuests');

    dateInputCheckin = document.getElementById('enjoyInputCheckin');
    dateInputCheckout = document.getElementById('enjoyInputCheckout');

    const boxCheckin = document.getElementById('enjoyBoxCheckin');
    const boxCheckout = document.getElementById('enjoyBoxCheckout');

    boxGuests = document.getElementById('enjoyBoxGuests');
    dropGuests = document.getElementById('enjoyDropGuests');

    countAdultsEl = document.getElementById('enjoyCountAdults');
    countChildrenEl = document.getElementById('enjoyCountChildren');
    btnMinusAdult = document.getElementById('enjoyMinusAdult');
    btnPlusAdult = document.getElementById('enjoyPlusAdult');
    btnMinusChild = document.getElementById('enjoyMinusChild');
    btnPlusChild = document.getElementById('enjoyPlusChild');

    agesContainer = document.getElementById('enjoyAgesContainer');
    btnDoneGuests = document.getElementById('enjoyBtnDoneGuests');

    inputName = document.getElementById('enjoyInputName');
    inputPhone = document.getElementById('enjoyInputPhone');
    btnSubmit = document.getElementById('enjoyBtnSubmit');
    errorBanner = document.getElementById('enjoyErrorBanner');
    errorBannerText = document.getElementById('enjoyErrorBannerText');

    // Abertura do calendário em QUALQUER parte do retângulo (cursor ou clique)
    if (boxCheckin && dateInputCheckin) {
      boxCheckin.addEventListener('click', function () {
        openDatePicker(dateInputCheckin);
      });
      dateInputCheckin.addEventListener('click', function () {
        openDatePicker(dateInputCheckin);
      });
    }

    if (boxCheckout && dateInputCheckout) {
      boxCheckout.addEventListener('click', function () {
        openDatePicker(dateInputCheckout);
      });
      dateInputCheckout.addEventListener('click', function () {
        openDatePicker(dateInputCheckout);
      });
    }

    // Inicializar limites das datas
    const todayIso = toIso(now);
    if (dateInputCheckin) {
      dateInputCheckin.min = todayIso;
      dateInputCheckin.addEventListener('change', function () {
        const d = parseIso(this.value);
        if (d) {
          checkIn = d;
          if (checkOut <= checkIn) {
            checkOut = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate() + 1);
          }
          if (dateInputCheckout) {
            dateInputCheckout.min = toIso(new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate() + 1));
          }
          updateDisplays();

          // Abre suavemente a saída após selecionar a entrada
          setTimeout(function () {
            openDatePicker(dateInputCheckout);
          }, 250);
        }
      });
    }

    if (dateInputCheckout) {
      dateInputCheckout.min = toIso(new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate() + 1));
      dateInputCheckout.addEventListener('change', function () {
        const d = parseIso(this.value);
        if (d) {
          if (d <= checkIn) {
            checkOut = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate() + 1);
          } else {
            checkOut = d;
          }
          updateDisplays();
        }
      });
    }

    // Evita fechamento acidental ao interagir dentro do dropdown de hóspedes
    if (dropGuests) {
      ['click', 'mousedown', 'mouseup', 'pointerdown', 'touchstart'].forEach(function (evt) {
        dropGuests.addEventListener(evt, function (e) {
          e.stopPropagation();
        });
      });
    }

    // Dropdown Hóspedes - Apenas abre/fecha se o clique for no box e NÃO dentro do dropdown
    if (boxGuests) {
      boxGuests.addEventListener('click', function (e) {
        if (dropGuests && dropGuests.contains(e.target)) {
          return; // Clique originou-se dentro do dropdown
        }
        e.stopPropagation();
        const isOpen = dropGuests && dropGuests.classList.contains('open');
        if (isOpen) {
          dropGuests.classList.remove('open');
          boxGuests.classList.remove('box-active');
        } else {
          dropGuests.classList.add('open');
          boxGuests.classList.add('box-active');
        }
      });
    }

    if (btnMinusAdult) {
      btnMinusAdult.addEventListener('click', function (e) {
        e.stopPropagation();
        if (adults > 1) { adults--; updateDisplays(); }
      });
    }
    if (btnPlusAdult) {
      btnPlusAdult.addEventListener('click', function (e) {
        e.stopPropagation();
        if (adults < 10) { adults++; updateDisplays(); }
      });
    }

    if (btnMinusChild) {
      btnMinusChild.addEventListener('click', function (e) {
        e.stopPropagation();
        if (children > 0) { children--; updateDisplays(); }
      });
    }
    if (btnPlusChild) {
      btnPlusChild.addEventListener('click', function (e) {
        e.stopPropagation();
        if (children < 6) { children++; updateDisplays(); }
      });
    }

    if (btnDoneGuests) {
      btnDoneGuests.addEventListener('click', function (e) {
        e.stopPropagation();
        if (dropGuests) dropGuests.classList.remove('open');
        if (boxGuests) boxGuests.classList.remove('box-active');
      });
    }

    // Fechar ao clicar fora
    document.addEventListener('click', function (e) {
      if (dropGuests && !dropGuests.contains(e.target) && (!boxGuests || !boxGuests.contains(e.target))) {
        dropGuests.classList.remove('open');
        if (boxGuests) boxGuests.classList.remove('box-active');
      }
    });

    // Inputs com máscara e remoção de erro
    if (inputPhone) {
      inputPhone.addEventListener('input', function () {
        this.value = maskPhone(this.value);
        clearError();
      });
    }

    if (inputName) {
      inputName.addEventListener('input', clearError);
    }

    // Submissão
    if (btnSubmit) {
      btnSubmit.addEventListener('click', handleSubmit);
    }

    // Interceptar rolagem para reservas
    document.querySelectorAll(".js_scrollToBooking, a[href*='#trigger-attraction'], a[href*='/maestro-thermas/ingresso']").forEach(el => {
      el.addEventListener('click', function (e) {
        const enjoySection = document.getElementById('enjoy-booking-section');
        if (enjoySection) {
          e.preventDefault();
          enjoySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (inputName) inputName.focus();
        }
      });
    });

    updateDisplays();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
