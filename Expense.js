// === 1. NAVIGASI HALAMAN (AUTO SCROLL) ===
const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    navLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    const targetId = link.getAttribute("data-page");
    const targetSection = document.getElementById(targetId);

    if(targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// === 2. FITUR TOMBOL GESER SLIDER ===
const scrollLeftBtn = document.getElementById('scrollLeft');
const scrollRightBtn = document.getElementById('scrollRight');
const listElement = document.getElementById('list');

scrollLeftBtn.addEventListener('click', () => {
  listElement.scrollBy({ left: -250, behavior: 'smooth' });
});

scrollRightBtn.addEventListener('click', () => {
  listElement.scrollBy({ left: 250, behavior: 'smooth' });
});

// === 3. LOGIKA DATA TRANSAKSI & MONTHLY SUMMARY ===
const form = document.getElementById('form');
const nameInput = document.getElementById('name');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date'); 
const balanceDisplay = document.getElementById('balance');

const monthFilter = document.getElementById('monthFilter');
const monthlyBalanceDisplay = document.getElementById('monthlyBalance');

let transactions = []; 

// Set default kalender ke hari ini
const today = new Date();
dateInput.value = today.toISOString().split('T')[0]; 

const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
monthFilter.value = currentMonth;

// Fungsi untuk update Saldo & Monthly Total
function updateUI() {
  const totalBalance = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  balanceDisplay.innerText = `Rp ${totalBalance.toLocaleString('id-ID')}`;

  const selectedMonth = monthFilter.value; 
  
  const monthlyTransactions = transactions.filter(trx => {
    const trxMonth = trx.date.substring(0, 7); 
    return trxMonth === selectedMonth;
  });

  const monthlyTotal = monthlyTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  monthlyBalanceDisplay.innerText = `Rp ${monthlyTotal.toLocaleString('id-ID')}`;
}

// Saat Form Ditambah
form.addEventListener('submit', function(event) {
  event.preventDefault(); 

  const nameValue = nameInput.value;
  const amountValue = Number(amountInput.value);
  const categoryValue = categoryInput.value;
  const dateValue = dateInput.value;

  let iconClass = 'fas fa-money-bill'; 
  let iconColor = '#555';
  if(categoryValue === 'Food') { iconClass = 'fas fa-hamburger'; iconColor = '#ff9f43'; }
  else if(categoryValue === 'Transport') { iconClass = 'fas fa-car'; iconColor = '#0abde3'; }
  else if(categoryValue === 'Fun') { iconClass = 'fas fa-gamepad'; iconColor = '#ee5253'; }

  // Simpan Data
  const transaction = {
    id: Date.now(),
    name: nameValue,
    amount: amountValue,
    category: categoryValue,
    date: dateValue,
    icon: iconClass,
    color: iconColor
  };
  transactions.push(transaction);

  // Bikin Kotak History Baru
  const li = document.createElement('li');
  li.innerHTML = `
    <div class="history-header">
      <i class="${iconClass}" style="color: ${iconColor}; font-size: 18px;"></i>
      <span class="amount">Rp ${amountValue.toLocaleString('id-ID')}</span>
    </div>
    <div class="history-body">
      <h4>${nameValue}</h4>
      <p>${categoryValue} • ${dateValue}</p>
    </div>
  `;

  listElement.appendChild(li);

  // Update Tampilan
  updateUI();
  form.reset();
  dateInput.value = today.toISOString().split('T')[0]; 
  listElement.scrollTo({ left: listElement.scrollWidth, behavior: 'smooth' });
});

// Deteksi saat bulan diganti
monthFilter.addEventListener('change', updateUI);