document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    checkAuth();

    // Xử lý toggle sidebar
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });

    // Xử lý dropdown menu
    const userMenuBtn = document.getElementById('userMenuBtn');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    userMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    // Đóng dropdown khi click ra ngoài
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.user-menu')) {
            dropdownMenu.classList.remove('show');
        }
    });

    // Xử lý đăng xuất
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });

    // Xử lý chuyển tab
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            loadContent(targetId);
            
            // Cập nhật trạng thái active
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');
        });
    });

    // Xử lý các nút hành động trong bảng
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.title;
            const orderId = this.closest('tr').querySelector('td:first-child').textContent;
            handleOrderAction(orderId, action);
        });
    });

    // === THÊM: Xử lý nút xem hồ sơ ===
    const viewProfileBtn = document.getElementById('viewProfileBtn');
    const profileModal = document.getElementById('profileModal');
    const closeProfileModal = document.getElementById('closeProfileModal');
    const editProfileBtn = document.getElementById('editProfileBtn');

    if (viewProfileBtn) {
        viewProfileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loadStaffProfile();
            profileModal.style.display = 'block';
            // Đóng dropdown sau khi mở modal
            dropdownMenu.classList.remove('show');
        });
    }

    if (closeProfileModal) {
        closeProfileModal.addEventListener('click', function() {
            profileModal.style.display = 'none';
        });
    }

    // Đóng modal khi click bên ngoài
    window.addEventListener('click', function(e) {
        if (e.target === profileModal) {
            profileModal.style.display = 'none';
        }
    });

    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            // Lấy thông tin người dùng hiện tại
            const user = JSON.parse(sessionStorage.getItem('staffUser')) || JSON.parse(localStorage.getItem('staffUser'));
            if (!user) {
                showNotification('error', 'Lỗi', 'Không thể tìm thấy thông tin người dùng');
                return;
            }
            
            // Tạo form chỉnh sửa
            const editForm = document.createElement('form');
            editForm.id = 'editProfileForm';
            editForm.className = 'edit-profile-form';
            editForm.innerHTML = `
                <h3>Chỉnh sửa thông tin cá nhân</h3>
                <div class="form-group">
                    <label for="editName">Họ và tên:</label>
                    <input type="text" id="editName" value="${user.name || ''}" required>
                </div>
                <div class="form-group">
                    <label for="editEmail">Email:</label>
                    <input type="email" id="editEmail" value="${user.email || ''}" required>
                </div>
                <div class="form-group">
                    <label for="editPhone">Số điện thoại:</label>
                    <input type="tel" id="editPhone" value="${user.phone || ''}" pattern="[0-9]{10}" title="Số điện thoại phải có 10 chữ số">
                </div>
                <div class="form-buttons">
                    <button type="button" id="cancelEdit" class="cancel-btn">Hủy</button>
                    <button type="submit" class="save-btn">Lưu thay đổi</button>
                </div>
            `;

            // Lấy đối tượng profile-content và lưu trữ nội dung gốc
            const profileContent = document.querySelector('.profile-content');
            if (!profileContent) {
                showNotification('error', 'Lỗi', 'Không tìm thấy phần tử profile-content');
                return;
            }
            
            const originalContent = profileContent.innerHTML;
            profileContent.innerHTML = '';
            profileContent.appendChild(editForm);
            
            // Thêm CSS cho form chỉnh sửa
            const style = document.createElement('style');
            style.textContent = `
                .edit-profile-form {
                    padding: 10px 0;
                }
                .edit-profile-form h3 {
                    margin: 0 0 20px;
                    color: #2196F3;
                    text-align: center;
                }
                .form-group {
                    margin-bottom: 15px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 500;
                    color: #555;
                }
                .form-group input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                }
                .form-buttons {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 20px;
                }
                .cancel-btn {
                    background: #f5f5f5;
                    color: #333;
                    border: 1px solid #ddd;
                    padding: 8px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                }
                .save-btn {
                    background: #2196F3;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                }
                .cancel-btn:hover {
                    background: #e0e0e0;
                }
                .save-btn:hover {
                    background: #0d8bf0;
                }
            `;
            document.head.appendChild(style);
            
            // Ẩn nút chỉnh sửa
            editProfileBtn.style.display = 'none';

            // Xử lý sự kiện hủy
            document.getElementById('cancelEdit').addEventListener('click', function() {
                profileContent.innerHTML = originalContent;
                editProfileBtn.style.display = 'block';
                document.head.removeChild(style);
            });

            // Xử lý sự kiện submit form
            editForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const newName = document.getElementById('editName').value.trim();
                const newEmail = document.getElementById('editEmail').value.trim();
                const newPhone = document.getElementById('editPhone').value.trim();
                
                // Kiểm tra dữ liệu hợp lệ
                if (!newName) {
                    showNotification('error', 'Lỗi', 'Họ và tên không được để trống');
                    return;
                }
                
                if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
                    showNotification('error', 'Lỗi', 'Email không hợp lệ');
                    return;
                }
                
                if (newPhone && !/^[0-9]{10}$/.test(newPhone)) {
                    showNotification('error', 'Lỗi', 'Số điện thoại phải có 10 chữ số');
                    return;
                }
                
                // Cập nhật thông tin mới
                user.name = newName;
                user.email = newEmail;
                user.phone = newPhone;

                // Lưu vào storage
                if(localStorage.getItem('staffUser')) {
                    localStorage.setItem('staffUser', JSON.stringify(user));
                }
                if(sessionStorage.getItem('staffUser')) {
                    sessionStorage.setItem('staffUser', JSON.stringify(user));
                }

                // Cập nhật danh sách nhân viên trong localStorage
                let staffList = JSON.parse(localStorage.getItem('staffUsers') || '[]');
                const index = staffList.findIndex(staff => staff.id === user.id);
                if(index !== -1) {
                    staffList[index] = {...staffList[index], ...user};
                    localStorage.setItem('staffUsers', JSON.stringify(staffList));
                }

                // Hiển thị lại thông tin hồ sơ
                profileContent.innerHTML = originalContent;
                editProfileBtn.style.display = 'block';
                document.head.removeChild(style);
                
                // Tải lại thông tin hồ sơ
                loadStaffProfile();
                
                // Cập nhật tên hiển thị trên header
                document.querySelector('.user-name').textContent = user.name;
                
                // Hiển thị thông báo
                showNotification('success', 'Thành công', 'Đã cập nhật thông tin hồ sơ');
            });
        });
    }
});

