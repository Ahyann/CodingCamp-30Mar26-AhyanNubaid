// === 1. NAVIGASI HALAMAN ===
const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    navLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    const targetId = link.getAttribute("data-page");
    if (targetId === "home") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const targetSection = document.getElementById(targetId);
      if(targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// === 2. FITUR CAROUSEL HISTORY ===
const scrollLeftBtn = document.getElementById('scrollLeft');
const scrollRightBtn = document.getElementById('scrollRight');
const listElement = document.getElementById('list');
scrollLeftBtn.addEventListener('click', () => listElement.scrollBy({ left: -250, behavior: 'smooth' }));
scrollRightBtn.addEventListener('click', () => listElement.scrollBy({ left: 250, behavior: 'smooth' }));

// === 3. INISIALISASI DATA ===
const form = document.getElementById('form');
const nameInput = document.getElementById('name');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date'); 
const balanceDisplay = document.getElementById('balance');

const monthFilter = document.getElementById('monthFilter');
const monthlyBalanceDisplay = document.getElementById('monthlyBalance');
const sortOrderSelect = document.getElementById('sortOrder');

let transactions = []; 
let myChart = null; // Variabel penyimpan grafik

// Setup Kalender Hari Ini
const today = new Date();
dateInput.value = today.toISOString().split('T')[0]; 
monthFilter.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

// Master Data Kategori (Warna & Icon)
const catConfig = {
  'Food': { icon: 'fas fa-hamburger', color: '#ff9f43' },
  'Transport': { icon: 'fas fa-car', color: '#0abde3' },
  'Fun': { icon: 'fas fa-gamepad', color: '#ee5253' }
};

// === 4. FUNGSI UPDATE UI & REPORT (GRAFIK + SORTING + FILTER) ===
function updateUI() {
  // Update Saldo Total Utama
  const totalBalance = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  balanceDisplay.innerText = `Rp ${totalBalance.toLocaleString('id-ID')}`;

  // Filter Data Berdasarkan Bulan
  const selectedMonth = monthFilter.value; 
  const monthlyTrx = transactions.filter(trx => trx.date.substring(0, 7) === selectedMonth);

  // Update Saldo Bulan Ini
  const monthlyTotal = monthlyTrx.reduce((acc, curr) => acc + curr.amount, 0);
  monthlyBalanceDisplay.innerText = `Rp ${monthlyTotal.toLocaleString('id-ID')}`;

  const filterValue = sortOrderSelect.value;
  let reportData = [];
  
  // --- SKENARIO 1: TAMPILKAN SEMUA KATEGORI ---
  if (filterValue === 'all-desc' || filterValue === 'all-asc') {
    let totals = { 'Food': 0, 'Transport': 0, 'Fun': 0 };
    let counts = { 'Food': 0, 'Transport': 0, 'Fun': 0 };

    monthlyTrx.forEach(trx => {
      totals[trx.category] += trx.amount;
      counts[trx.category] += 1;
    });

    for (let cat in totals) {
      if (totals[cat] > 0) {
        reportData.push({
          name: cat,
          amount: totals[cat],
          count: counts[cat],
          percent: ((totals[cat] / monthlyTotal) * 100).toFixed(1),
          icon: catConfig[cat].icon,
          color: catConfig[cat].color
        });
      }
    }

    // Urutkan Paling Mahal atau Paling Murah
    if (filterValue === 'all-desc') {
      reportData.sort((a, b) => b.amount - a.amount);
    } else {
      reportData.sort((a, b) => a.amount - b.amount);
    }
  } 
  // --- SKENARIO 2: TAMPILKAN SPESIFIK 1 KATEGORI (FOOD/TRANSPORT/FUN) ---
  else {
    const filteredTrx = monthlyTrx.filter(trx => trx.category === filterValue);
    const catTotal = filteredTrx.reduce((acc, curr) => acc + curr.amount, 0);
    
    // Gabungkan pengeluaran yang namanya sama (misal beli "Burger" 2 kali)
    let itemTotals = {};
    let itemCounts = {};
    
    filteredTrx.forEach(trx => {
      if (itemTotals[trx.name]) {
        itemTotals[trx.name] += trx.amount;
        itemCounts[trx.name] += 1;
      } else {
        itemTotals[trx.name] = trx.amount;
        itemCounts[trx.name] = 1;
      }
    });

    // Palet warna biar chart donatnya warna-warni saat dibedah per item
    const colorPalette = ['#ff9f43', '#0abde3', '#ee5253', '#10ac84', '#5f27cd', '#22a6b3', '#f368e0'];
    let colorIndex = 0;

    for (let itemName in itemTotals) {
      reportData.push({
        name: itemName,
        amount: itemTotals[itemName],
        count: itemCounts[itemName],
        percent: ((itemTotals[itemName] / catTotal) * 100).toFixed(1),
        icon: catConfig[filterValue].icon, 
        color: colorPalette[colorIndex % colorPalette.length] 
      });
      colorIndex++;
    }
    
    // Default urutan item: dari yang paling mahal
    reportData.sort((a, b) => b.amount - a.amount);
  }

  // Lempar datanya untuk digambar
  renderChart(reportData);
  renderCategoryList(reportData);
}

// Render Donut Chart
function renderChart(data) {
  const ctx = document.getElementById('chart').getContext('2d');
  
  if (myChart) myChart.destroy(); // Hapus chart lama kalau ada

  myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.name),
      datasets: [{
        data: data.map(d => d.amount),
        backgroundColor: data.map(d => d.color),
        borderWidth: 0,
        hoverOffset: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%', 
      plugins: {
        legend: { display: false } 
      }
    }
  });
}

