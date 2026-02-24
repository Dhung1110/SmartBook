document.addEventListener('DOMContentLoaded', function() {
    // === PHẦN 1: KHỞI TẠO VÀ BIẾN TOÀN CỤC (TRONG SCOPE DOMContentLoaded) ===
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const toggleBtn = document.getElementById('toggleSidebar');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const logoutBtn = document.getElementById('logoutBtn');
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const addStaffBtn = document.getElementById('addStaffBtn');
    const addStaffModal = document.getElementById('addStaffModal');
    const addStaffForm = document.getElementById('addStaffForm');
    const staffTableBody = document.querySelector('#staffTable tbody');
    const addProductModal = document.getElementById('addProductModal');
    const addProductForm = document.getElementById('addProductForm');
    const inventoryTableBody = document.querySelector('#inventoryTable tbody');
    const productImageInput = document.getElementById('productImage');
    const productImagePreview = document.getElementById('productImagePreview');
    const productCategorySelect = document.getElementById('productCategory');
    let productRevenueChartInstance = null; // Biến lưu biểu đồ SP
    let timeRevenueChartInstance = null;    // Biến lưu biểu đồ Thời gian
    let categoryRevenueChartInstance = null; // Biến lưu biểu đồ Danh mục

    // === PHẦN 2: HÀM KIỂM TRA VÀ XỬ LÝ BAN ĐẦU ===
function checkAuth() {
    const user = JSON.parse(sessionStorage.getItem('staffUser')) || JSON.parse(localStorage.getItem('staffUser'));
    if (!user || user.role !== 'manager') {
        window.location.href = 'staff-login.html';
            return false; // Trả về false nếu không hợp lệ
        }
        // Cập nhật thông tin người dùng trên header
        const userNameDisplay = document.querySelector('.user-name');
        if(userNameDisplay) userNameDisplay.textContent = user.name;
        return true; // Trả về true nếu hợp lệ
    }

    // === PHẦN 2.5: KHỞI TẠO DỮ LIỆU NẾU CẦN ===
    function initBooksData() {
        if (!localStorage.getItem('books')) {
            console.log('Chưa có dữ liệu sách, đang khởi tạo...');
            const sampleBooks = [
                {
                    id: 1,
                    title: "Đắc Nhân Tâm",
                    author: "Dale Carnegie",
                    price: 69000,
                    originalPrice: 85000, // Thêm originalPrice
                    discountPercent: 20, // Thêm discountPercent
                    image: "images/books/sach1.jpg",
                    categoryId: 1,
                    publisher: "NXB Tổng Hợp",
                    year: 2021,
                    pages: 320,
                    language: "Tiếng Việt",
                    isbn: "978-604-59-4359-0",
                    size: "14.5 x 20.5 cm",
                    description: "Đắc Nhân Tâm là cuốn sách nổi tiếng nhất...",
                    stock: 50 // Thêm số lượng tồn kho mẫu
                },
                {
                    id: 2,
                    title: "Nhà Giả Kim",
                    author: "Paulo Coelho",
                    price: 86000,
                    originalPrice: 100000,
                    discountPercent: 14,
                    image: "images/books/sach2.jpg",
                    categoryId: 1,
                    publisher: "NXB Văn Học",
                    year: 2020,
                    pages: 228,
                    language: "Tiếng Việt",
                    isbn: "978-604-228-396-0",
                    size: "13 x 20.5 cm",
                    description: "Nhà Giả Kim là một cuốn tiểu thuyết...",
                    stock: 30
                },
                 {
                    id: 3,
                    title: "Java Programming",
                    author: "Oracle Press",
                    price: 250000,
                    originalPrice: 300000,
                    discountPercent: 16,
                    image: "images/books/sach3.jpg",
                    categoryId: 2,
                    publisher: "McGraw-Hill Education",
                    year: 2023,
                    pages: 850,
                    language: "Tiếng Anh",
                    isbn: "978-126-046-372-2",
                    size: "18 x 24 cm",
                    description: "Cuốn sách Java Programming mang đến những kiến thức...",
                     stock: 25
                },
                {
                    id: 4,
                    title: "C++ Programming", // Sửa lại tên sách
                    author: "Bjarne Stroustrup", // Sửa lại tác giả
                    price: 220000, // Sửa lại giá
                    originalPrice: 250000,
                    discountPercent: 12,
                    image: "images/books/sach4.jpg",
                    categoryId: 2,
                    publisher: "NXB Thông Tin và Truyền Thông",
                    year: 2022,
                    pages: 420,
                    language: "Tiếng Việt",
                    isbn: "978-604-80-5580-5",
                    size: "16 x 24 cm",
                    description: "C++ là ngôn ngữ lập trình đa mẫu hình...",
                     stock: 40
                }
                // Thêm các sách khác nếu cần
            ];
            localStorage.setItem('books', JSON.stringify(sampleBooks));
            console.log('Đã khởi tạo dữ liệu sách mẫu.');
        }
        // Có thể thêm khởi tạo categories ở đây nếu cần
        if (!localStorage.getItem('categories')) {
             console.log('Chưa có dữ liệu danh mục, đang khởi tạo...');
             const sampleCategories = [
                { id: 1, name: "Sách Triết Lý" },
                { id: 2, name: "Sách Lập Trình" },
                { id: 3, name: "Sách Kinh Tế" }
             ];
              localStorage.setItem('categories', JSON.stringify(sampleCategories));
             console.log('Đã khởi tạo dữ liệu danh mục mẫu.');
        }
        
        // Thêm khởi tạo users nếu chưa có
        if (!localStorage.getItem('users')) {
            console.log('Chưa có dữ liệu người dùng, đang khởi tạo...');
            const sampleUsers = [
                {
                    id: 101, // Dùng ID khác với staff/admin
                    username: "khachhang1",
                    password: "khach123", 
                    fullname: "Nguyễn Văn Khách",
                    email: "khach1@email.com",
                    phone: "0987654321",
                    address: "123 Đường Khách, Q.1, TP.HCM"
                },
                {
                    id: 102,
                    username: "khachhang2",
                    password: "khach456",
                    fullname: "Trần Thị Khách Hàng",
                    email: "khach2@email.com",
                    phone: "0912345678",
                    address: "456 Ngõ Khách, Hai Bà Trưng, Hà Nội"
                }
            ];
            localStorage.setItem('users', JSON.stringify(sampleUsers));
            console.log('Đã khởi tạo dữ liệu người dùng mẫu.');
        }
         // Thêm khởi tạo orders nếu chưa có (để test)
         if (!localStorage.getItem('orders')) {
             console.log('Chưa có dữ liệu đơn hàng, đang khởi tạo...');
             const sampleOrders = [
                 {
                     id: 901,
                     userId: 101,
                     items: [ { bookId: 1, quantity: 1, price: 69000 }, { bookId: 2, quantity: 1, price: 86000 } ],
                     total: 155000,
                     status: 'completed',
                     createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 ngày trước
                     shippingInfo: { name: "Nguyễn Văn Khách", address: "123 Đường Khách", phone: "0987654321" }
                 },
                 {
                     id: 902,
                     userId: 102,
                     items: [ { bookId: 3, quantity: 1, price: 250000 } ],
                     total: 250000,
                     status: 'pending',
                     createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 ngày trước
                     shippingInfo: { name: "Trần Thị Khách Hàng", address: "456 Ngõ Khách", phone: "0912345678" }
                 }
             ];
             localStorage.setItem('orders', JSON.stringify(sampleOrders));
             console.log('Đã khởi tạo dữ liệu đơn hàng mẫu.');
         }
    }

    // Chạy kiểm tra Auth và khởi tạo dữ liệu
    if (!checkAuth()) {
        return; // Dừng thực thi nếu chưa đăng nhập hoặc không phải manager
    }
    initBooksData(); // Gọi hàm khởi tạo dữ liệu ở đây

    // === PHẦN 3: CÁC HÀM TIỆN ÍCH ===
function showNotification(type, title, message) {
    const notification = document.createElement('div');
    notification.className = `notification-popup ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <div class="notification-progress">
            <div class="notification-progress-bar"></div>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('slideOut');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
} 
    
    function showError(message) { // Hàm này có thể dùng chung
        Swal.fire({ icon: 'error', title: 'Lỗi', text: message, confirmButtonColor: '#3498db' });
    }
    
    function showSuccess(message) { // Hàm này có thể dùng chung
        Swal.fire({ icon: 'success', title: 'Thành công', text: message, confirmButtonColor: '#3498db' });
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function togglePasswordHandler() {
         const input = this.previousElementSibling;
         const type = input.type === 'password' ? 'text' : 'password';
         input.type = type;
         this.innerHTML = type === 'password' ? 
             '<i class="fas fa-eye"></i>' : 
             '<i class="fas fa-eye-slash"></i>';
    }
    
    function closeModal(modalElement) {
        if(modalElement) {
            modalElement.classList.remove('show');
        }
    }

    // === PHẦN 4: XỬ LÝ GIAO DIỆN CHUNG ===
    // Toggle Sidebar
    if (toggleBtn && sidebar && mainContent) {
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });
    } else {
        console.error('Thiếu phần tử toggleBtn, sidebar hoặc mainContent');
    }

    // Dropdown Menu
    if (userMenuBtn && dropdownMenu) { 
    userMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
    // Đóng dropdown khi click ra ngoài
    document.addEventListener('click', function(e) {
            if (dropdownMenu.classList.contains('show') && !userMenuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                closeModal(dropdownMenu); // Dùng hàm closeModal chung
            }
        });
    } else {
        console.error('Thiếu phần tử userMenuBtn hoặc dropdownMenu');
    }
    
    // Đăng xuất
    function logout() {
        sessionStorage.removeItem('staffUser');
        localStorage.removeItem('staffUser');
        window.location.href = 'staff-login.html';
    }
    if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    }
    
    // Chuyển Tab Nội Dung
    function loadContent(targetId) {
         const contentTabs = document.querySelectorAll('.content-tab');
         contentTabs.forEach(tab => tab.style.display = 'none');
         const targetTab = document.getElementById(`${targetId}-section`);
         
         if (targetTab) {
             targetTab.style.display = 'block';
         } else {
             console.error(`Không tìm thấy content tab: ${targetId}-section`);
             document.getElementById('dashboard-section').style.display = 'block'; // Fallback về dashboard
             targetId = 'dashboard'; 
         }
         
    // Cập nhật tiêu đề
    const pageTitle = document.querySelector('.nav-left h2');
         let title = 'Dashboard'; // Tiêu đề mặc định
    switch(targetId) {
        case 'dashboard':
                 title = 'Tổng quan'; 
                 loadDashboardStats(); // Giả sử có hàm này
                 loadRecentOrders(); // Gọi hàm tải đơn hàng gần đây
            break;
             case 'staff': title = 'Quản lý nhân viên'; loadStaffManagement(); break;
             case 'customer': 
                 title = 'Quản lý khách hàng'; 
                 loadCustomerManagement();
            break;
        case 'inventory':
                 title = 'Quản lý sản phẩm'; 
            loadInventoryManagement();
            break;
        case 'orders':
                 title = 'Quản lý đơn hàng'; 
            loadOrderManagement();
            break;
        case 'reports':
                 title = 'Báo cáo doanh thu'; 
                 loadReportsManagement(); // Gọi hàm tải trang báo cáo
            break;
             case 'settings': title = 'Cài đặt'; /* loadSettings(); */ break;
         }
         if (pageTitle) pageTitle.textContent = title;
         
         // Cập nhật active link trên sidebar
         navLinks.forEach(l => {
             l.parentElement.classList.remove('active');
             if(l.getAttribute('href') === `#${targetId}`) {
                 l.parentElement.classList.add('active');
             }
         });
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            loadContent(targetId);
        });
    });
    
    // Load nội dung mặc định (Tổng quan)
    loadContent('dashboard'); 

    // === PHẦN 5: QUẢN LÝ NHÂN VIÊN ===
