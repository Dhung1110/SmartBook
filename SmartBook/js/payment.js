document.addEventListener('DOMContentLoaded', () => {
    // Lấy thông tin đơn hàng từ sessionStorage
    const orderData = JSON.parse(sessionStorage.getItem('orderSummary'));
    if (!orderData) {
        window.location.href = 'customer-dashboard.html';
        return;
    }

    // Lấy thông tin người dùng đã lưu
    const savedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    // Điền thông tin người dùng
    document.getElementById('fullName').value = savedUserInfo.fullname || '';
    document.getElementById('phone').value = savedUserInfo.phone || '';
    document.getElementById('email').value = savedUserInfo.email || '';
    document.getElementById('address').value = savedUserInfo.address || '';

    // Hiển thị thông tin đơn hàng
    displayOrderItems(orderData.items);
    displayOrderSummary(orderData);

    // Xử lý đặt hàng
    document.getElementById('placeOrderBtn').addEventListener('click', handlePlaceOrder);
});

function displayOrderItems(items) {
    const container = document.getElementById('orderItems');
    container.innerHTML = items.map(item => `
        <div class="order-item">
            <img src="${item.image}" alt="${item.title}">
            <div class="item-details">
                <h4>${item.title}</h4>
                <p class="author">${item.author}</p>
                <p class="quantity">Số lượng: ${item.quantity}</p>
            </div>
            <div class="item-price">
                ${formatCurrency(item.price * item.quantity)}
            </div>
        </div>
    `).join('');
}

function displayOrderSummary(orderData) {
    document.getElementById('subtotal').textContent = formatCurrency(orderData.subtotal);
    document.getElementById('shipping').textContent = formatCurrency(orderData.shipping);
    document.getElementById('total').textContent = formatCurrency(orderData.total);
}

function handlePlaceOrder(e) {
    e.preventDefault();

    // Kiểm tra form
    const form = document.getElementById('shippingForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Lấy thông tin giao hàng
    const shippingInfo = {
        fullName: document.getElementById('fullName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        address: document.getElementById('address').value.trim(),
        note: document.getElementById('note').value.trim()
    };

    // Lưu thông tin người dùng để lần sau sử dụng
    localStorage.setItem('userInfo', JSON.stringify(shippingInfo));

    // Lấy thông tin đơn hàng
    const orderData = JSON.parse(sessionStorage.getItem('orderSummary'));
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    // Tạo đơn hàng mới
    const order = {
        id: generateOrderId(),
        items: orderData.items,
        shippingInfo: shippingInfo,
        paymentMethod: paymentMethod,
        subtotal: orderData.subtotal,
        shipping: orderData.shipping,
        total: orderData.total,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    try {
        // Lưu đơn hàng
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Tạo hóa đơn
        createInvoice(order);

        // Xóa đơn hàng tạm thời và giỏ hàng
        sessionStorage.removeItem('orderSummary');
        localStorage.removeItem('cart');

        // Hiển thị thông báo thành công
        showNotification('Đặt hàng thành công!', 'success');

        // Chuyển về trang chủ
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        console.error('Lỗi khi đặt hàng:', error);
        showNotification('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!', 'error');
    }
}

function generateOrderId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD${timestamp.slice(-6)}${random}`;
}

function createInvoice(order) {
    const invoice = {
        id: generateInvoiceId(),
        orderId: order.id,
        customerInfo: order.shippingInfo,
        items: order.items.map(item => ({
            ...item,
            subtotal: item.price * item.quantity
        })),
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    // Lưu hóa đơn
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    invoices.push(invoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
}

function generateInvoiceId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `INV${timestamp.slice(-6)}${random}`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
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

    // Thêm class để hiển thị notification với animation
    setTimeout(() => notification.classList.add('show'), 100);

    // Xóa notification sau 3 giây
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
} 