// Kiểm tra trạng thái đăng nhập
function checkAuth() {
    const user = JSON.parse(sessionStorage.getItem('staffUser')) || JSON.parse(localStorage.getItem('staffUser'));
    if (!user || user.role !== 'staff') {
        window.location.href = 'staff-login.html';
        return;
    }

    // Cập nhật thông tin người dùng
    document.querySelector('.user-name').textContent = user.name;
}

// Xử lý đăng xuất
function logout() {
    sessionStorage.removeItem('staffUser');
    localStorage.removeItem('staffUser');
    window.location.href = 'staff-login.html';
}

// === THÊM: Hàm tải thông tin hồ sơ nhân viên ===
function loadStaffProfile() {
    const user = JSON.parse(sessionStorage.getItem('staffUser')) || JSON.parse(localStorage.getItem('staffUser'));
    if (!user) return;

    // Cập nhật thông tin vào modal
    const profileElements = {
        profileName: document.getElementById('profileName'),
        profileRole: document.getElementById('profileRole'),
        profileUsername: document.getElementById('profileUsername'),
        profileEmail: document.getElementById('profileEmail'),
        profilePhone: document.getElementById('profilePhone'),
        profileJoinDate: document.getElementById('profileJoinDate'),
        profileOrdersProcessed: document.getElementById('profileOrdersProcessed'),
        profilePerformance: document.getElementById('profilePerformance'),
        profileAvatar: document.getElementById('profileAvatar')
    };

    // Kiểm tra và cập nhật từng phần tử
    if (profileElements.profileName) profileElements.profileName.textContent = user.name || 'Chưa cập nhật';
    if (profileElements.profileRole) profileElements.profileRole.textContent = user.role === 'staff' ? 'Nhân viên bán hàng' : 'Quản lý';
    if (profileElements.profileUsername) profileElements.profileUsername.textContent = user.username || 'Chưa cập nhật';
    if (profileElements.profileEmail) profileElements.profileEmail.textContent = user.email || 'Chưa cập nhật';
    if (profileElements.profilePhone) profileElements.profilePhone.textContent = user.phone || 'Chưa cập nhật';
    
    // Các thông tin bổ sung (có thể lấy từ dữ liệu hoặc tạo giả lập)
    const joinDate = user.joinDate || '01/01/2023';
    if (profileElements.profileJoinDate) profileElements.profileJoinDate.textContent = joinDate;
    
    // Dữ liệu mẫu - có thể thay bằng dữ liệu thực tế
    const processedOrders = Math.floor(Math.random() * 200) + 50;
    if (profileElements.profileOrdersProcessed) profileElements.profileOrdersProcessed.textContent = processedOrders.toString();
    
    let performance = 'Tốt';
    if (processedOrders > 150) performance = 'Xuất sắc';
    else if (processedOrders > 100) performance = 'Rất tốt';
    else if (processedOrders < 70) performance = 'Cần cải thiện';
    if (profileElements.profilePerformance) profileElements.profilePerformance.textContent = performance;
    
    // Cập nhật avatar nếu có
    if (profileElements.profileAvatar) {
        if (user.avatar) {
            profileElements.profileAvatar.src = user.avatar;
        } else {
            profileElements.profileAvatar.src = 'images/nv.jpg'; // Ảnh mặc định
        }
    }
}

// === THÊM: Hàm tải dữ liệu tổng quan ===
function loadDashboard() {
    console.log('Đang tải dữ liệu tổng quan...');
    
    // Tải danh sách sản phẩm trước
    allProducts = JSON.parse(localStorage.getItem('books') || '[]');
    if (allProducts.length === 0) {
        initBooksData();
        allProducts = JSON.parse(localStorage.getItem('books') || '[]');
    }
    
    // Lấy dữ liệu đơn hàng từ localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Tính toán các thống kê
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(order => order.createdAt.startsWith(today));
    const pendingOrders = orders.filter(order => order.status === 'pending');
    const completedOrders = orders.filter(order => order.status === 'completed');
    
    // Cập nhật các thống kê
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 3) {
        statNumbers[0].textContent = completedOrders.length;
        statNumbers[1].textContent = pendingOrders.length;
        statNumbers[2].textContent = todayOrders.length;
    }
    
    // Hiển thị danh sách đơn hàng cần xử lý
    const recentOrdersTable = document.querySelector('#dashboard-section .data-table tbody');
    if (recentOrdersTable) {
        recentOrdersTable.innerHTML = '';
        
        // Lấy 5 đơn hàng mới nhất cần xử lý
        const recentPendingOrders = pendingOrders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
        
        if (recentPendingOrders.length === 0) {
            recentOrdersTable.innerHTML = '<tr><td colspan="6" class="text-center">Không có đơn hàng nào cần xử lý</td></tr>';
            return;
        }
        
        recentPendingOrders.forEach(order => {
            const orderDate = new Date(order.createdAt).toLocaleDateString('vi-VN');
            const orderTotal = order.total.toLocaleString('vi-VN') + 'đ';
            
            // Lấy danh sách sản phẩm
            const productList = order.items.map(item => {
                const book = allProducts.find(b => b.id == item.bookId);
                return `${book ? book.title : 'Sản phẩm không tồn tại'} x${item.quantity}`;
            }).join(', ');
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${order.id}</td>
                <td>${order.shippingInfo?.name || getUserName(order.userId)}</td>
                <td>${productList}</td>
                <td>${orderTotal}</td>
                <td><span class="status-badge pending">Chờ xử lý</span></td>
                <td>
                    <button class="action-btn view-order" title="Xem chi tiết" data-order-id="${order.id}"><i class="fas fa-eye"></i></button>
                    <button class="action-btn process-order" title="Xử lý đơn hàng" data-order-id="${order.id}"><i class="fas fa-check"></i></button>
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
                } else if (this.classList.contains('process-order')) {
                    editOrderStatus(orderId);
                }
            });
        });
    }
}

// Cập nhật hàm loadContent để gọi loadDashboard khi chuyển tab
function loadContent(targetId) {
    // Cập nhật tiêu đề
    const pageTitle = document.querySelector('.nav-left h2');
    
    // Ẩn tất cả các phần nội dung
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Hiển thị phần được chọn
    const selectedSection = document.getElementById(`${targetId}-section`);
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }
    
    switch(targetId) {
        case 'dashboard':
            pageTitle.textContent = 'Tổng quan';
            loadDashboard();
            break;
        case 'orders':
            pageTitle.textContent = 'Quản lý sản phẩm';
            loadProducts();
            break;
        case 'inventory':
            pageTitle.textContent = 'Quản lý đơn hàng';
            loadOrders();
            break;
    }
}