function loadStaffManagement() {
    console.log('Đang tải danh sách nhân viên...');
         if (!staffTableBody) {
             console.error("Không tìm thấy tbody của bảng nhân viên.");
             return;
         }
         const staffList = JSON.parse(localStorage.getItem('staffUsers') || '[]');
         const staffOnly = staffList.filter(user => user.role === 'staff');
         staffTableBody.innerHTML = '';
         if (staffOnly.length === 0) {
             staffTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Chưa có nhân viên nào.</td></tr>';
         } else {
             staffOnly.forEach(staff => {
                 const row = document.createElement('tr');
                 row.dataset.staffId = staff.id; // Thêm data-id vào row
                 row.innerHTML = `
                     <td>${staff.id}</td>
                     <td>${staff.name}</td>
                     <td>${staff.email}</td>
                     <td>${staff.phone || 'N/A'}</td>
                     <td><span class="role-staff">Nhân viên</span></td>
                     <td>
                         <button class="action-btn view" title="Xem chi tiết"><i class="fas fa-eye"></i></button>
                         <button class="action-btn edit" title="Chỉnh sửa"><i class="fas fa-edit"></i></button>
                         <button class="action-btn delete" title="Xóa"><i class="fas fa-trash"></i></button>
                     </td>
                 `;
                 staffTableBody.appendChild(row);
             });
         }
         attachStaffActionEvents(); 
    }
    
    function attachStaffActionEvents() {
         // Gắn sự kiện cho nút Thêm nhân viên
         if(addStaffBtn) {
             addStaffBtn.removeEventListener('click', showAddStaffModal);
             addStaffBtn.addEventListener('click', showAddStaffModal);
         }
         // Gắn sự kiện cho các nút đóng modal Add Staff
         addStaffModal.querySelectorAll('.close-modal').forEach(btn => {
             btn.removeEventListener('click', () => closeModal(addStaffModal));
             btn.addEventListener('click', () => closeModal(addStaffModal));
         });
          // Gắn sự kiện submit cho form thêm nhân viên
         if (addStaffForm) {
             addStaffForm.removeEventListener('submit', handleAddStaffSubmit); 
             addStaffForm.addEventListener('submit', handleAddStaffSubmit);
         }
         // Gắn sự kiện cho nút toggle password trong modal
         const modalTogglePassword = addStaffModal.querySelector('.toggle-password');
         if(modalTogglePassword) {
              modalTogglePassword.removeEventListener('click', togglePasswordHandler);
              modalTogglePassword.addEventListener('click', togglePasswordHandler);
         }
         
         // Gắn sự kiện cho các nút action trong bảng (dùng event delegation)
         if (staffTableBody) {
             staffTableBody.removeEventListener('click', handleStaffTableActions);
             staffTableBody.addEventListener('click', handleStaffTableActions);
         }
    }
    
    function handleStaffTableActions(event) {
        const targetButton = event.target.closest('.action-btn');
        if (!targetButton) return; // Không phải click vào nút action
        
        const staffId = targetButton.closest('tr').dataset.staffId;
        if (!staffId) return;
        
        if (targetButton.classList.contains('view')) {
            viewStaffDetails(staffId);
        } else if (targetButton.classList.contains('edit')) {
            editStaff(staffId);
        } else if (targetButton.classList.contains('delete')) {
            confirmDeleteStaff(staffId);
        }
    }

    function viewStaffDetails(staffId) {
        // Lấy danh sách nhân viên từ localStorage
        const staffList = JSON.parse(localStorage.getItem('staffUsers') || '[]');
        
        // Tìm nhân viên theo ID
        const staff = staffList.find(s => String(s.id) === String(staffId));
        
        if (!staff) {
            showNotification('error', 'Lỗi', 'Không tìm thấy thông tin nhân viên');
            return;
        }

        // Hiển thị thông tin chi tiết bằng SweetAlert2
        Swal.fire({
            title: 'Thông tin chi tiết nhân viên',
            html: `
                <div class="staff-details">
                    <p><strong>ID:</strong> ${staff.id}</p>
                    <p><strong>Tên đăng nhập:</strong> ${staff.username}</p>
                    <p><strong>Họ tên:</strong> ${staff.name}</p>
                    <p><strong>Email:</strong> ${staff.email}</p>
                    <p><strong>Số điện thoại:</strong> ${staff.phone || 'Chưa cập nhật'}</p>
                    <p><strong>Vai trò:</strong> ${staff.role === 'staff' ? 'Nhân viên' : 'Quản lý'}</p>
                    <p><strong>Ngày tạo:</strong> ${new Date(staff.createdAt || Date.now()).toLocaleDateString('vi-VN')}</p>
                </div>
            `,
            confirmButtonText: 'Đóng',
            customClass: {
                confirmButton: 'btn btn-primary',
                content: 'staff-details-modal'
            }
        });
    }

    function editStaff(staffId) {
        const staffList = JSON.parse(localStorage.getItem('staffUsers') || '[]');
        const staff = staffList.find(s => String(s.id) === String(staffId));
        
        if (!staff) {
            showNotification('error', 'Lỗi', 'Không tìm thấy thông tin nhân viên');
            return;
        }

        Swal.fire({
            title: 'Chỉnh sửa thông tin nhân viên',
            html: `
                <form id="editStaffForm" class="form">
                    <div class="form-group mb-3">
                        <label class="form-label fw-semibold text-dark">Tên đăng nhập</label>
                        <input type="text" id="editUsername" class="form-control bg-light border rounded-3 py-2" 
                            value="${staff.username}" disabled 
                            style="cursor: not-allowed; opacity: 0.8;">
                    </div>
                    <div class="form-group mb-3">
                        <label class="form-label fw-semibold text-dark">Họ tên</label>
                        <input type="text" id="editName" class="form-control border rounded-3 py-2" 
                            value="${staff.name}" required
                            style="transition: all 0.3s ease; border-color: #dee2e6;">
                    </div>
                    <div class="form-group mb-3">
                        <label class="form-label fw-semibold text-dark">Email</label>
                        <input type="email" id="editEmail" class="form-control border rounded-3 py-2" 
                            value="${staff.email}" required
                            style="transition: all 0.3s ease; border-color: #dee2e6;">
                    </div>
                    <div class="form-group mb-3">
                        <label class="form-label fw-semibold text-dark">Số điện thoại</label>
                        <input type="tel" id="editPhone" class="form-control border rounded-3 py-2" 
                            value="${staff.phone || ''}"
                            style="transition: all 0.3s ease; border-color: #dee2e6;">
                    </div>
                </form>
            `,
            showCancelButton: true,
            confirmButtonText: 'Lưu thay đổi',
            cancelButtonText: 'Hủy',
            customClass: {
                popup: 'modal-dialog shadow-lg border-0',
                content: 'modal-content p-4 rounded-4',
                confirmButton: 'btn btn-primary px-4 py-2 rounded-3 fw-semibold',
                cancelButton: 'btn btn-light me-3 px-4 py-2 rounded-3'
            },
            preConfirm: () => {
                const name = document.getElementById('editName').value.trim();
                const email = document.getElementById('editEmail').value.trim();
                const phone = document.getElementById('editPhone').value.trim();
                
                if (!name || !email) {
                    Swal.showValidationMessage('Vui lòng điền đầy đủ thông tin bắt buộc');
                    return false;
                }
                
                if (!isValidEmail(email)) {
                    Swal.showValidationMessage('Email không hợp lệ');
                    return false;
                }
                
                return { name, email, phone };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const updatedStaff = staffList.map(s => {
                    if (String(s.id) === String(staffId)) {
                        return {
                            ...s,
                            name: result.value.name,
                            email: result.value.email,
                            phone: result.value.phone
                        };
                    }
                    return s;
                });
                
                localStorage.setItem('staffUsers', JSON.stringify(updatedStaff));
                loadStaffManagement();
                showNotification('success', 'Thành công', 'Đã cập nhật thông tin nhân viên');
            }
        });
    }

    function confirmDeleteStaff(staffId) {
        console.log(`Yêu cầu xóa nhân viên ID: ${staffId}`);
        deleteStaff(staffId)
        // TODO: Implement xác nhận xóa 
        // Ví dụ:
        // Swal.fire({...}).then(result => { if(result.isConfirmed) deleteStaff(staffId); });
    }
    
