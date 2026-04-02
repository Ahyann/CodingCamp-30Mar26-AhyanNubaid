// === 1. NAVIGASI HALAMAN ===
const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page");

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    navLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    const target = link.getAttribute("data-page");
    pages.forEach(page => page.classList.remove("active"));
    document.getElementById(target).classList.add("active");
  });
});

// === 2. FITUR TOMBOL GESER SLIDER ===
const scrollLeftBtn = document.getElementById('scrollLeft');
const scrollRightBtn = document.getElementById('scrollRight');
const listElement = document.getElementById('list');

scrollLeftBtn.addEventListener('click', () => {
  // Geser agak jauh supaya langsung pindah kolom
  listElement.scrollBy({ left: -250, behavior: 'smooth' });
});

scrollRightBtn.addEventListener('click', () => {
  listElement.scrollBy({ left: 250, behavior: 'smooth' });
});


// === 3. FITUR INPUT DATA TRANSAKSI ===
const form = document.getElementById('form');
const nameInput = document.getElementById('name');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const balanceDisplay = document.getElementById('balance');

let totalBalance = 0;

form.addEventListener('submit', function(event) {
  event.preventDefault(); 

  // Ambil nilai input
  const nameValue = nameInput.value;
  const amountValue = Number(amountInput.value);
  const categoryValue = categoryInput.value;

  // Hitung Total Saldo
  totalBalance += amountValue;
  balanceDisplay.innerText = `Rp ${totalBalance.toLocaleString('id-ID')}`;

  // Atur Ikon & Warna berdasarkan Kategori
  let iconClass = 'fas fa-money-bill'; 
  let iconColor = '#555';
  if(categoryValue === 'Food') { iconClass = 'fas fa-hamburger'; iconColor = '#ff9f43'; }
  else if(categoryValue === 'Transport') { iconClass = 'fas fa-car'; iconColor = '#0abde3'; }
  else if(categoryValue === 'Fun') { iconClass = 'fas fa-gamepad'; iconColor = '#ee5253'; }

  // Buat HTML Kotak History Baru
  const li = document.createElement('li');
  li.innerHTML = `
    <div class="history-header">
      <i class="${iconClass}" style="color: ${iconColor}; font-size: 18px;"></i>
      <span class="amount">Rp ${amountValue.toLocaleString('id-ID')}</span>
    </div>
    <div class="history-body">
      <h4>${nameValue}</h4>
      <p>${categoryValue}</p>
    </div>
  `;

  // Masukkan ke slider
  listElement.appendChild(li);

  // Bersihkan form
  form.reset();

  // Otomatis scroll mentok ke kanan setiap ada data baru
  listElement.scrollTo({ left: listElement.scrollWidth, behavior: 'smooth' });
});