// Xử lý các hành động với đơn hàng
function handleOrderAction(orderId, action) {
    switch(action) {
        case 'Xem chi tiết':
            showOrderDetails(orderId);
            break;
        case 'Xử lý đơn hàng':
            processOrder(orderId);
            break;
    }
}

// Hàm lấy tên sách từ ID
function getBookTitleById(bookId) {
    try {
        const books = JSON.parse(localStorage.getItem('books') || '[]');
        const book = books.find(b => String(b.id) === String(bookId));
        return book ? book.title : 'Sách không tồn tại';
    } catch (error) {
        console.error('Lỗi khi lấy thông tin sách:', error);
        return 'Không thể lấy thông tin sách';
    }
}

// Hàm xem chi tiết đơn hàng
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
        const bookTitle = getBookTitleById(item.bookId);
        orderItems += `
            <tr>
                <td>${bookTitle}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toLocaleString('vi-VN')}đ</td>
                <td>${(item.price * item.quantity).toLocaleString('vi-VN')}đ</td>
            </tr>
        `;
    });

    Swal.fire({
        title: `Chi tiết đơn hàng #${order.id}`,
        html: `
            <div class="order-details">
                <div class="customer-info">
                    <p><strong>Khách hàng:</strong> ${customerName}</p>
                    <p><strong>Ngày đặt:</strong> ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                    <p><strong>Địa chỉ:</strong> ${order.shippingInfo?.address || 'N/A'}</p>
                    <p><strong>SĐT:</strong> ${order.shippingInfo?.phone || 'N/A'}</p>
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderItems}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="text-end"><strong>Tổng cộng:</strong></td>
                            <td><strong>${(order.total || 0).toLocaleString('vi-VN')}đ</strong></td>
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

// Xử lý đơn hàng
function processOrder(orderId) {
    // TODO: Cập nhật trạng thái đơn hàng
    console.log(`Xử lý đơn hàng: ${orderId}`);
    showNotification('success', 'Thành công', 'Đơn hàng đã được xử lý');
}

// === THÊM: Biến và hằng số cho quản lý đơn hàng ===
let currentOrderPage = 1;
let ordersPerPage = 10;
let allOrders = [];
let filteredOrders = [];

// Hàm tải danh sách đơn hàng
function loadOrders() {
    console.log('Đang tải danh sách đơn hàng...');
    
    // Khởi tạo các sự kiện cho trang đơn hàng nếu chưa được khởi tạo
    initOrdersEvents();
    
    // Lấy dữ liệu đơn hàng từ localStorage
    allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    filteredOrders = [...allOrders]; // Ban đầu hiển thị tất cả đơn hàng
    
    // Nếu chưa có dữ liệu đơn hàng, khởi tạo dữ liệu mẫu
    if (allOrders.length === 0) {
        initOrdersData();
        allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        filteredOrders = [...allOrders];
    }
    
    // Hiển thị đơn hàng
    displayOrders();
}

// Hàm khởi tạo dữ liệu đơn hàng mẫu
function initOrdersData() {
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

// Hàm khởi tạo các sự kiện cho trang đơn hàng
function initOrdersEvents() {
    // Lấy các phần tử
    const prevPageBtn = document.getElementById('orderPrevPage');
    const nextPageBtn = document.getElementById('orderNextPage');
    const itemsPerPageSelect = document.getElementById('orderItemsPerPage');
    const searchInput = document.getElementById('orderSearchInput');
    const searchBtn = document.getElementById('orderSearchBtn');
    
    // Xử lý sự kiện chuyển trang
    if (prevPageBtn) {
        prevPageBtn.removeEventListener('click', handleOrderPrevPage);
        prevPageBtn.addEventListener('click', handleOrderPrevPage);
    }
    
    if (nextPageBtn) {
        nextPageBtn.removeEventListener('click', handleOrderNextPage);
        nextPageBtn.addEventListener('click', handleOrderNextPage);
    }
    
    // Xử lý sự kiện thay đổi số đơn hàng trên trang
    if (itemsPerPageSelect) {
        itemsPerPageSelect.removeEventListener('change', handleOrderItemsPerPageChange);
        itemsPerPageSelect.addEventListener('change', handleOrderItemsPerPageChange);
    }
    
    // Xử lý sự kiện tìm kiếm
    if (searchBtn) {
        searchBtn.removeEventListener('click', handleOrderSearch);
        searchBtn.addEventListener('click', handleOrderSearch);
    }
    
    if (searchInput) {
        searchInput.removeEventListener('keyup', handleOrderSearchInputKeyup);
        searchInput.addEventListener('keyup', handleOrderSearchInputKeyup);
    }
}

// Xử lý sự kiện chuyển đến trang trước
function handleOrderPrevPage() {
    if (currentOrderPage > 1) {
        currentOrderPage--;
        displayOrders();
    }
}

// Xử lý sự kiện chuyển đến trang sau
function handleOrderNextPage() {
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    if (currentOrderPage < totalPages) {
        currentOrderPage++;
        displayOrders();
    }
}

// Xử lý sự kiện thay đổi số đơn hàng trên trang
function handleOrderItemsPerPageChange() {
    ordersPerPage = parseInt(this.value);
    currentOrderPage = 1; // Reset về trang đầu tiên
    displayOrders();
}

// Xử lý sự kiện tìm kiếm
function handleOrderSearch() {
    const searchText = document.getElementById('orderSearchInput').value.trim().toLowerCase();
    filterOrders(searchText);
}

// Xử lý sự kiện nhấn phím trong ô tìm kiếm
function handleOrderSearchInputKeyup(e) {
    if (e.key === 'Enter') {
        handleOrderSearch();
    }
}

// Hàm lọc đơn hàng theo từ khóa tìm kiếm
function filterOrders(searchText) {
    if (!searchText) {
        filteredOrders = [...allOrders]; // Nếu không có từ khóa, hiển thị tất cả
    } else {
        filteredOrders = allOrders.filter(order => {
            const orderId = order.id.toString();
            const customerName = order.shippingInfo?.name || '';
            const orderDate = new Date(order.createdAt).toLocaleDateString('vi-VN');
            const orderTotal = order.total.toString();
            
            return orderId.includes(searchText) || 
                   customerName.toLowerCase().includes(searchText) ||
                   orderDate.includes(searchText) ||
                   orderTotal.includes(searchText);
        });
    }
    
    currentOrderPage = 1; // Reset về trang đầu tiên
    displayOrders();
}

// Hàm hiển thị đơn hàng
function displayOrders() {
    const ordersTableBody = document.querySelector('#orderTable tbody');
    if (!ordersTableBody) {
        console.error('Không tìm thấy bảng hiển thị đơn hàng');
        return;
    }
    
    // Tính toán phân trang
    const startIndex = (currentOrderPage - 1) * ordersPerPage;
    const endIndex = Math.min(startIndex + ordersPerPage, filteredOrders.length);
    const displayedOrders = filteredOrders.slice(startIndex, endIndex);
    
    // Xóa nội dung cũ
    ordersTableBody.innerHTML = '';
    
    // Hiển thị thông báo nếu không có đơn hàng
    if (displayedOrders.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Không tìm thấy đơn hàng nào</td></tr>';
        return;
    }
    
    // Thêm đơn hàng vào bảng
    displayedOrders.forEach(order => {
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
        row.dataset.orderId = order.id;
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.shippingInfo?.name || order.userId ? getUserName(order.userId) : 'Khách vãng lai'}</td>
            <td>${orderDate}</td>
            <td>${orderTotal}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="action-btn view-order" title="Xem chi tiết"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit-order-status" title="Cập nhật trạng thái"><i class="fas fa-edit"></i></button>
            </td>
        `;
        
        ordersTableBody.appendChild(row);
    });
    
    // Cập nhật thông tin phân trang
    updateOrderPagination();
    
    // Gắn sự kiện cho các nút hành động
    attachOrderActionEvents();
}

