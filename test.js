// ambil semua tombol nav
const navLinks = document.querySelectorAll(".nav-link");

// ambil semua halaman
const pages = document.querySelectorAll(".page");

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    
    // hapus active dari semua tombol
    navLinks.forEach(l => l.classList.remove("active"));
    
    // tambah active ke yang diklik
    link.classList.add("active");

    // ambil target page
    const target = link.getAttribute("data-page");

    // sembunyikan semua page
    pages.forEach(page => {
      page.classList.remove("active");
    });

    // tampilkan page yang dipilih
    document.getElementById(target).classList.add("active");
  });
});