function deleteStaff(staffId) {
    console.log('Xóa nhân viên:', staffId);
    Swal.fire({
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc chắn muốn xóa nhân viên này không?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        customClass: {
            confirmButton: 'btn btn-danger',
            cancelButton: 'btn btn-light me-3'
        }
    }).then((result) => {
        if (result.isConfirmed) {
        let staffList = JSON.parse(localStorage.getItem('staffUsers') || '[]');
        staffList = staffList.filter(user => String(user.id) !== String(staffId));
        localStorage.setItem('staffUsers', JSON.stringify(staffList));
        loadStaffManagement(); // Tải lại bảng
    showNotification('success', 'Thành công', 'Đã xóa nhân viên');
        }
    });
}

    function showAddStaffModal() {
        console.log('Hiển thị modal thêm nhân viên');
        if (addStaffModal && addStaffForm) {
            addStaffForm.reset();
            const passInput = document.getElementById('staffPassword');
            const toggleBtn = addStaffForm.querySelector('.toggle-password i'); // Chọn icon bên trong
            if(passInput) passInput.type = 'password';
            if(toggleBtn) toggleBtn.className = 'fas fa-eye'; // Reset icon
            addStaffModal.classList.add('show');
        }
    }

    function handleAddStaffSubmit(e) {
        e.preventDefault();
        const username = document.getElementById('staffUsername').value.trim();
        const password = document.getElementById('staffPassword').value;
        const name = document.getElementById('staffName').value.trim();
        const email = document.getElementById('staffEmail').value.trim();
        const phone = document.getElementById('staffPhone').value.trim();
        const role = 'staff'; // Luôn là staff khi thêm từ đây
        
        if (!username || !password || !name || !email) {
            showError('Vui lòng điền đầy đủ các trường bắt buộc (*).'); return;
        }
        if (!isValidEmail(email)) {
             showError('Email không hợp lệ.'); return;
        }
        if (password.length < 6) {
             showError('Mật khẩu phải có ít nhất 6 ký tự.'); return;
        }
        const staffList = JSON.parse(localStorage.getItem('staffUsers') || '[]');
        if (staffList.some(user => user.username === username)) {
             showError('Tên đăng nhập đã tồn tại.'); return;
        }
        if (staffList.some(user => user.email === email)) {
            showError('Email đã được sử dụng.'); return;
        }
        
        const newId = staffList.length > 0 ? Math.max(...staffList.map(u => u.id || 0)) + 1 : 1;
        
        const newStaffData = { id: newId, username, password, name, email, phone, role };
        
        addNewStaff(newStaffData);
        closeModal(addStaffModal);
    }

    function addNewStaff(staffData) {
        console.log('Thêm nhân viên mới:', staffData);
        let staffList = JSON.parse(localStorage.getItem('staffUsers') || '[]');
        staffList.push(staffData);
        localStorage.setItem('staffUsers', JSON.stringify(staffList));
        loadStaffManagement();
        showNotification('success', 'Thành công', `Đã thêm nhân viên ${staffData.name}`);
    }

    // === PHẦN 6: QUẢN LÝ KHÁCH HÀNG ===
    function loadCustomerManagement() {
        console.log('Đang tải danh sách khách hàng...');
        const customerTableBody = document.querySelector('#customerTable tbody');
        if (!customerTableBody) {
            console.error("Không tìm thấy tbody của bảng khách hàng.");
            return;
        }

        // Lấy dữ liệu từ localStorage với key 'users'
        const customerList = JSON.parse(localStorage.getItem('users') || '[]');

        customerTableBody.innerHTML = ''; // Xóa nội dung cũ

        if (customerList.length === 0) {
            customerTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Chưa có khách hàng nào.</td></tr>';
        } else {
            customerList.forEach(customer => {
                const row = document.createElement('tr');
                row.dataset.customerId = customer.id; // Thêm data-id nếu cần
                row.innerHTML = `
                    <td>${customer.id || 'N/A'}</td>
                    <td>${customer.fullName || customer.username || 'N/A'}</td>
                    <td>${customer.email || 'N/A'}</td>
                    <td>${customer.phone || 'N/A'}</td>
                    <td>${customer.address || 'N/A'}</td>
                    <td>
                        <button class="action-btn view-customer" title="Xem chi tiết"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit-customer" title="Chỉnh sửa"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-customer" title="Xóa"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                customerTableBody.appendChild(row);
            });
        }
        attachCustomerActionEvents(); // Gắn sự kiện cho các nút action (nếu cần)
    }

    function attachCustomerActionEvents() {
        const customerTableBody = document.querySelector('#customerTable tbody');
        if (customerTableBody) {
            customerTableBody.removeEventListener('click', handleCustomerTableActions);
            customerTableBody.addEventListener('click', handleCustomerTableActions);
        }
    }

    function handleCustomerTableActions(event) {
        const targetButton = event.target.closest('.action-btn');
        if (!targetButton) return;

        const customerId = targetButton.closest('tr').dataset.customerId;
        if (!customerId) return;

        if (targetButton.classList.contains('view-customer')) {
            // Lấy danh sách khách hàng từ localStorage
            const customerList = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Tìm khách hàng theo ID
            const customer = customerList.find(c => String(c.id) === String(customerId));
            
            if (!customer) {
                showNotification('error', 'Lỗi', 'Không tìm thấy thông tin khách hàng');
                return;
            }

            // Hiển thị thông tin chi tiết bằng SweetAlert2
            Swal.fire({
                title: 'Thông tin chi tiết khách hàng',
                html: `
                    <div class="customer-details">
                        <p><strong>ID:</strong> ${customer.id}</p>
                        <p><strong>Tên đăng nhập:</strong> ${customer.username}</p>
                        <p><strong>Họ tên:</strong> ${customer.fullName || 'Chưa cập nhật'}</p>
                        <p><strong>Email:</strong> ${customer.email || 'Chưa cập nhật'}</p>
                        <p><strong>Số điện thoại:</strong> ${customer.phone || 'Chưa cập nhật'}</p>
                        <p><strong>Địa chỉ:</strong> ${customer.address || 'Chưa cập nhật'}</p>
                        <p><strong>Ngày tạo:</strong> ${new Date(customer.createdAt || Date.now()).toLocaleDateString('vi-VN')}</p>
                    </div>
                `,
                confirmButtonText: 'Đóng',
                customClass: {
                    confirmButton: 'btn btn-primary',
                    content: 'customer-details-modal'
                }
            });
        } else if (targetButton.classList.contains('edit-customer')) {
            // Lấy danh sách khách hàng từ localStorage
            const customerList = JSON.parse(localStorage.getItem('users') || '[]');
            const customer = customerList.find(c => String(c.id) === String(customerId));
            
            if (!customer) {
                showNotification('error', 'Lỗi', 'Không tìm thấy thông tin khách hàng');
                return;
            }

            Swal.fire({
                title: 'Chỉnh sửa thông tin khách hàng',
                html: `
                    <form id="editCustomerForm" class="edit-customer-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-user"></i>
                                    Tên đăng nhập
                                </label>
                                <input type="text" id="editUsername" class="form-control" 
                                    value="${customer.username}" disabled>
                            </div>
                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-signature"></i>
                                    Họ tên
                                </label>
                                <input type="text" id="editFullName" class="form-control" 
                                    value="${customer.fullName || ''}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-envelope"></i>
                                    Email
                                </label>
                                <input type="email" id="editEmail" class="form-control" 
                                    value="${customer.email || ''}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">
                                    <i class="fas fa-phone"></i>
                                    Số điện thoại
                                </label>
                                <input type="tel" id="editPhone" class="form-control" 
                                    value="${customer.phone || ''}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-map-marker-alt"></i>
                                Địa chỉ
                            </label>
                            <textarea id="editAddress" class="form-control">${customer.address || ''}</textarea>
                        </div>
                    </form>
                `,
                showCancelButton: true,
                confirmButtonText: '<i class="fas fa-save"></i> Lưu thay đổi',
                cancelButtonText: '<i class="fas fa-times"></i> Hủy',
                customClass: {
                    container: 'edit-customer-container',
                    popup: 'edit-customer-popup',
                    header: 'edit-customer-header',
                    title: 'edit-customer-title',
                    closeButton: 'edit-customer-close',
                    content: 'edit-customer-content',
                    confirmButton: 'btn btn-primary',
                    cancelButton: 'btn btn-secondary',
                    actions: 'edit-customer-actions'
                },
                preConfirm: () => {
                    const fullName = document.getElementById('editFullName').value.trim();
                    const email = document.getElementById('editEmail').value.trim();
                    const phone = document.getElementById('editPhone').value.trim();
                    const address = document.getElementById('editAddress').value.trim();
                    
                    if (!fullName || !email) {
                        Swal.showValidationMessage('Vui lòng điền đầy đủ thông tin bắt buộc');
                        return false;
                    }
                    
                    if (!isValidEmail(email)) {
                        Swal.showValidationMessage('Email không hợp lệ');
                        return false;
                    }
                    
                    return { fullName, email, phone, address };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const updatedCustomerList = customerList.map(c => {
                        if (String(c.id) === String(customerId)) {
                            return { ...c, ...result.value };
                        }
                        return c;
                    });
                    
                    localStorage.setItem('users', JSON.stringify(updatedCustomerList));
                    showNotification('success', 'Thành công', 'Đã cập nhật thông tin khách hàng');
                    loadCustomerManagement(); // Tải lại danh sách
                }
            });
        } else if (targetButton.classList.contains('delete-customer')) {
            Swal.fire({
                title: 'Xác nhận xóa',
                text: 'Bạn có chắc chắn muốn xóa khách hàng này không?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Xóa',
                cancelButtonText: 'Hủy',
                customClass: {
                    confirmButton: 'btn btn-danger',
                    cancelButton: 'btn btn-light me-3'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const updatedCustomerList = customerList.filter(c => String(c.id) !== String(customerId));
                    localStorage.setItem('users', JSON.stringify(updatedCustomerList));
                    showNotification('success', 'Thành công', 'Đã xóa khách hàng');
                    loadCustomerManagement(); // Tải lại danh sách
                }
            });
        }
    }

    // === PHẦN 7: QUẢN LÝ SẢN PHẨM ===
function loadInventoryManagement() {
        console.log('Đang tải danh sách sản phẩm...');
        const categories = JSON.parse(localStorage.getItem('categories') || '[]'); // Lấy danh mục để hiển thị tên
        
        if (!inventoryTableBody) {
            console.error("Không tìm thấy tbody của bảng sản phẩm.");
            return;
        }

        const bookList = JSON.parse(localStorage.getItem('books') || '[]');
        inventoryTableBody.innerHTML = ''; // Xóa nội dung cũ

        if (bookList.length === 0) {
            inventoryTableBody.innerHTML = '<tr><td colspan="10" style="text-align: center;">Chưa có sản phẩm nào.</td></tr>';
        } else {
            bookList.forEach(book => {
                const category = categories.find(cat => String(cat.id) === String(book.categoryId));
                const categoryName = category ? category.name : 'N/A';
                const discountedPrice = book.originalPrice * (1 - (book.discount || 0) / 100);

                const row = document.createElement('tr');
                row.dataset.bookId = book.id;
                row.innerHTML = `
                    <td>${book.id}</td>
                    <td><img src="${book.image || 'images/books/default-book.png'}" alt="${book.title}" class="product-thumbnail" onerror="this.src='images/books/default-book.png'"></td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${(book.originalPrice || 0).toLocaleString('vi-VN')}đ</td>
                    <td>${book.discount|| 0}%</td>
                    <td>${discountedPrice.toLocaleString('vi-VN')}đ</td>
                    <td>${categoryName}</td>
                    <td>${book.stock || 0}</td>
                    <td>
                        <button class="action-btn view-product" title="Xem chi tiết"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit-product" title="Chỉnh sửa"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-product" title="Xóa"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                inventoryTableBody.appendChild(row);
            });
        }
        attachInventoryActionEvents(); // Gắn sự kiện (chưa triển khai)
    }

    // --- Hàm trợ giúp: Điền danh mục vào dropdown ---
    function populateCategoryDropdown() {
        const categories = JSON.parse(localStorage.getItem('categories') || '[]');
        productCategorySelect.innerHTML = '<option value="">-- Chọn danh mục --</option>'; // Reset
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            productCategorySelect.appendChild(option);
        });
    }
    
    // --- Hàm gắn sự kiện cho Quản lý Sản phẩm ---
    function attachInventoryActionEvents() {
        const addProductBtn = document.getElementById('addProductBtn');
        if(addProductBtn) {
            addProductBtn.removeEventListener('click', showAddProductModal);
            addProductBtn.addEventListener('click', showAddProductModal);
        }
        
        // Gắn sự kiện cho các nút đóng modal Add Product
        if (addProductModal) {
            addProductModal.querySelectorAll('.close-modal').forEach(btn => {
                btn.removeEventListener('click', () => closeModal(addProductModal));
                btn.addEventListener('click', () => closeModal(addProductModal));
            });
        }
        
        // Gắn sự kiện submit cho form thêm sản phẩm
         if (addProductForm) {
             addProductForm.removeEventListener('submit', handleAddProductSubmit); 
             addProductForm.addEventListener('submit', handleAddProductSubmit);
         }
         
         // Gắn sự kiện change cho input ảnh để preview
         if (productImageInput) {
            productImageInput.removeEventListener('change', handleImagePreview);
            productImageInput.addEventListener('change', handleImagePreview);
         }

        // Gắn sự kiện cho các nút action trong bảng (giữ nguyên)
         if (inventoryTableBody) {
             inventoryTableBody.removeEventListener('click', handleInventoryTableActions);
             inventoryTableBody.addEventListener('click', handleInventoryTableActions);
         }
    }
    
    // --- Hàm xử lý preview ảnh ---    
    function handleImagePreview() {
        const file = this.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                productImagePreview.src = e.target.result;
                productImagePreview.style.display = 'block';
            }
            reader.readAsDataURL(file);
        } else {
            productImagePreview.src = '#';
            productImagePreview.style.display = 'none';
        }
    }
    
    // --- Hàm xử lý action trong bảng sản phẩm (giữ nguyên) ---
    function handleInventoryTableActions(event) {
       // ... code xử lý view/edit/delete ...
        const targetButton = event.target.closest('.action-btn');
        if (!targetButton) return;

        const bookId = targetButton.closest('tr').dataset.bookId;
        if (!bookId) return;

        if (targetButton.classList.contains('view-product')) {
            const books = JSON.parse(localStorage.getItem('books') || '[]');
            const book = books.find(b => String(b.id) === String(bookId));
            
            if (!book) {
                showNotification('error', 'Lỗi', 'Không tìm thấy thông tin sách');
                return;
            }

            Swal.fire({
                title: 'Chi tiết sản phẩm',
                html: `
                    <div class="book-details">
                        <div class="book-image">
                            <img src="${book.image || 'images/books/default-book.png'}" 
                                 alt="${book.title}" 
                                 onerror="this.src='images/books/default-book.png'">
                        </div>
                        <div class="book-info">
                            <h2>${book.title}</h2>
                            <p class="book-author">Tác giả: ${book.author}</p>

                            <div class="price-info">
                                <div class="main-price">
                                    <div class="current-price">
                                        <span class="value">${book.price.toLocaleString('vi-VN')}đ</span>
                                        <span class="discount">-${book.discount || 0}%</span>
                                    </div>
                                    <div class="original-price">${book.originalPrice.toLocaleString('vi-VN')}đ</div>
                                </div>
                                <div class="stock-info">
                                    <i class="fas fa-box"></i>
                                    <span>Còn ${book.stock} cuốn</span>
                                </div>
                            </div>

                            <div class="book-meta">
                                <div class="meta-row">
                                    <i class="fas fa-building"></i>
                                    <span>${book.publisher || 'Chưa cập nhật'}</span>
                                </div>
                                <div class="meta-row">
                                    <i class="fas fa-calendar"></i>
                                    <span>${book.year || 'Chưa cập nhật'}</span>
                                </div>
                                <div class="meta-row">
                                    <i class="fas fa-file-alt"></i>
                                    <span>${book.pages ? book.pages + ' trang' : 'Chưa cập nhật'}</span>
                                </div>
                                <div class="meta-row">
                                    <i class="fas fa-language"></i>
                                    <span>${book.language || 'Chưa cập nhật'}</span>
                                </div>
                                <div class="meta-row">
                                    <i class="fas fa-ruler"></i>
                                    <span>${book.size || 'Chưa cập nhật'}</span>
                                </div>
                            </div>

                            <div class="book-description">
                                <p>${book.description || 'Chưa có mô tả'}</p>
                            </div>
                        </div>
                    </div>
                `,
                width: 700,
                padding: '1.5em',
                showConfirmButton: true,
                confirmButtonText: 'Đóng',
                customClass: {
                    container: 'book-details-container',
                    popup: 'book-details-popup',
                    content: 'book-details-content',
                    confirmButton: 'btn btn-primary'
                }
            });
        } else if (targetButton.classList.contains('edit-product')) {
            const bookList = JSON.parse(localStorage.getItem('books') || '[]');
            const book = bookList.find(b => String(b.id) === String(bookId));
            
            if (!book) {
                showNotification('error', 'Lỗi', 'Không tìm thấy thông tin sản phẩm');
                return;
            }

            Swal.fire({
                title: 'Chỉnh sửa thông tin sản phẩm',
                html: `
                    <form id="editProductForm" class="edit-product-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" style="min-width: 120px; display: inline-block">Tên sách *</label>
                                <input type="text" id="editTitle" class="form-control" value="${book.title}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" style="min-width: 120px; display: inline-block">Tác giả *</label>
                                <input type="text" id="editAuthor" class="form-control" value="${book.author}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" style="min-width: 120px; display: inline-block">Giá gốc *</label>
                                <input type="number" id="editOriginalPrice" class="form-control" value="${book.originalPrice}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" style="min-width: 120px; display: inline-block; margin-bottom: 0">Giảm giá (%)</label>
                                <input type="number" id="editDiscount" class="form-control" value="${book.discount || 0}" min="0" max="100">
                            </div>
                            <div class="form-group">
                                <label class="form-label" style="min-width: 120px; display: inline-block">Số lượng kho *</label>
                                <input type="number" id="editStock" class="form-control" value="${book.stock || 0}" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="min-width: 120px; display: inline-block">Mô tả</label>
                            <textarea id="editDescription" class="form-control">${book.description || ''}</textarea>
                        </div>
                    </form>
                `,
                showCancelButton: true,
                confirmButtonText: 'Lưu thay đổi',
                cancelButtonText: 'Hủy',
                preConfirm: () => {
                    const title = document.getElementById('editTitle').value.trim();
                    const author = document.getElementById('editAuthor').value.trim();
                    const originalPrice = parseFloat(document.getElementById('editOriginalPrice').value);
                    const discount = parseFloat(document.getElementById('editDiscount').value);
                    const stock = parseInt(document.getElementById('editStock').value);
                    const description = document.getElementById('editDescription').value.trim();

                    if (!title || !author || !originalPrice || stock < 0) {
                        Swal.showValidationMessage('Vui lòng điền đầy đủ thông tin bắt buộc');
                        return false;
                    }

                    return { title, author, originalPrice, discount, stock, description };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const updatedBookList = bookList.map(b => {
                        if (String(b.id) === String(bookId)) {
                            return { ...b, ...result.value };
                        }
                        return b;
                    });
                    
                    localStorage.setItem('books', JSON.stringify(updatedBookList));
        
                    loadInventoryManagement();
                }
            });
        } else if (targetButton.classList.contains('delete-product')) {
            Swal.fire({
                title: 'Xác nhận xóa',
                text: 'Bạn có chắc chắn muốn xóa sản phẩm này không?', 
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Xóa',
                cancelButtonText: 'Hủy',
                customClass: {
                    confirmButton: 'btn btn-danger',
                    cancelButton: 'btn btn-light me-3'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    try {
                        const books = JSON.parse(localStorage.getItem('books') || '[]');
                        const updatedBooks = books.filter(b => String(b.id) !== String(bookId));
                        localStorage.setItem('books', JSON.stringify(updatedBooks));
                
                        loadInventoryManagement(); // Tải lại danh sách
                    } catch (error) {
                        console.error('Lỗi khi xóa sản phẩm:', error);
                        showNotification('error', 'Lỗi', 'Không thể xóa sản phẩm. Vui lòng thử lại sau.');
                    }
                }
            });
        }
    }
    
    // --- Hàm hiển thị modal thêm sản phẩm ---
    function showAddProductModal() {
        console.log('Hiển thị modal thêm sản phẩm');
        if (addProductModal && addProductForm) {
            addProductForm.reset(); // Xóa dữ liệu cũ
            populateCategoryDropdown(); // Tải danh mục
            productImagePreview.src = '#'; // Reset preview ảnh
            productImagePreview.style.display = 'none';
            addProductModal.classList.add('show');
        } else {
            console.error('Không tìm thấy modal hoặc form thêm sản phẩm.');
        }
    }
    
    // --- Hàm xử lý submit form thêm sản phẩm ---
    async function handleAddProductSubmit(e) {
        e.preventDefault();
        console.log('Bắt đầu xử lý thêm sản phẩm...')
        
        const title = document.getElementById('productTitle').value.trim();
        const author = document.getElementById('productAuthor').value.trim();
        const imageFile = document.getElementById('productImage').files[0];
        const originalPrice = parseFloat(document.getElementById('productOriginalPrice').value);
        const discountPercent = parseFloat(document.getElementById('productDiscountPercent').value || 0);
        const stock = parseInt(document.getElementById('productStock').value || 0);
        const categoryId = document.getElementById('productCategory').value;
        const publisher = document.getElementById('productPublisher').value.trim();
        const pubYear = parseInt(document.getElementById('productPubYear').value || null);
        const pages = parseInt(document.getElementById('productPages').value || null);
        const language = document.getElementById('productLanguage').value.trim();
        const size = document.getElementById('productSize').value.trim();
        const description = document.getElementById('productDescription').value.trim();

        // --- Validation cơ bản ---
        if (!title || !author || !originalPrice || !categoryId) {
            showError('Vui lòng điền đầy đủ thông tin bắt buộc (*).');
            return;
        }
        if (isNaN(originalPrice) || originalPrice < 0) {
            showError('Giá gốc không hợp lệ.'); return;
        }
         if (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
             showError('Phần trăm giảm giá không hợp lệ.'); return;
         }
        if (isNaN(stock) || stock < 0) {
            showError('Số lượng tồn kho không hợp lệ.'); return;
        }

        // --- Xử lý ảnh ---        
        let imageDataUrl = null;
        if (imageFile && imageFile.type.startsWith('image/')) {
            try {
                imageDataUrl = await readFileAsDataURL(imageFile);
                 console.log('Đọc ảnh thành công, kích thước data URL:', imageDataUrl.length);
            } catch (error) {
                console.error("Lỗi đọc file ảnh:", error);
                showError('Đã xảy ra lỗi khi đọc file ảnh.');
                return;
            }
        } else {
            console.log('Không có file ảnh được chọn hoặc file không hợp lệ.');
            // Có thể dùng ảnh mặc định nếu muốn, ví dụ: 
            // imageDataUrl = 'images/books/default-book.png'; 
        }

        // --- Tạo đối tượng sách mới ---
        const books = JSON.parse(localStorage.getItem('books') || '[]');
        const newBookId = books.length > 0 ? Math.max(...books.map(b => b.id || 0)) + 1 : 1;
        
        const newBookData = {
            id: newBookId,
            title: title,
            author: author,
            image: imageDataUrl, // Lưu Data URL hoặc null/ảnh mặc định
            originalPrice: originalPrice,
            discountPercent: discountPercent,
            price: originalPrice * (1 - discountPercent / 100), // Tự tính giá bán
            stock: stock,
            categoryId: parseInt(categoryId),
            publisher: publisher,
            year: pubYear, // year thay vì pubYear
            pages: pages,
            language: language,
            size: size,
            description: description
            // Thêm các trường khác nếu cần, ví dụ: isbn nếu có input
        };
        
        console.log('Dữ liệu sách mới:', newBookData);

        // --- Lưu vào localStorage ---
        books.push(newBookData);
        localStorage.setItem('books', JSON.stringify(books));
        
        
        closeModal(addProductModal);
        loadInventoryManagement(); // Tải lại bảng
    }

    // --- Hàm trợ giúp đọc file ảnh --- 
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // === PHẦN 8: QUẢN LÝ ĐƠN HÀNG ===
    function loadOrderManagement() {
        console.log('Đang tải danh sách đơn hàng...');
        const orderTableBody = document.querySelector('#orderTable tbody');
        const users = JSON.parse(localStorage.getItem('users') || '[]'); // Lấy user để hiển thị tên

        if (!orderTableBody) {
            console.error("Không tìm thấy tbody của bảng đơn hàng.");
            return;
        }

        const orderList = JSON.parse(localStorage.getItem('orders') || '[]');
        orderTableBody.innerHTML = ''; // Xóa nội dung cũ

        if (orderList.length === 0) {
            orderTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Chưa có đơn hàng nào.</td></tr>';
        } else {
            // Sắp xếp đơn hàng mới nhất lên đầu (dựa vào id hoặc date)
            orderList.sort((a, b) => (b.id || 0) - (a.id || 0)); 

            orderList.forEach(order => {
                const customer = users.find(u => String(u.id) === String(order.userId));
                const customerName = customer ? (customer.fullName || customer.username) : 'Khách vãng lai';
                const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A';
                const orderTotal = (order.total || 0).toLocaleString('vi-VN') + 'đ';
                
                // Định dạng trạng thái (có thể tùy chỉnh thêm)
                let statusBadge = '';
                switch (order.status) {
                    case 'pending': statusBadge = '<span class="status-badge pending">Đang xử lý</span>'; break;
                    case 'processing': statusBadge = '<span class="status-badge processing">Đang giao</span>'; break;
                    case 'completed': statusBadge = '<span class="status-badge completed">Đã hoàn thành</span>'; break;
                    case 'cancelled': statusBadge = '<span class="status-badge cancelled">Đã hủy</span>'; break;
                    default: statusBadge = `<span class="status-badge">${order.status || 'N/A'}</span>`;
                }

                const row = document.createElement('tr');
                row.dataset.orderId = order.id;
                row.innerHTML = `
                    <td>#${order.id || 'N/A'}</td>
                    <td>${customerName}</td>
                    <td>${orderDate}</td>
                    <td>${orderTotal}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="action-btn view-order" title="Xem chi tiết"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit-order-status" title="Cập nhật trạng thái"><i class="fas fa-edit"></i></button>
                    </td>
                `;
                orderTableBody.appendChild(row);
            });
        }
        attachOrderActionEvents();
    }

    function attachOrderActionEvents() {
        const orderTableBody = document.querySelector('#orderTable tbody');
         if (orderTableBody) {
             orderTableBody.removeEventListener('click', handleOrderTableActions);
             orderTableBody.addEventListener('click', handleOrderTableActions);
         }
         // TODO: Gắn sự kiện cho modal xem chi tiết/cập nhật trạng thái
    }

    function handleOrderTableActions(event) {
        const targetButton = event.target.closest('.action-btn');
        if (!targetButton) return;

        const orderId = targetButton.closest('tr').dataset.orderId;
        if (!orderId) return;

        if (targetButton.classList.contains('view-order')) {
            viewOrderDetails(orderId);
        } else if (targetButton.classList.contains('edit-order-status')) {
            editOrderStatus(orderId);
        }
    }
            
    function viewOrderDetails(orderId) {
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            const order = orders.find(o => String(o.id) === String(orderId));
            
            if (!order) {
                showNotification('error', 'Lỗi', 'Không tìm thấy đơn hàng');
                return;
            }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const customer = users.find(u => String(u.id) === String(order.userId));
        const customerName = customer ? (customer.fullName || customer.username) : 'Khách vãng lai';

        let orderItems = '';
        order.items.forEach(item => {
            orderItems += `
                <tr>
                    <td>${item.title || 'N/A'}</td>
                    <td>${item.quantity}</td>
                    <td>${(item.price || 0).toLocaleString('vi-VN')}đ</td>
                    <td>${((item.price || 0) * item.quantity).toLocaleString('vi-VN')}đ</td>
                </tr>
            `;
        });

        Swal.fire({
            title: `Chi tiết đơn hàng #${order.id}`,
            html: `
                <div class="order-details">
                    <div class="customer-info mb-3">
                        <p><strong>Khách hàng:</strong> ${customerName}</p>
                        <p><strong>Ngày đặt:</strong> ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                        <p><strong>Địa chỉ:</strong> ${order.shippingInfo?.address || 'N/A'}</p>
                        <p><strong>SĐT:</strong> ${order.shippingInfo?.phone || 'N/A'}</p>
                    </div>
                    <table class="table table-bordered table-hover" style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="padding: 12px; border: 1px solid #dee2e6; text-align: left;">Sản phẩm</th>
                                <th style="padding: 12px; border: 1px solid #dee2e6; text-align: center;">Số lượng</th>
                                <th style="padding: 12px; border: 1px solid #dee2e6; text-align: right;">Đơn giá</th>
                                <th style="padding: 12px; border: 1px solid #dee2e6; text-align: right;">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orderItems}
                        </tbody>
                        <tfoot>
                            <tr style="background-color: #f8f9fa;">
                                <td colspan="3" style="padding: 12px; border: 1px solid #dee2e6; text-align: right;"><strong>Tổng cộng:</strong></td>
                                <td style="padding: 12px; border: 1px solid #dee2e6; text-align: right;"><strong>${(order.total || 0).toLocaleString('vi-VN')}đ</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `,
            width: '600px',
            confirmButtonText: 'Đóng',
            customClass: {
                confirmButton: 'btn btn-primary'
            }
        });
    }

    function editOrderStatus(orderId) {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const order = orders.find(o => String(o.id) === String(orderId));
        
        if (!order) {
            showNotification('error', 'Lỗi', 'Không tìm thấy đơn hàng');
            return;
        }

        Swal.fire({
            title: `Cập nhật trạng thái đơn hàng #${orderId}`,
            html: `
                <div class="status-select-form">
                    <label class="form-label">Trạng thái hiện tại: 
                        <span class="current-status ${order.status}">${getStatusText(order.status)}</span>
                    </label>
                    <select id="newStatus" class="form-control">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Đang xử lý</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Đang giao hàng</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Đã hoàn thành</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
                    </select>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Cập nhật',
            cancelButtonText: 'Hủy',
            preConfirm: () => {
                const newStatus = document.getElementById('newStatus').value;
                return { newStatus };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                order.status = result.value.newStatus;
                localStorage.setItem('orders', JSON.stringify(orders));
                loadOrderManagement();
                loadRecentOrders();
                showNotification('success', 'Thành công', 'Đã cập nhật trạng thái đơn hàng');
            }
        });
    }

    function getStatusText(status) {
        const statusMap = {
            'pending': 'Đang xử lý',
            'processing': 'Đang giao hàng',
            'completed': 'Đã hoàn thành',
            'cancelled': 'Đã hủy'
        };
        return statusMap[status] || status;
    }

    // === PHẦN 9: BÁO CÁO DOANH THU ===
    function loadReportsManagement() {
        console.log('Tải trang báo cáo...');
        const startDateInput = document.getElementById('reportStartDate');
        const endDateInput = document.getElementById('reportEndDate');
        const generateBtn = document.getElementById('generateReportBtn');
        
        if (startDateInput && endDateInput && generateBtn) {
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            startDateInput.valueAsDate = firstDayOfMonth;
            endDateInput.valueAsDate = today;
            
            generateBtn.removeEventListener('click', generateRevenueReport);
            generateBtn.addEventListener('click', generateRevenueReport);
            
            // Ẩn các phần kết quả khi mới load tab
            document.getElementById('reportSummary').style.display = 'none';
            document.getElementById('reportCharts').style.display = 'none'; // Ẩn container chart

        } else {
             console.error('Thiếu các thành phần input ngày hoặc nút tạo báo cáo.');
        }
    }

    function generateRevenueReport() {
        console.log('Đang tạo báo cáo doanh thu...');
        
        // Hiển thị loading
        showNotification('info', 'Đang tạo báo cáo', 'Vui lòng đợi trong giây lát...');
        
        const startDateInput = document.getElementById('reportStartDate');
        const endDateInput = document.getElementById('reportEndDate');
        const startDate = startDateInput.valueAsDate;
        const endDate = endDateInput.valueAsDate;
        if (!startDate || !endDate || startDate > endDate) {
             showError('Vui lòng chọn khoảng thời gian hợp lệ.'); return;
        }
        endDate.setHours(23, 59, 59, 999);
        
        // Tính khoảng thời gian đã chọn (tính theo ngày)
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        
        // Tạo dữ liệu ảo dựa trên khoảng thời gian
        // Số đơn hàng: 3-15 đơn mỗi ngày
        const fakeOrderCount = Math.floor(daysDiff * (Math.random() * 12 + 3));
        
        // Doanh thu: ~200,000đ - 500,000đ cho mỗi đơn
        const fakeRevenuePerOrder = Math.floor(Math.random() * 300000 + 200000);
        const fakeTotalRevenue = fakeOrderCount * fakeRevenuePerOrder;
        
        // Hiển thị kết quả tóm tắt
        const totalRevenueEl = document.getElementById('totalRevenue');
        const completedOrdersCountEl = document.getElementById('completedOrdersCount');
        const reportSummaryEl = document.getElementById('reportSummary');
        
        if (totalRevenueEl && completedOrdersCountEl && reportSummaryEl) {
            totalRevenueEl.textContent = fakeTotalRevenue.toLocaleString('vi-VN') + 'đ';
            completedOrdersCountEl.textContent = fakeOrderCount;
            
            // Hiển thị phần tóm tắt với hiệu ứng
            reportSummaryEl.style.display = 'grid';
            reportSummaryEl.style.opacity = '0';
    setTimeout(() => {
                reportSummaryEl.style.transition = 'opacity 0.5s ease';
                reportSummaryEl.style.opacity = '1';
            }, 100);
            
            // Cuộn đến phần tóm tắt để người dùng thấy ngay
            reportSummaryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Hiển thị thông báo thành công với dữ liệu ảo
            const startDateStr = startDate.toLocaleDateString('vi-VN');
            const endDateStr = endDate.toLocaleDateString('vi-VN');
            showSuccess(`Báo cáo từ ${startDateStr} đến ${endDateStr} (${daysDiff} ngày)`);
        } else {
            console.error('Thiếu phần tử hiển thị summary báo cáo.');
        }

        // Hiển thị các biểu đồ với dữ liệu ảo
        createFakeProductRevenueChart();
        createFakeTimeRevenueChart(startDate, endDate);
        createFakeCategoryRevenueChart();
        
        // Hiển thị khu vực chứa các biểu đồ
        const reportChartsEl = document.getElementById('reportCharts');
        if(reportChartsEl) {
            reportChartsEl.style.display = 'block';
        }
    }
    
    // --- Hàm tạo biểu đồ Doanh thu Sản phẩm (Ảo) ---
    function createFakeProductRevenueChart() {
        const ctx = document.getElementById('productRevenueChart')?.getContext('2d');
        if (!ctx) return;

        const books = JSON.parse(localStorage.getItem('books') || '[]');
        const topProducts = books.slice(0, 5); // Lấy 5 SP đầu
        
        // Tạo dữ liệu 
        const labels = topProducts.map(book => {
            // Rút gọn tên sách nếu quá dài
            return book.title.length > 25 ? book.title.substring(0, 22) + '...' : book.title;
        });
        const dataValues = topProducts.map(book => {
            const fakeQuantity = Math.floor(Math.random() * 50) + 5;
            return Math.round(fakeQuantity * (book.price || 50000) * (0.8 + Math.random() * 0.4));
        });

        // Hủy biểu đồ cũ nếu tồn tại
        if (productRevenueChartInstance) {
            productRevenueChartInstance.destroy();
        }

        // Gradient cho bar
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(54, 162, 235, 0.8)');
        gradient.addColorStop(1, 'rgba(54, 162, 235, 0.2)');

        // Tạo biểu đồ mới với cấu hình nâng cao
        productRevenueChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh thu (VNĐ)',
                    data: dataValues,
                    backgroundColor: gradient,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    borderRadius: 6,
                    hoverBackgroundColor: 'rgba(54, 162, 235, 0.9)',
                    barPercentage: 0.7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: 16
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            borderDash: [3, 3]
                        },
                        ticks: { 
                            callback: value => value.toLocaleString('vi-VN') + 'đ',
                            font: {
                                weight: 'bold'
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                weight: 'bold'
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return 'Doanh thu: ' + context.parsed.y.toLocaleString('vi-VN') + 'đ';
                            }
                        }
                    },
                    legend: {
                        display: false
                    },
                    title: {
                        display: false
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
        
        // Đặt chiều cao cố định cho container
        ctx.canvas.parentNode.style.height = '350px';
    }
    
    // --- Hàm tạo biểu đồ Doanh thu Thời gian (Ảo) ---
    function createFakeTimeRevenueChart(startDate, endDate) {
        const ctx = document.getElementById('timeRevenueChart')?.getContext('2d');
        if (!ctx) return;

        const labels = [];
        const dataValues = [];
        
        let currentDate = new Date(startDate);
        let daysCount = 0;
        const maxDays = Math.min(Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)), 30);
        
        // Tạo gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(75, 192, 192, 0.5)');
        gradient.addColorStop(1, 'rgba(75, 192, 192, 0.1)');

        while (currentDate <= endDate && daysCount < maxDays) { 
            labels.push(currentDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
            const fakeOrders = Math.floor(Math.random() * 15) + 1;
            dataValues.push(Math.round(fakeOrders * (Math.random() * 300000 + 100000)));
            currentDate.setDate(currentDate.getDate() + 1);
            daysCount++;
        }

        // Hủy biểu đồ cũ
        if (timeRevenueChartInstance) {
            timeRevenueChartInstance.destroy();
        }

        // Tạo biểu đồ mới với cấu hình nâng cao
        timeRevenueChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh thu (VNĐ)',
                    data: dataValues,
                    fill: true,
                    backgroundColor: gradient,
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: 'white',
                    pointBorderColor: 'rgb(75, 192, 192)',
                    pointBorderWidth: 2,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: 'white',
                    pointHoverBorderColor: 'rgb(75, 192, 192)',
                    pointHoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: 16
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            borderDash: [3, 3]
                        },
                        ticks: { 
                            callback: value => value.toLocaleString('vi-VN') + 'đ',
                            font: {
                                weight: 'bold'
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                weight: 'bold'
                            },
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return 'Doanh thu: ' + context.parsed.y.toLocaleString('vi-VN') + 'đ';
                            }
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
        
        // Đặt chiều cao cố định cho container
        ctx.canvas.parentNode.style.height = '350px';
    }
    
    // --- Hàm tạo biểu đồ Doanh thu Danh mục (Ảo) ---
    function createFakeCategoryRevenueChart() {
        const ctx = document.getElementById('categoryRevenueChart')?.getContext('2d');
        if (!ctx) return;

        const categories = JSON.parse(localStorage.getItem('categories') || '[]');
        const labels = categories.map(cat => cat.name);
        const dataValues = categories.map(() => {
            const fakeProductsSold = Math.floor(Math.random() * 100) + 10;
            return Math.round(fakeProductsSold * (Math.random() * 150000 + 50000));
        });

        // Màu sắc chuyên nghiệp hơn
        const backgroundColors = [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)'
        ];
        const borderColors = [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
        ];

        // Hủy biểu đồ cũ
        if (categoryRevenueChartInstance) {
            categoryRevenueChartInstance.destroy();
        }

        // Tạo biểu đồ mới (Doughnut) với cấu hình nâng cao
        categoryRevenueChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh thu (VNĐ)',
                    data: dataValues,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2,
                    hoverOffset: 15,
                    hoverBorderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                layout: {
                    padding: 20
                },
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 13,
                                weight: 'bold'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleFont: {
                            size: 14, 
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${context.label}: ${value.toLocaleString('vi-VN')}đ (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
        
        // Đặt chiều cao cố định cho container
        ctx.canvas.parentNode.style.height = '400px';
    }

    // === CÁC HÀM LOAD ===
    
    // --- Load Recent Orders (cho Dashboard) ---
    function loadRecentOrders() {
        console.log('Đang tải đơn hàng gần đây...');
        
        // Lấy dữ liệu đơn hàng từ localStorage
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        
        // Sắp xếp đơn hàng theo thời gian tạo mới nhất
        const sortedOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Lấy 10 đơn hàng mới nhất
        const recentOrders = sortedOrders.slice(0, 10);
        
        // Hiển thị đơn hàng
        const recentOrdersTable = document.querySelector('#recentOrdersTable tbody');
        if (recentOrdersTable) {
            recentOrdersTable.innerHTML = '';
            
            if (recentOrders.length === 0) {
                recentOrdersTable.innerHTML = '<tr><td colspan="6" class="text-center">Không có đơn hàng nào</td></tr>';
                return;
            }
            
            recentOrders.forEach(order => {
                const orderDate = new Date(order.createdAt).toLocaleDateString('vi-VN');
                const orderTotal = order.total.toLocaleString('vi-VN') + 'đ';
                
                // Định dạng trạng thái
                let statusBadge = '';
                switch (order.status) {
                    case 'pending': statusBadge = '<span class="status-badge pending">Chờ xử lý</span>'; break;
                    case 'processing': statusBadge = '<span class="status-badge processing">Đang giao</span>'; break;
                    case 'completed': statusBadge = '<span class="status-badge completed">Đã hoàn thành</span>'; break;
                    case 'cancelled': statusBadge = '<span class="status-badge cancelled">Đã hủy</span>'; break;
                    default: statusBadge = `<span class="status-badge">${order.status || 'N/A'}</span>`;
                }
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>#${order.id}</td>
                    <td>${order.shippingInfo?.name || getUserName(order.userId)}</td>
                    <td>${orderDate}</td>
                    <td>${orderTotal}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="action-btn view-order" title="Xem chi tiết" data-order-id="${order.id}"><i class="fas fa-eye"></i></button>
                        <button class="action-btn edit-order-status" title="Cập nhật trạng thái" data-order-id="${order.id}"><i class="fas fa-edit"></i></button>
                    </td>
                `;
                
                recentOrdersTable.appendChild(row);
            });
            
            // Gắn sự kiện cho các nút hành động
            const actionButtons = recentOrdersTable.querySelectorAll('.action-btn');
            actionButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const orderId = this.dataset.orderId;
                    if (this.classList.contains('view-order')) {
                        viewOrderDetails(orderId);
                    } else if (this.classList.contains('edit-order-status')) {
                        editOrderStatus(orderId);
                    }
                });
            });
        }
    }

    function attachRecentOrderActionEvents() {
         const recentOrdersTableBody = document.querySelector('#recentOrdersTable tbody');
         if (recentOrdersTableBody) {
             // Chỉ xử lý view-order, dùng lại logic của handleOrderTableActions nếu muốn
             recentOrdersTableBody.removeEventListener('click', handleRecentOrderClick);
             recentOrdersTableBody.addEventListener('click', handleRecentOrderClick);
         }
    }
    
    function handleRecentOrderClick(event) {
        const targetButton = event.target.closest('.view-order');
        if (!targetButton) return;
        const orderId = targetButton.closest('tr').dataset.orderId;
        if (!orderId) return;
        console.log(`Xem chi tiết đơn hàng gần đây ID: ${orderId}`);
        // TODO: Triển khai modal xem chi tiết đơn hàng (có thể dùng chung hàm với Quản lý Đơn hàng)
      
    }

    // ... các hàm load khác ...

    // === CÁC HÀM LOAD KHÁC ===
    function loadDashboardStats() { 
        console.log('Tải dashboard stats...'); 
        // TODO: Code tải các thẻ stat
    }
    // ... các hàm load khác ...

    // Hàm lấy tên người dùng từ userId
    function getUserName(userId) {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => String(u.id) === String(userId));
            if (user) {
                return user.fullName || user.username || 'Khách hàng';
            }
            return 'Khách hàng';
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
            return 'Khách hàng';
        }
    }

}); // Kết thúc DOMContentLoaded