// Hàm cập nhật thông tin phân trang
function updateOrderPagination() {
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const currentPageEl = document.getElementById('orderCurrentPage');
    const totalPagesEl = document.getElementById('orderTotalPages');
    const prevPageBtn = document.getElementById('orderPrevPage');
    const nextPageBtn = document.getElementById('orderNextPage');
    
    if (currentPageEl) currentPageEl.textContent = currentOrderPage;
    if (totalPagesEl) totalPagesEl.textContent = totalPages;
    
    if (prevPageBtn) prevPageBtn.disabled = currentOrderPage <= 1;
    if (nextPageBtn) nextPageBtn.disabled = currentOrderPage >= totalPages;
}

// Hàm gắn sự kiện cho các nút hành động của đơn hàng
function attachOrderActionEvents() {
    const orderActionBtns = document.querySelectorAll('#orderTable .action-btn');
    
    orderActionBtns.forEach(btn => {
        btn.removeEventListener('click', handleOrderAction);
        btn.addEventListener('click', handleOrderAction);
    });
}

// Hàm xử lý sự kiện nút hành động của đơn hàng
function handleOrderAction(e) {
    const actionBtn = e.currentTarget;
    const orderId = actionBtn.closest('tr').dataset.orderId;
    
    if (actionBtn.classList.contains('view-order')) {
        viewOrderDetails(orderId);
    } else if (actionBtn.classList.contains('edit-order-status')) {
        editOrderStatus(orderId);
    }
}

// Hàm cập nhật trạng thái đơn hàng
function editOrderStatus(orderId) {
    const order = allOrders.find(o => o.id == orderId);
    if (!order) {
        showNotification('error', 'Lỗi', 'Không tìm thấy thông tin đơn hàng');
        return;
    }
    
    // Tạo modal cập nhật trạng thái
    const modal = document.createElement('div');
    modal.className = 'modal order-status-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Cập nhật trạng thái đơn hàng #${order.id}</h2>
            
            <div class="order-basic-info">
                <p><strong>Khách hàng:</strong> ${order.shippingInfo?.name || 'N/A'}</p>
                <p><strong>Ngày đặt:</strong> ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                <p><strong>Tổng tiền:</strong> ${order.total.toLocaleString('vi-VN')}đ</p>
            </div>
            
            <form id="orderStatusForm">
                <div class="form-group">
                    <label for="orderStatus">Trạng thái hiện tại:</label>
                    <input type="text" id="currentStatus" value="${getOrderStatusText(order.status)}" disabled>
                </div>
                
                <div class="form-group">
                    <label for="newStatus">Cập nhật trạng thái:</label>
                    <select id="newStatus" required>
                        <option value="">-- Chọn trạng thái --</option>
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Chờ xử lý</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Đang giao</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Đã hoàn thành</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Đã hủy</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="statusNotes">Ghi chú:</label>
                    <textarea id="statusNotes" rows="3" placeholder="Nhập ghi chú về thay đổi trạng thái..."></textarea>
                </div>
                
                <div class="form-buttons">
                    <button type="button" class="cancel-btn">Hủy</button>
                    <button type="submit" class="save-btn">Cập nhật</button>
                </div>
            </form>
        </div>
    `;
    
    // Thêm CSS cho modal
    const style = document.createElement('style');
    style.textContent = `
        .modal {
            display: block;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            overflow: auto;
        }
        
        .modal-content {
            background-color: #fff;
            margin: 80px auto;
            padding: 25px;
            border-radius: 8px;
            width: 80%;
            max-width: 600px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            position: relative;
        }
        
        .close {
            position: absolute;
            top: 15px;
            right: 15px;
            font-size: 28px;
            color: #999;
            cursor: pointer;
        }
        
        .close:hover {
            color: #333;
        }
        
        .order-basic-info {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
        }
        
        .order-basic-info p {
            margin: 5px 0;
            font-size: 14px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        
        .form-group input[type="text"],
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        
        .form-group input[disabled] {
            background-color: #f9f9f9;
            color: #666;
        }
        
        .form-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        
        .cancel-btn,
        .save-btn {
            padding: 10px 20px;
            border-radius: 4px;
            font-weight: bold;
            cursor: pointer;
        }
        
        .cancel-btn {
            background-color: #f5f5f5;
            color: #333;
            border: 1px solid #ddd;
        }
        
        .save-btn {
            background-color: #2196F3;
            color: white;
            border: none;
        }
        
        .cancel-btn:hover {
            background-color: #e0e0e0;
        }
        
        .save-btn:hover {
            background-color: #0d8bf0;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Xử lý sự kiện đóng modal
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = modal.querySelector('.cancel-btn');
    
    const closeModal = () => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Đóng modal khi click bên ngoài
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Xử lý sự kiện submit form
    const orderStatusForm = document.getElementById('orderStatusForm');
    orderStatusForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newStatus = document.getElementById('newStatus').value;
        const statusNotes = document.getElementById('statusNotes').value.trim();
        
        if (!newStatus) {
            showNotification('error', 'Lỗi', 'Vui lòng chọn trạng thái mới');
            return;
        }
        
        // Cập nhật trạng thái
        order.status = newStatus;
        
        // Lưu vào localStorage
        localStorage.setItem('orders', JSON.stringify(allOrders));
        
        // Cập nhật danh sách hiển thị
        displayOrders();
        
        // Đóng modal
        closeModal();

// Hiển thị thông báo
        showNotification('success', 'Thành công', `Đã cập nhật trạng thái đơn hàng #${order.id}`);
    });
}

