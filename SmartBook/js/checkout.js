document.addEventListener('DOMContentLoaded', function() {
    // Lấy thông tin giỏ hàng
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    // Điền thông tin người dùng từ localStorage nếu có
    const savedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    document.getElementById('fullName').value = savedUserInfo.fullname || '';
    document.getElementById('phone').value = savedUserInfo.phone || '';
    document.getElementById('email').value = savedUserInfo.email || '';

    // Hiển thị sản phẩm trong đơn hàng
    displayOrderItems();

    // Xử lý đặt hàng
    document.getElementById('placeOrderBtn').addEventListener('click', function(e) {
        e.preventDefault(); // Ngăn form submit mặc định

        const fullName = document.getElementById('fullName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const address = document.getElementById('address').value.trim();
        const note = document.getElementById('note').value.trim();
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;

        // Kiểm tra thông tin
        if (!fullName || !phone || !email || !address) {
            showNotification('Lỗi', 'Vui lòng điền đầy đủ thông tin giao hàng!', 'error');
            return;
        }

        if (!paymentMethod) {
            showNotification('Lỗi', 'Vui lòng chọn phương thức thanh toán!', 'error');
            return;
        }

        // Tạo đơn hàng
        const order = {
            id: generateOrderId(),
            userId: savedUserInfo.id,
            items: cart,
            shippingInfo: {
                fullName,
                phone,
                email,
                address,
                note
            },
            paymentMethod,
            subtotal: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
            discount: parseInt(localStorage.getItem(`checkout_discount_${savedUserInfo.id}`) || '0'),
            shipping: 30000,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        order.total = order.subtotal - order.discount + order.shipping;

        try {
            // Lưu đơn hàng
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));

            // Xóa giỏ hàng và giảm giá
            localStorage.removeItem(`cart_${savedUserInfo.id}`);
            localStorage.removeItem(`checkout_discount_${savedUserInfo.id}`);

            // Nếu thanh toán COD, tạo hóa đơn ngay
            if (paymentMethod === 'cod') {
                createInvoice(order);
            }

            // Hiển thị thông báo thành công và chuyển hướng
            showNotification(
                'Đặt Hàng Thành Công!',
                'Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.',
                'success'
            );

            // Chuyển đến trang chi tiết đơn hàng sau 2 giây
            setTimeout(() => {
                window.location.href = `order-detail.html?id=${order.id}`;
            }, 2000);

        } catch (error) {
            console.error('Lỗi khi đặt hàng:', error);
            showNotification('Lỗi', 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!', 'error');
        }
    });
});

// Hiển thị sản phẩm trong đơn hàng
function displayOrderItems() {
    const savedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const cart = JSON.parse(localStorage.getItem(`cart_${savedUserInfo.id}`) || '[]');
    const orderItems = document.getElementById('orderItems');
    
    if (!orderItems) return;

    orderItems.innerHTML = cart.map(item => `
        <div class="order-item">
            <img src="${item.image}" alt="${item.title}" class="item-image">
            <div class="item-details">
                <h4>${item.title}</h4>
                <p class="author">${item.author}</p>
                <p class="item-quantity">Số lượng: ${item.quantity}</p>
            </div>
            <div class="item-price">
                ${formatCurrency(item.price * item.quantity)}
            </div>
        </div>
    `).join('');

    updateOrderSummary();
}

// Cập nhật tổng kết đơn hàng
function updateOrderSummary() {
    const savedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const cart = JSON.parse(localStorage.getItem(`cart_${savedUserInfo.id}`) || '[]');
    
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 30000; // Phí vận chuyển cố định
    const discount = parseInt(localStorage.getItem(`checkout_discount_${savedUserInfo.id}`) || '0');
    const total = subtotal - discount + shipping;

    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('discount').textContent = `-${formatCurrency(discount)}`;
    document.getElementById('shipping').textContent = formatCurrency(shipping);
    document.getElementById('total').textContent = formatCurrency(total);
}

// Hàm tạo mã đơn hàng
function generateOrderId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD${timestamp.slice(-6)}${random}`;
}

// Hàm tạo mã hóa đơn
function generateInvoiceId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `INV${timestamp.slice(-6)}${random}`;
}

// Hàm tạo hóa đơn
function createInvoice(order) {
    const invoice = {
        id: generateInvoiceId(),
        orderId: order.id,
        userId: order.userId,
        customerInfo: order.shippingInfo,
        items: order.items.map(item => ({
            ...item,
            subtotal: item.price * item.quantity
        })),
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        discount: order.discount,
        shipping: order.shipping,
        total: order.total,
        status: order.paymentMethod === 'cod' ? 'pending' : 'paid',
        createdAt: new Date().toISOString()
    };

    // Lưu hóa đơn
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    invoices.push(invoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
}

// Hàm định dạng tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Hàm hiển thị thông báo
function showNotification(title, message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <h3>${title}</h3>
        <p>${message}</p>
    `;
    document.body.appendChild(notification);

    // Tự động ẩn thông báo sau 3 giây
    setTimeout(() => {
        notification.remove();
    }, 3000);
}