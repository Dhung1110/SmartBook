document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra đăng nhập
    const user = JSON.parse(localStorage.getItem('loginUser') || sessionStorage.getItem('loginUser'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Lấy ID đơn hàng từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    
    if (!orderId) {
        window.location.href = 'customer-dashboard.html';
        return;
    }

    // Lấy thông tin đơn hàng từ localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);

    if (!order) {
        window.location.href = 'customer-dashboard.html';
        return;
    }

    // Hiển thị thông tin đơn hàng
    displayOrderInfo(order);
    displayOrderProgress(order.status);
    displayShippingInfo(order.shippingInfo);
    displayPaymentInfo(order.paymentMethod);
    displayOrderItems(order.items);
    displayOrderSummary(order);

    // Xử lý nút xem hóa đơn
    const invoiceBtn = document.getElementById('viewInvoice');
    if (invoiceBtn) {
        invoiceBtn.onclick = function() {
            alert('Tính năng xem hóa đơn đang được phát triển');
        };
    }

    // Thêm biến modal
    const modal = document.getElementById('cancelOrderModal');
    const closeButtons = document.querySelectorAll('.close-modal');
    const cancelReasonSelect = document.getElementById('cancelReason');
    const otherReasonGroup = document.getElementById('otherReasonGroup');
    const confirmCancelBtn = document.getElementById('confirmCancel');

    // Xử lý đóng modal
    if (closeButtons) {
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (modal) {
                    modal.classList.remove('show');
                    
                }
            });
        });
    }

    // Xử lý click ngoài modal để đóng
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    // Xử lý hiển thị input lý do khác
    if (cancelReasonSelect) {
        cancelReasonSelect.addEventListener('change', () => {
            if (otherReasonGroup) {
                otherReasonGroup.style.display = 
                    cancelReasonSelect.value === 'other' ? 'block' : 'none';
            }
        });
    }

    

            // Chuyển về trang danh sách đơn hàng sau 1.5 giây
           
        });
    


function displayOrderInfo(order) {
    document.getElementById('orderId').textContent = `Mã đơn hàng: ${order.id}`;
    document.getElementById('orderDate').textContent = `Ngày đặt: ${new Date(order.createdAt).toLocaleDateString('vi-VN')}`;
    
    const statusBadge = document.querySelector('.status-badge');
    statusBadge.textContent = getStatusText(order.status);
    statusBadge.className = `status-badge ${order.status}`;
}

function displayOrderProgress(status) {
    const steps = ['pending', 'confirmed', 'shipping', 'delivered'];
    const currentIndex = steps.indexOf(status);
    
    steps.forEach((step, index) => {
        const stepElement = document.querySelector(`.progress-step[data-step="${step}"]`);
        if (index < currentIndex) {
            stepElement.classList.add('completed');
        } else if (index === currentIndex) {
            stepElement.classList.add('active');
        }
    });
}

function displayShippingInfo(shippingInfo) {
    const container = document.getElementById('shippingInfo');
    container.innerHTML = `
        <p><strong>Người nhận:</strong> ${shippingInfo.fullName}</p>
        <p><strong>Số điện thoại:</strong> ${shippingInfo.phone}</p>
        <p><strong>Email:</strong> ${shippingInfo.email}</p>
        <p><strong>Địa chỉ:</strong> ${shippingInfo.address}</p>
        ${shippingInfo.note ? `<p><strong>Ghi chú:</strong> ${shippingInfo.note}</p>` : ''}
    `;
}

function displayPaymentInfo(paymentMethod) {
    const container = document.getElementById('paymentInfo');
    const paymentText = paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Thanh toán trực tuyến';
    const paymentIcon = paymentMethod === 'cod' ? 'fa-money-bill-wave' : 'fa-credit-card';
    
    container.innerHTML = `
        <div class="payment-method">
            <i class="fas ${paymentIcon}"></i>
            <span>${paymentText}</span>
        </div>
    `;
}

function displayOrderItems(items) {
    const container = document.querySelector('.order-items');
    container.innerHTML = '<h3>Sản phẩm đã mua</h3>';

    items.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="item-image">
            <div class="item-info">
                <h4 class="item-title">${item.title}</h4>
                <p class="item-author">${item.author}</p>
                <p class="item-quantity">Số lượng: ${item.quantity}</p>
            </div>
            <div class="item-price">
                <p>${formatCurrency(item.price)}</p>
            </div>
        `;
        container.appendChild(itemCard);
    });
}

function displayOrderSummary(order) {
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = order.discount || 0;
    const shipping = order.shipping || 0;
    const total = subtotal - discount + shipping;

    document.querySelector('.summary-subtotal').textContent = formatCurrency(subtotal);
    document.querySelector('.summary-discount').textContent = `-${formatCurrency(discount)}`;
    document.querySelector('.summary-shipping').textContent = formatCurrency(shipping);
    document.querySelector('.summary-total').textContent = formatCurrency(total);
}

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

function getStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xác nhận',
        'confirmed': 'Đã xác nhận',
        'shipping': 'Đang giao hàng',
        'delivered': 'Đã giao hàng',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
} 