// Hàm lấy text hiển thị cho trạng thái đơn hàng
function getOrderStatusText(status) {
    switch (status) {
        case 'pending': return 'Chờ xử lý';
        case 'processing': return 'Đang giao';
        case 'completed': return 'Đã hoàn thành';
        case 'cancelled': return 'Đã hủy';
        default: return status || 'N/A';
    }
}

// === THÊM: Biến và hằng số cho quản lý sản phẩm ===
let currentProductPage = 1;
let productsPerPage = 10;
let allProducts = [];
let filteredProducts = [];

// Hàm tải danh sách sản phẩm
function loadProducts() {
    console.log('Đang tải danh sách sản phẩm...');
    
    // Khởi tạo các sự kiện cho trang sản phẩm nếu chưa được khởi tạo
    initProductsEvents();
    
    // Lấy dữ liệu sách từ localStorage
    allProducts = JSON.parse(localStorage.getItem('books') || '[]');
    filteredProducts = [...allProducts]; // Ban đầu hiển thị tất cả sản phẩm
    
    // Nếu chưa có dữ liệu sách, khởi tạo dữ liệu mẫu
    if (allProducts.length === 0) {
        initBooksData();
        allProducts = JSON.parse(localStorage.getItem('books') || '[]');
        filteredProducts = [...allProducts];
    }
    
    // Hiển thị sản phẩm
    displayProducts();
}

// Hàm khởi tạo dữ liệu sách mẫu
function initBooksData() {
    console.log('Chưa có dữ liệu sách, đang khởi tạo...');
    const sampleBooks = [
        {
            id: 1,
            title: "Đắc Nhân Tâm",
            author: "Dale Carnegie",
            price: 69000,
            originalPrice: 85000,
            discountPercent: 20,
            image: "images/books/sach1.jpg",
            categoryId: 1,
            publisher: "NXB Tổng Hợp",
            year: 2021,
            pages: 320,
            language: "Tiếng Việt",
            isbn: "978-604-59-4359-0",
            size: "14.5 x 20.5 cm",
            description: "Đắc Nhân Tâm là cuốn sách nổi tiếng nhất...",
            stock: 50
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
            title: "C++ Programming",
            author: "Bjarne Stroustrup",
            price: 220000,
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
    ];
    
    // Khởi tạo danh mục nếu chưa có
    if (!localStorage.getItem('categories')) {
        const sampleCategories = [
            { id: 1, name: "Sách Triết Lý" },
            { id: 2, name: "Sách Lập Trình" },
            { id: 3, name: "Sách Kinh Tế" }
        ];
        localStorage.setItem('categories', JSON.stringify(sampleCategories));
    }
    
    localStorage.setItem('books', JSON.stringify(sampleBooks));
    console.log('Đã khởi tạo dữ liệu sách mẫu.');
}

// Hàm khởi tạo các sự kiện cho trang sản phẩm
function initProductsEvents() {
    // Lấy các phần tử
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    const searchInput = document.getElementById('productSearchInput');
    const searchBtn = document.getElementById('productSearchBtn');
    
    // Xử lý sự kiện chuyển trang
    if (prevPageBtn) {
        prevPageBtn.removeEventListener('click', handlePrevPage);
        prevPageBtn.addEventListener('click', handlePrevPage);
    }
    
    if (nextPageBtn) {
        nextPageBtn.removeEventListener('click', handleNextPage);
        nextPageBtn.addEventListener('click', handleNextPage);
    }
    
    // Xử lý sự kiện thay đổi số sản phẩm trên trang
    if (itemsPerPageSelect) {
        itemsPerPageSelect.removeEventListener('change', handleItemsPerPageChange);
        itemsPerPageSelect.addEventListener('change', handleItemsPerPageChange);
    }
    
    // Xử lý sự kiện tìm kiếm
    if (searchBtn) {
        searchBtn.removeEventListener('click', handleProductSearch);
        searchBtn.addEventListener('click', handleProductSearch);
    }
    
    if (searchInput) {
        searchInput.removeEventListener('keyup', handleSearchInputKeyup);
        searchInput.addEventListener('keyup', handleSearchInputKeyup);
    }
}

// Xử lý sự kiện chuyển đến trang trước
function handlePrevPage() {
    if (currentProductPage > 1) {
        currentProductPage--;
        displayProducts();
    }
}

// Xử lý sự kiện chuyển đến trang sau
function handleNextPage() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (currentProductPage < totalPages) {
        currentProductPage++;
        displayProducts();
    }
}

// Xử lý sự kiện thay đổi số sản phẩm trên trang
function handleItemsPerPageChange() {
    productsPerPage = parseInt(this.value);
    currentProductPage = 1; // Reset về trang đầu tiên
    displayProducts();
}

// Xử lý sự kiện tìm kiếm
function handleProductSearch() {
    const searchText = document.getElementById('productSearchInput').value.trim().toLowerCase();
    filterProducts(searchText);
}

// Xử lý sự kiện nhấn phím trong ô tìm kiếm
function handleSearchInputKeyup(e) {
    if (e.key === 'Enter') {
        handleProductSearch();
    }
}