// Render List Kategori (Progress Bar)
function renderCategoryList(data) {
  const container = document.getElementById('categoryBreakdown');
  container.innerHTML = ''; 

  if (data.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">Belum ada transaksi di bulan ini.</p>';
    return;
  }

  data.forEach((item, index) => {
    container.innerHTML += `
      <div class="cat-item">
        <div class="cat-icon-wrapper" style="color: ${item.color}">
          <i class="${item.icon}"></i>
        </div>
        <div class="cat-info">
          <div class="cat-header">
            <span class="cat-name">${index + 1}. ${item.name}</span>
            <span class="cat-amount">Rp ${item.amount.toLocaleString('id-ID')}</span>
          </div>
          <div class="cat-stats">
            <span>${item.percent}%</span>
            <span>${item.count} bills</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${item.percent}%; background-color: ${item.color};"></div>
          </div>
        </div>
      </div>
    `;
  });
}

// === 5. EVENT LISTENERS ===
form.addEventListener('submit', function(event) {
  event.preventDefault(); 

  const transaction = {
    id: Date.now(),
    name: nameInput.value,
    amount: Number(amountInput.value),
    category: categoryInput.value,
    date: dateInput.value,
    icon: catConfig[categoryInput.value].icon,
    color: catConfig[categoryInput.value].color
  };
  
  transactions.push(transaction);

  // Tambah ke History Kanan
  const li = document.createElement('li');
  li.innerHTML = `
    <div class="history-header">
      <i class="${transaction.icon}" style="color: ${transaction.color}; font-size: 18px;"></i>
      <span class="amount">Rp ${transaction.amount.toLocaleString('id-ID')}</span>
    </div>
    <div class="history-body">
      <h4>${transaction.name}</h4>
      <p>${transaction.category} • ${transaction.date}</p>
    </div>
  `;
  listElement.appendChild(li);

  updateUI();
  form.reset();
  dateInput.value = today.toISOString().split('T')[0]; 
  listElement.scrollTo({ left: listElement.scrollWidth, behavior: 'smooth' });
});

monthFilter.addEventListener('change', updateUI);
sortOrderSelect.addEventListener('change', updateUI);

// Panggil update UI pertama kali buat bikin chart kosong
updateUI();

// === 6. SCROLLSPY (UPDATE NAVBAR OTOMATIS SAAT DI-SCROLL) ===
window.addEventListener('scroll', () => {
  let currentSection = 'home'; // Default selalu home
  const sections = document.querySelectorAll('section');
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop; // Jarak section dari atas halaman
    
    // Jika posisi scroll kita sudah melewati bagian atas section tersebut
    if (window.scrollY >= (sectionTop - 150)) {
      currentSection = section.getAttribute('id');
    }
  });

  // Hapus class 'active' dari semua menu, lalu tambahkan ke menu yang sedang aktif
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-page') === currentSection) {
      link.classList.add('active');
    }
  });
});