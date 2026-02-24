document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo dữ liệu mẫu nếu chưa có đơn hàng
    initializeSampleOrders();

    // Kiểm tra đăng nhập
    const user = JSON.parse(localStorage.getItem('loginUser') || sessionStorage.getItem('loginUser'));
    if (!user) {
        showNotification('Vui lòng đăng nhập để xem đơn hàng!', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }

    // Lấy các phần tử DOM
    const ordersList = document.getElementById('ordersList');
    const historyList = document.getElementById('historyList');
    const noOrders = document.getElementById('noOrders');
    const statusFilter = document.getElementById('statusFilter');
    const timeFilter = document.getElementById('timeFilter');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const modal = document.getElementById('cancelOrderModal');
    const closeButtons = document.querySelectorAll('.close-modal');
    const cancelReasonSelect = document.getElementById('cancelReason');
    const otherReasonGroup = document.getElementById('otherReasonGroup');
    const confirmCancelBtn = document.getElementById('confirmCancel');

    let currentOrderId = null;

    // Lấy và hiển thị đơn hàng
    loadAndDisplayOrders();

    // Xử lý sự kiện
    statusFilter.addEventListener('change', loadAndDisplayOrders);
    timeFilter.addEventListener('change', loadAndDisplayOrders);
    
    // Xử lý tabs
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId === 'current' ? 'currentOrders' : 'orderHistory').classList.add('active');
            
            loadAndDisplayOrders();
        });
    });

    // Xử lý modal hủy đơn
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    cancelReasonSelect.addEventListener('change', () => {
        otherReasonGroup.style.display = 
            cancelReasonSelect.value === 'other' ? 'block' : 'none';
    });

    confirmCancelBtn.addEventListener('click', handleConfirmCancel);

    function loadAndDisplayOrders() {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const currentOrders = orders.filter(order => 
            order.status === 'pending' || 
            order.status === 'confirmed' || 
            order.status === 'shipping'
        );

        const orderHistory = orders.filter(order => 
            order.status === 'delivered' || 
            order.status === 'cancelled'
        );

        const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
        const ordersToDisplay = activeTab === 'current' ? currentOrders : orderHistory;
        
        filterAndDisplayOrders(ordersToDisplay);
    }

    function filterAndDisplayOrders(orders) {
        const status = statusFilter.value;
        const time = timeFilter.value;
        let filteredOrders = [...orders];

        if (status !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.status === status);
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (time) {
            case 'today':
                filteredOrders = filteredOrders.filter(order => 
                    new Date(order.createdAt) >= today
                );
                break;
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                filteredOrders = filteredOrders.filter(order => 
                    new Date(order.createdAt) >= weekAgo
                );
                break;
            case 'month':
                const monthAgo = new Date(today);
                monthAgo.setDate(monthAgo.getDate() - 30);
                filteredOrders = filteredOrders.filter(order => 
                    new Date(order.createdAt) >= monthAgo
                );
                break;
            case 'year':
                const yearAgo = new Date(today);
                yearAgo.setDate(yearAgo.getDate() - 365);
                filteredOrders = filteredOrders.filter(order => 
                    new Date(order.createdAt) >= yearAgo
                );
                break;
        }

        displayOrders(filteredOrders);
    }

    function displayOrders(orders) {
        const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
        const container = activeTab === 'current' ? ordersList : historyList;

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="no-orders-message">
                    <i class="fas fa-box-open"></i>
                    <p>Không có đơn hàng nào</p>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">Mã đơn hàng: ${order.id}</span>
                    <span class="order-date">${formatDate(order.createdAt)}</span>
                    <span class="order-status status-${order.status}">${getStatusText(order.status)}</span>
                </div>

                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <img src="${item.image}" alt="${item.title}">
                            <div class="item-details">
                                <h4>${item.title}</h4>
                                <p class="author">${item.author}</p>
                                <p class="quantity">Số lượng: ${item.quantity}</p>
                            </div>
                            <div class="item-price">${formatCurrency(item.price * item.quantity)}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="order-summary">
                    <div class="order-total">
                        Tổng cộng: ${formatCurrency(order.total)}
                    </div>
                    <div class="order-actions">
                        <button class="view-detail-btn" onclick="viewOrderDetail('${order.id}')">
                            <i class="fas fa-eye"></i> Xem chi tiết
                        </button>
                        ${order.status === 'pending' ? `
                            <button class="cancel-order-btn" onclick="handleCancelOrder('${order.id}')">
                                <i class="fas fa-times"></i> Hủy đơn
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Đặt các hàm xử lý vào window để có thể gọi từ onclick
    window.handleCancelOrder = function(orderId) {
        currentOrderId = orderId;
        
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const order = orders.find(o => o.id === orderId);
        
        if (!order) {
            showNotification('Không tìm thấy đơn hàng!', 'error');
            return;
        }

        document.getElementById('cancelOrderId').textContent = order.id;
        document.getElementById('cancelOrderDate').textContent = formatDate(order.createdAt);
        
        cancelReasonSelect.value = '';
        document.getElementById('otherReason').value = '';
        otherReasonGroup.style.display = 'none';

        modal.classList.add('show');
    };

    function handleConfirmCancel() {
        const reason = cancelReasonSelect.value;
        if (!reason) {
            showNotification('Vui lòng chọn lý do hủy đơn!', 'error');
            return;
        }

        const cancelReason = reason === 'other' 
            ? document.getElementById('otherReason').value.trim()
            : cancelReasonSelect.options[cancelReasonSelect.selectedIndex].text;

        if (reason === 'other' && !cancelReason) {
            showNotification('Vui lòng nhập lý do hủy đơn!', 'error');
            return;
        }

        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const orderIndex = orders.findIndex(order => order.id === currentOrderId);

        if (orderIndex === -1) {
            showNotification('Không tìm thấy đơn hàng!', 'error');
            return;
        }

        orders[orderIndex].status = 'cancelled';
        orders[orderIndex].cancelReason = cancelReason;
        orders[orderIndex].cancelledAt = new Date().toISOString();

        localStorage.setItem('orders', JSON.stringify(orders));

        modal.classList.remove('show');
        showNotification('Đã hủy đơn hàng thành công!', 'success');

        loadAndDisplayOrders();
    }
});

// Các hàm tiện ích
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xác nhận',
        'confirmed': 'Đã xác nhận',
        'shipping': 'Đang giao',
        'delivered': 'Đã giao',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}

function viewOrderDetail(orderId) {
    window.location.href = `order-detail.html?id=${orderId}`;
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Khởi tạo dữ liệu mẫu cho đơn hàng
function initializeSampleOrders() {
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Chỉ thêm dữ liệu mẫu nếu chưa có đơn hàng
    if (orders.length === 0) {
        const sampleOrders = [
            {
                id: 'ORD123456ABC',
                items: [
                    {
                        id: 1,
                        title: 'Đắc Nhân Tâm',
                        author: 'Dale Carnegie',
                        image: 'images/books/sach1.jpg',
                        price: 69000,
                        quantity: 2,
                        subtotal: 138000
                    }
                ],
                shippingInfo: {
                    fullName: 'Nguyễn Văn A',
                    phone: '0123456789',
                    email: 'nguyenvana@email.com',
                    address: '123 Đường ABC, Quận 1, TP.HCM',
                    note: 'Giao giờ hành chính'
                },
                paymentMethod: 'cod',
                subtotal: 138000,
                shipping: 30000,
                total: 168000,
                status: 'pending',
                createdAt: new Date().toISOString()
            },
            {
                id: 'ORD789012XYZ',
                items: [
                    {
                        id: 2,
                        title: 'Nhà Giả Kim',
                        author: 'Paulo Coelho',
                        image: 'images/books/sach2.jpg',
                        price: 86000,
                        quantity: 1,
                        subtotal: 86000
                    },
                    {
                        id: 3,
                        title: 'Java Programming',
                        author: 'Oracle Press',
                        image: 'images/books/sach3.jpg',
                        price: 250000,
                        quantity: 1,
                        subtotal: 250000
                    }
                ],
                shippingInfo: {
                    fullName: 'Trần Thị B',
                    phone: '0987654321',
                    email: 'tranthib@email.com',
                    address: '456 Đường XYZ, Quận 2, TP.HCM',
                    note: 'Gọi trước khi giao'
                },
                paymentMethod: 'banking',
                subtotal: 336000,
                shipping: 30000,
                total: 366000,
                status: 'confirmed',
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 ngày trước
            },
            {
                id: 'ORD345678DEF',
                items: [
                    {
                        id: 1,
                        title: 'Đắc Nhân Tâm',
                        author: 'Dale Carnegie',
                        image: 'images/books/sach1.jpg',
                        price: 69000,
                        quantity: 1,
                        subtotal: 69000
                    }
                ],
                shippingInfo: {
                    fullName: 'Lê Văn C',
                    phone: '0369852147',
                    email: 'levanc@email.com',
                    address: '789 Đường DEF, Quận 3, TP.HCM',
                    note: ''
                },
                paymentMethod: 'cod',
                subtotal: 69000,
                shipping: 30000,
                total: 99000,
                status: 'delivered',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 ngày trước
            }
        ];

        orders = [...orders, ...sampleOrders];
        localStorage.setItem('orders', JSON.stringify(orders));
        console.log('Đã thêm dữ liệu mẫu cho đơn hàng:', sampleOrders);
    }
} 