// Hàm lọc sản phẩm theo từ khóa tìm kiếm
function filterProducts(searchText) {
    if (!searchText) {
        filteredProducts = [...allProducts]; // Nếu không có từ khóa, hiển thị tất cả
    } else {
        filteredProducts = allProducts.filter(product => 
            product.title.toLowerCase().includes(searchText) || 
            product.author.toLowerCase().includes(searchText) ||
            (product.description && product.description.toLowerCase().includes(searchText))
        );
    }
    
    currentProductPage = 1; // Reset về trang đầu tiên
    displayProducts();
}

// Hàm hiển thị sản phẩm
function displayProducts() {
    const productsTableBody = document.querySelector('#productsTable tbody');
    if (!productsTableBody) {
        console.error('Không tìm thấy bảng hiển thị sản phẩm');
        return;
    }
    
    // Thêm CSS cho thumbnail sản phẩm nếu chưa có
    if (!document.getElementById('products-table-style')) {
        const style = document.createElement('style');
        style.id = 'products-table-style';
        style.textContent = `
            .product-thumbnail {
                width: 50px;
                height: 70px;
                object-fit: cover;
                border-radius: 4px;
                border: 1px solid #eee;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            #productsTable td {
                vertical-align: middle;
            }
            
            .text-center {
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Lấy danh mục để hiển thị tên
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    
    // Tính toán phân trang
    const startIndex = (currentProductPage - 1) * productsPerPage;
    const endIndex = Math.min(startIndex + productsPerPage, filteredProducts.length);
    const displayedProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Xóa nội dung cũ
    productsTableBody.innerHTML = '';
    
    // Hiển thị thông báo nếu không có sản phẩm
    if (displayedProducts.length === 0) {
        productsTableBody.innerHTML = '<tr><td colspan="10" class="text-center">Không tìm thấy sản phẩm nào</td></tr>';
        return;
    }
    
    // Thêm sản phẩm vào bảng
    displayedProducts.forEach(product => {
        const category = categories.find(cat => cat.id === product.categoryId);
        const categoryName = category ? category.name : 'Chưa phân loại';
        
        const row = document.createElement('tr');
        row.dataset.productId = product.id;
        row.innerHTML = `
            <td>${product.id}</td>
            <td><img src="${product.image || 'images/books/default-book.png'}" alt="${product.title}" class="product-thumbnail" onerror="this.src='images/books/default-book.png'"></td>
            <td>${product.title}</td>
            <td>${product.author}</td>
            <td>${categoryName}</td>
            <td>${product.originalPrice ? product.originalPrice.toLocaleString('vi-VN') + 'đ' : 'N/A'}</td>
            <td>${product.discountPercent || 0}%</td>
            <td>${product.price ? product.price.toLocaleString('vi-VN') + 'đ' : 'N/A'}</td>
            <td>${product.stock || 0}</td>
            <td>
                <button class="action-btn view-product" title="Xem chi tiết"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit-stock" title="Cập nhật tồn kho"><i class="fas fa-edit"></i></button>
            </td>
        `;
        
        productsTableBody.appendChild(row);
    });
    
    // Cập nhật thông tin phân trang
    updatePagination();
    
    // Gắn sự kiện cho các nút hành động
    attachProductActionEvents();
}

// Hàm cập nhật thông tin phân trang
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const currentPageEl = document.getElementById('currentPage');
    const totalPagesEl = document.getElementById('totalPages');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    
    if (currentPageEl) currentPageEl.textContent = currentProductPage;
    if (totalPagesEl) totalPagesEl.textContent = totalPages;
    
    if (prevPageBtn) prevPageBtn.disabled = currentProductPage <= 1;
    if (nextPageBtn) nextPageBtn.disabled = currentProductPage >= totalPages;
}

// Hàm gắn sự kiện cho các nút hành động của sản phẩm
function attachProductActionEvents() {
    const productActionBtns = document.querySelectorAll('#productsTable .action-btn');
    
    productActionBtns.forEach(btn => {
        btn.removeEventListener('click', handleProductAction);
        btn.addEventListener('click', handleProductAction);
    });
}

// Hàm xử lý sự kiện nút hành động của sản phẩm
function handleProductAction(e) {
    const actionBtn = e.currentTarget;
    const productId = actionBtn.closest('tr').dataset.productId;
    
    if (actionBtn.classList.contains('view-product')) {
        viewProductDetails(productId);
    } else if (actionBtn.classList.contains('edit-stock')) {
        editProductStock(productId);
    }
}

// Hàm xem chi tiết sản phẩm
function viewProductDetails(productId) {
    const product = allProducts.find(p => p.id == productId);
    if (!product) {
        showNotification('error', 'Lỗi', 'Không tìm thấy thông tin sản phẩm');
        return;
    }
    
    // Lấy tên danh mục
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    const category = categories.find(cat => cat.id === product.categoryId);
    const categoryName = category ? category.name : 'Chưa phân loại';
    
    // Tạo modal xem chi tiết
    const modal = document.createElement('div');
    modal.className = 'modal product-detail-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Chi tiết sản phẩm</h2>
            
            <div class="product-detail">
                <div class="product-image">
                    <img src="${product.image || 'images/books/default-book.png'}" alt="${product.title}" onerror="this.src='images/books/default-book.png'">
                </div>
                
                <div class="product-info">
                    <h3>${product.title}</h3>
                    <p class="author"><strong>Tác giả:</strong> ${product.author}</p>
                    <p class="category"><strong>Danh mục:</strong> ${categoryName}</p>
                    <p class="publisher"><strong>Nhà xuất bản:</strong> ${product.publisher || 'N/A'}</p>
                    <p class="language"><strong>Ngôn ngữ:</strong> ${product.language || 'N/A'}</p>
                    <p class="year"><strong>Năm xuất bản:</strong> ${product.year || 'N/A'}</p>
                    <p class="pages"><strong>Số trang:</strong> ${product.pages || 'N/A'}</p>
                    <p class="size"><strong>Kích thước:</strong> ${product.size || 'N/A'}</p>
                    <p class="isbn"><strong>ISBN:</strong> ${product.isbn || 'N/A'}</p>
                    
                    <div class="price-info">
                        <p class="original-price"><strong>Giá gốc:</strong> ${product.originalPrice ? product.originalPrice.toLocaleString('vi-VN') + 'đ' : 'N/A'}</p>
                        <p class="discount"><strong>Giảm giá:</strong> ${product.discountPercent || 0}%</p>
                        <p class="price"><strong>Giá bán:</strong> ${product.price ? product.price.toLocaleString('vi-VN') + 'đ' : 'N/A'}</p>
                    </div>
                    
                    <p class="stock"><strong>Tồn kho:</strong> ${product.stock || 0}</p>
                </div>
            </div>
            
            <div class="product-description">
                <h4>Mô tả sản phẩm</h4>
                <p>${product.description || 'Không có thông tin mô tả.'}</p>
            </div>
        </div>
    `;
    
    // Thêm CSS cho modal
    const style = document.createElement('style');
    style.textContent = `
        .modal {
            display: block;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            overflow: auto;
        }
        
        .modal-content {
            background-color: #fff;
            margin: 50px auto;
            padding: 25px;
            border-radius: 8px;
            width: 80%;
            max-width: 900px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            position: relative;
        }
        
        .close {
            position: absolute;
            top: 15px;
            right: 15px;
            font-size: 28px;
            color: #999;
            cursor: pointer;
        }
        
        .close:hover {
            color: #333;
        }
        
        .product-detail {
            display: flex;
            margin: 20px 0;
        }
        
        .product-image {
            flex: 0 0 300px;
            margin-right: 30px;
        }
        
        .product-image img {
            width: 100%;
            max-height: 400px;
            object-fit: contain;
            border: 1px solid #eee;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .product-info {
            flex: 1;
        }
        
        .product-info h3 {
            margin-top: 0;
            color: #2196F3;
            font-size: 24px;
            margin-bottom: 15px;
        }
        
        .product-info p {
            margin: 8px 0;
            line-height: 1.6;
        }
        
        .price-info {
            margin: 15px 0;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
        }
        
        .price {
            font-weight: bold;
            color: #e83e8c;
            font-size: 18px;
        }
        
        .product-description {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        
        .product-description h4 {
            margin-top: 0;
            margin-bottom: 15px;
            color: #333;
        }
        
        .product-description p {
            line-height: 1.6;
            text-align: justify;
        }
        
        @media (max-width: 768px) {
            .product-detail {
                flex-direction: column;
            }
            
            .product-image {
                margin-right: 0;
                margin-bottom: 20px;
                flex: 1;
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Xử lý sự kiện đóng modal
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
    });
    
    // Đóng modal khi click bên ngoài
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        }
    });
}

// Hàm cập nhật tồn kho sản phẩm
function editProductStock(productId) {
    const product = allProducts.find(p => p.id == productId);
    if (!product) {
        showNotification('error', 'Lỗi', 'Không tìm thấy thông tin sản phẩm');
        return;
    }
    
    // Tạo modal cập nhật tồn kho
    const modal = document.createElement('div');
    modal.className = 'modal stock-update-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Cập nhật tồn kho</h2>
            
            <div class="product-basic-info">
                <img src="${product.image || 'images/books/default-book.png'}" alt="${product.title}" onerror="this.src='images/books/default-book.png'">
                <div>
                    <h3>${product.title}</h3>
                    <p>Tác giả: ${product.author}</p>
                    <p>Giá bán: ${product.price ? product.price.toLocaleString('vi-VN') + 'đ' : 'N/A'}</p>
                </div>
            </div>
            
            <form id="stockUpdateForm">
                <div class="form-group">
                    <label for="currentStock">Tồn kho hiện tại:</label>
                    <input type="text" id="currentStock" value="${product.stock || 0}" disabled>
                </div>
                
                <div class="form-group">
                    <label for="stockChange">Thay đổi:</label>
                    <div class="stock-change-controls">
                        <button type="button" class="btn-decrease"><i class="fas fa-minus"></i></button>
                        <input type="number" id="stockChange" value="0" min="-${product.stock || 0}">
                        <button type="button" class="btn-increase"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="stockNotes">Ghi chú:</label>
                    <textarea id="stockNotes" rows="3" placeholder="Nhập ghi chú về thay đổi tồn kho..."></textarea>
                </div>
                
                <div class="form-buttons">
                    <button type="button" class="cancel-btn">Hủy</button>
                    <button type="submit" class="save-btn">Cập nhật</button>
                </div>
            </form>
        </div>
    `;
    
    // Thêm CSS cho modal
    const style = document.createElement('style');
    style.textContent = `
        .modal {
            display: block;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            overflow: auto;
        }
        
        .modal-content {
            background-color: #fff;
            margin: 80px auto;
            padding: 25px;
            border-radius: 8px;
            width: 80%;
            max-width: 600px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            position: relative;
        }
        
        .close {
            position: absolute;
            top: 15px;
            right: 15px;
            font-size: 28px;
            color: #999;
            cursor: pointer;
        }
        
        .close:hover {
            color: #333;
        }
        
        .product-basic-info {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
        }
        
        .product-basic-info img {
            width: 80px;
            height: 100px;
            object-fit: cover;
            margin-right: 15px;
            border-radius: 4px;
        }
        
        .product-basic-info h3 {
            margin: 0 0 5px 0;
            font-size: 18px;
            color: #2196F3;
        }
        
        .product-basic-info p {
            margin: 3px 0;
            font-size: 14px;
            color: #666;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        
        .form-group input[type="text"],
        .form-group input[type="number"],
        .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        
        .form-group input[disabled] {
            background-color: #f9f9f9;
            color: #666;
        }
        
        .stock-change-controls {
            display: flex;
            align-items: center;
        }
        
        .btn-decrease,
        .btn-increase {
            width: 40px;
            height: 40px;
            border: 1px solid #ddd;
            background-color: #f5f5f5;
            color: #333;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }
        
        .btn-decrease {
            border-radius: 4px 0 0 4px;
        }
        
        .btn-increase {
            border-radius: 0 4px 4px 0;
        }
        
        .btn-decrease:hover,
        .btn-increase:hover {
            background-color: #e0e0e0;
        }
        
        .stock-change-controls input {
            width: 80px;
            text-align: center;
            border-left: none;
            border-right: none;
            border-radius: 0;
        }
        
        .form-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        
        .cancel-btn,
        .save-btn {
            padding: 10px 20px;
            border-radius: 4px;
            font-weight: bold;
            cursor: pointer;
        }
        
        .cancel-btn {
            background-color: #f5f5f5;
            color: #333;
            border: 1px solid #ddd;
        }
        
        .save-btn {
            background-color: #2196F3;
            color: white;
            border: none;
        }
        
        .cancel-btn:hover {
            background-color: #e0e0e0;
        }
        
        .save-btn:hover {
            background-color: #0d8bf0;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Xử lý sự kiện đóng modal
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = modal.querySelector('.cancel-btn');
    
    const closeModal = () => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Đóng modal khi click bên ngoài
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Xử lý sự kiện tăng/giảm số lượng
    const decreaseBtn = modal.querySelector('.btn-decrease');
    const increaseBtn = modal.querySelector('.btn-increase');
    const stockChangeInput = document.getElementById('stockChange');
    
    decreaseBtn.addEventListener('click', () => {
        let value = parseInt(stockChangeInput.value) || 0;
        if (value > -product.stock) {
            value--;
            stockChangeInput.value = value;
        }
    });
    
    increaseBtn.addEventListener('click', () => {
        let value = parseInt(stockChangeInput.value) || 0;
        value++;
        stockChangeInput.value = value;
    });
    
    // Xử lý sự kiện submit form
    const stockUpdateForm = document.getElementById('stockUpdateForm');
    stockUpdateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const stockChange = parseInt(stockChangeInput.value) || 0;
        const stockNotes = document.getElementById('stockNotes').value.trim();
        
        // Cập nhật tồn kho
        const newStock = (product.stock || 0) + stockChange;
        
        if (newStock < 0) {
            showNotification('error', 'Lỗi', 'Tồn kho không thể âm');
            return;
        }
        
        // Cập nhật dữ liệu
        product.stock = newStock;
        
        // Lưu vào localStorage
        localStorage.setItem('books', JSON.stringify(allProducts));
        
        // Cập nhật danh sách hiển thị
        displayProducts();
        
        // Đóng modal
        closeModal();
        
        // Hiển thị thông báo
        showNotification('success', 'Thành công', `Đã cập nhật tồn kho sách "${product.title}"`);
    });
}

// === THÊM: Hàm hiển thị thông báo ===
function showNotification(type, title, message) {
    // Tạo phần tử thông báo
    const notification = document.createElement('div');
    notification.className = `notification-popup ${type}`;
    
    // Tạo nội dung thông báo
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : (type === 'info' ? 'info-circle' : 'exclamation-circle')}"></i>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <div class="notification-progress">
            <div class="notification-progress-bar"></div>
        </div>
    `;
    
    // Thêm CSS cho thông báo nếu chưa có
    if (!document.getElementById('notification-style')) {
        const style = document.createElement('style');
        style.id = 'notification-style';
        style.textContent = `
            .notification-popup {
                position: fixed;
                top: 20px;
                right: 20px;
                min-width: 300px;
                max-width: 400px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                padding: 15px;
                z-index: 9999;
                animation: slideIn 0.3s ease-out;
                overflow: hidden;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            .notification-popup i {
                font-size: 24px;
                margin-right: 15px;
            }
            
            .notification-popup.success i {
                color: #4CAF50;
            }
            
            .notification-popup.error i {
                color: #f44336;
            }
            
            .notification-popup.info i {
                color: #2196F3;
            }
            
            .notification-content {
                flex: 1;
            }
            
            .notification-title {
                font-weight: bold;
                margin-bottom: 5px;
                color: #333;
            }
            
            .notification-message {
                color: #666;
                font-size: 14px;
            }
            
            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: #eee;
            }
            
            .notification-progress-bar {
                height: 100%;
                background: #2196F3;
                width: 100%;
                animation: progress 3s linear;
            }
            
            @keyframes progress {
                from { width: 100%; }
                to { width: 0%; }
            }
            
            .notification-popup.slideOut {
                animation: slideOut 0.3s ease-out forwards;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Thêm thông báo vào body
    document.body.appendChild(notification);
    
    // Tự động đóng thông báo sau 3 giây
    setTimeout(() => {
        notification.classList.add('slideOut');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// === THÊM: Hàm lấy tên khách hàng ===
function getUserName(userId) {
    // Lấy danh sách người dùng từ localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Tìm người dùng theo ID
    const user = users.find(u => u.id == userId);
    
    // Trả về tên người dùng nếu tìm thấy, ngược lại trả về 'Khách vãng lai'
    return user ? user.fullName : 'Khách vãng lai';
}

// Hàm nạp đơn hàng cần xử lý
function loadPendingOrders() {
    try {
        // Lấy đơn hàng từ localStorage
        const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        
        // Lọc đơn hàng có trạng thái 'pending' và sắp xếp theo thời gian mới nhất
        const pendingOrders = allOrders
            .filter(order => order.status === 'pending')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        const ordersTableBody = document.querySelector('#dashboard-section .data-table tbody');
        ordersTableBody.innerHTML = ''; // Xóa dữ liệu cũ

        if (pendingOrders.length === 0) {
            ordersTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Không có đơn hàng nào cần xử lý</td></tr>';
            return;
        }

        for (const order of pendingOrders) {
            const orderDate = new Date(order.createdAt).toLocaleDateString('vi-VN');
            const customerName = getUserName(order.userId);
            
            // Lấy danh sách sản phẩm
            const productList = order.items.map(item => {
                const book = allProducts.find(b => b.id == item.bookId);
                return `${book ? book.title : 'Sản phẩm không tồn tại'} x${item.quantity}`;
            }).join(', ');
            
            const row = `
                <tr>
                    <td>#${order.id}</td>
                    <td>${customerName}</td>
                    <td>${productList}</td>
                    <td>${order.total.toLocaleString('vi-VN')}đ</td>
                    <td><span class="status-badge pending">Chờ xử lý</span></td>
                    <td>
                        <button class="action-btn view-order" data-order-id="${order.id}" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn process-order" data-order-id="${order.id}" title="Xử lý đơn hàng">
                            <i class="fas fa-check"></i>
                        </button>
                    </td>
                </tr>
            `;
            ordersTableBody.insertAdjacentHTML('beforeend', row);
        }

        // Thêm event listeners cho các nút
        document.querySelectorAll('.view-order').forEach(button => {
            button.addEventListener('click', () => viewOrderDetails(button.dataset.orderId));
        });

        document.querySelectorAll('.process-order').forEach(button => {
            button.addEventListener('click', () => processOrder(button.dataset.orderId));
        });

    } catch (error) {
        console.error("Error loading pending orders:", error);
        showNotification('error', 'Lỗi', 'Không thể tải danh sách đơn hàng');
    }
}

// Thêm vào phần khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', async () => {
    // ... existing code ...
    
    // Nạp đơn hàng cần xử lý
    await loadPendingOrders();
    
    // ... existing code ...
});