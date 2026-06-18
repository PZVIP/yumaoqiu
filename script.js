const $ = (id) => document.getElementById(id);
const fields = ['hours', 'courtPrice', 'ballPrice', 'balls', 'boys', 'girls'];

fields.forEach((name) => $(name).addEventListener('input', calculate));

$('girlsHalf').addEventListener('change', () => {
  $('splitMode').value = $('girlsHalf').checked ? 'all-half' : 'all';
  calculate();
});

$('splitMode').addEventListener('change', () => {
  $('girlsHalf').checked = $('splitMode').value === 'all-half';
  calculate();
});

function num(id) {
  return Number($(id).value) || 0;
}

function money(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function calculate() {
  const hours = num('hours');
  const courtPrice = num('courtPrice');
  const ballPrice = num('ballPrice');
  const balls = num('balls');
  const boys = num('boys');
  const girls = num('girls');
  const people = boys + girls;
  const courtTotal = hours * courtPrice;
  const ballTotal = ballPrice * balls;
  const courtAvg = people ? courtTotal / people : 0;
  const ballUnits = boys + ($('girlsHalf').checked ? girls * 0.5 : girls);
  const ballAvg = ballUnits ? ballTotal / ballUnits : 0;
  const boyPay = courtAvg + ballAvg;
  const girlPay = courtAvg + ($('girlsHalf').checked ? ballAvg / 2 : ballAvg);

  $('courtTotal').textContent = money(courtTotal);
  $('courtAvg').textContent = money(courtAvg);
  $('ballTotal').textContent = money(ballTotal);
  $('ballAvg').textContent = money(ballAvg);
  $('grandTotal').textContent = `${money(courtTotal + ballTotal)} 元`;
  $('perPay').textContent = people ? `男 ¥${money(boyPay)} / 女 ¥${money(girlPay)}` : '¥0';
}

function toggleOverlay(id, show) {
  $(id).classList.toggle('hidden', !show);
  $(id).setAttribute('aria-hidden', String(!show));
}

$('shareBtn').addEventListener('click', () => {
  $('imageCopy').innerHTML = $('capture').outerHTML;
  toggleOverlay('preview', true);
});

$('closePreview').addEventListener('click', () => toggleOverlay('preview', false));
$('settingBtn').addEventListener('click', () => toggleOverlay('settings', true));
$('closeSettings').addEventListener('click', () => toggleOverlay('settings', false));
$('cancelSettings').addEventListener('click', () => toggleOverlay('settings', false));

$('settingsForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const defaultMap = {
    setHours: 'hours',
    setCourt: 'courtPrice',
    setBallPrice: 'ballPrice',
    setBoys: 'boys',
    setGirls: 'girls',
  };

  Object.entries(defaultMap).forEach(([from, to]) => {
    if ($(from).value !== '') $(to).value = $(from).value;
  });

  document.querySelector('.title').innerHTML = `<span aria-hidden="true">🏸</span>${$('defaultTitle').value || '董老师羽毛球俱乐部'}`;
  $('splitMode').value = $('defaultMode').value;
  $('girlsHalf').checked = $('defaultMode').value === 'all-half';
  toggleOverlay('settings', false);
  calculate();
});

calculate();
