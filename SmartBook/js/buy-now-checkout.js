document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Kiểm tra người dùng đã đăng nhập
        const currentUser = JSON.parse(localStorage.getItem('loginUser') || sessionStorage.getItem('loginUser'));
        if (!currentUser || !currentUser.id) {
            Swal.fire({
                icon: 'warning',
                title: 'Vui lòng đăng nhập',
                text: 'Bạn cần đăng nhập để tiếp tục thanh toán',
                confirmButtonText: 'Đăng nhập ngay'
            }).then(() => {
                window.location.href = 'login.html';
            });
            return;
        }

        // Kiểm tra dữ liệu đơn hàng
        const orderData = JSON.parse(localStorage.getItem('buyNowOrder'));
        if (!orderData || !orderData.items || orderData.items.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Có lỗi xảy ra',
                text: 'Không tìm thấy thông tin đơn hàng',
                confirmButtonText: 'Quay về trang chủ'
            }).then(() => {
                window.location.href = 'customer-dashboard.html';
            });
            return;
        }

        // Điền thông tin người dùng
        document.getElementById('fullname').value = currentUser.fullname || '';
        document.getElementById('phone').value = currentUser.phone || '';
        document.getElementById('email').value = currentUser.email || '';
        document.getElementById('address').value = currentUser.address || '';

        // Hiển thị thông tin đơn hàng
        displayOrderInfo(orderData);

        // Xử lý form thanh toán
        document.getElementById('checkoutForm').addEventListener('submit', handleCheckout);

        // Xử lý sự kiện chọn voucher
        document.querySelectorAll('input[name="voucher"]').forEach(radio => {
            radio.addEventListener('change', handleVoucherChange);
        });

        // Xử lý sự kiện chọn phương thức thanh toán
        document.querySelectorAll('input[name="payment"]').forEach(radio => {
            radio.addEventListener('change', handlePaymentMethodChange);
        });
    } catch (error) {
        console.error('Lỗi khởi tạo trang:', error);
        Swal.fire({
            icon: 'error',
            title: 'Có lỗi xảy ra',
            text: 'Không thể tải thông tin thanh toán. Vui lòng thử lại sau.',
            confirmButtonText: 'Quay về trang chủ'
        }).then(() => {
            window.location.href = 'customer-dashboard.html';
        });
    }
});

function displayOrderInfo(orderData) {
    const orderItemsContainer = document.getElementById('orderItems');

    // Kiểm tra lại cấu trúc dữ liệu
    if (!orderData || !orderData.items || orderData.items.length === 0) {
        orderItemsContainer.innerHTML = '<p>Không có thông tin sản phẩm.</p>';
        return;
    }

    const item = orderData.items[0]; // Lấy item đầu tiên
    const quantity = item.quantity;
    const price = item.price;
    const subtotal = price * quantity;

    // Tính giảm giá nếu có voucher được chọn
    const selectedVoucher = document.querySelector('input[name="voucher"]:checked');
    let discount = 0;
    let shipping = subtotal >= 200000 ? 0 : 20000;

    if (selectedVoucher) {
        if (selectedVoucher.value === 'WELCOME10') {
            discount = subtotal * 0.1; // Giảm 10%
        } else if (selectedVoucher.value === 'FREESHIP') {
            shipping = 0; // Miễn phí vận chuyển
        }
    }

    const total = subtotal - discount + shipping;

    // --- Cập nhật hiển thị thông tin sách ---
    orderItemsContainer.innerHTML = `
        <div class="order-item">
            <div class="item-image">
                <img src="${item.image || 'images/placeholder.jpg'}" alt="${item.title}"
                     onerror="this.src='images/placeholder.jpg'">
            </div>
            <div class="item-details">
                <h4>${item.title || 'N/A'}</h4>
                <div class="item-quantity">
                    <button class="quantity-btn minus" data-id="${item.bookId}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" class="quantity-input" value="${quantity}" 
                           min="1" max="99" data-id="${item.bookId}">
                    <button class="quantity-btn plus" data-id="${item.bookId}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="item-price">${formatCurrency(price)}</div>
            </div>
        </div>
    `;

    // Hiển thị thông tin giảm giá
    const voucherMessage = document.getElementById('voucherMessage');
    if (selectedVoucher) {
        if (selectedVoucher.value === 'WELCOME10') {
            voucherMessage.textContent = `Giảm giá: -${formatCurrency(discount)}`;
            voucherMessage.className = 'voucher-message success';
        } else if (selectedVoucher.value === 'FREESHIP') {
            voucherMessage.textContent = 'Đã áp dụng miễn phí vận chuyển';
            voucherMessage.className = 'voucher-message success';
        }
    } else {
        voucherMessage.textContent = '';
    }

    // Cập nhật phí vận chuyển
    const shippingFeeElement = document.getElementById('shippingFee');
    if (shippingFeeElement) {
        shippingFeeElement.textContent = formatCurrency(shipping);
    }

    // Cập nhật tổng tiền
    const totalAmountElement = document.getElementById('totalAmount');
    if(totalAmountElement) {
        totalAmountElement.textContent = formatCurrency(total);
    }

    // Thêm event listeners cho các nút điều chỉnh số lượng
    setupQuantityControls();
}

function setupQuantityControls() {
    const orderItemsContainer = document.getElementById('orderItems');

    // Xử lý nút giảm số lượng
    orderItemsContainer.querySelectorAll('.quantity-btn.minus').forEach(button => {
        button.addEventListener('click', () => updateQuantity(button.dataset.id, -1));
    });

    // Xử lý nút tăng số lượng
    orderItemsContainer.querySelectorAll('.quantity-btn.plus').forEach(button => {
        button.addEventListener('click', () => updateQuantity(button.dataset.id, 1));
    });

    // Xử lý input số lượng
    orderItemsContainer.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const newValue = parseInt(e.target.value);
            if (newValue >= 1 && newValue <= 99) {
                updateQuantityDirect(input.dataset.id, newValue);
            } else {
                // Reset về giá trị hợp lệ gần nhất
                e.target.value = Math.max(1, Math.min(99, newValue));
            }
        });
    });
}

function updateQuantity(bookId, change) {
    const orderData = JSON.parse(localStorage.getItem('buyNowOrder'));
    if (!orderData || !orderData.items || !orderData.items.length) return;

    const item = orderData.items[0];
    if (item.bookId !== parseInt(bookId)) return;

    const newQuantity = item.quantity + change;
    if (newQuantity < 1 || newQuantity > 99) return;

    item.quantity = newQuantity;
    localStorage.setItem('buyNowOrder', JSON.stringify(orderData));
    displayOrderInfo(orderData);
}

function updateQuantityDirect(bookId, newQuantity) {
    const orderData = JSON.parse(localStorage.getItem('buyNowOrder'));
    if (!orderData || !orderData.items || !orderData.items.length) return;

    const item = orderData.items[0];
    if (item.bookId !== parseInt(bookId)) return;

    if (newQuantity < 1 || newQuantity > 99) return;

    item.quantity = newQuantity;
    localStorage.setItem('buyNowOrder', JSON.stringify(orderData));
    displayOrderInfo(orderData);
}

function handleVoucherChange(event) {
    const orderData = JSON.parse(localStorage.getItem('buyNowOrder'));
    if (!orderData || !orderData.items || !orderData.items.length) return;

    displayOrderInfo(orderData);
}

function handlePaymentMethodChange(event) {
    const bankInfoFields = document.getElementById('bankInfoFields');
    const qrCodeDisplay = document.getElementById('qrCodeDisplay');
    
    // Ẩn tất cả trước
    bankInfoFields.style.display = 'none';
    qrCodeDisplay.style.display = 'none';
    
    // Bỏ yêu cầu nhập liệu cho trường ngân hàng
    document.getElementById('bankAccountName').required = false;
    document.getElementById('bankAccountNumber').required = false;
    document.getElementById('bankName').required = false;
    
    // Hiển thị phần tương ứng với phương thức thanh toán
    if (event.target.value === 'banking') {
        bankInfoFields.style.display = 'block';
        // Yêu cầu nhập liệu cho các trường ngân hàng
        document.getElementById('bankAccountName').required = true;
        document.getElementById('bankAccountNumber').required = true;
        document.getElementById('bankName').required = true;
    } else if (event.target.value === 'qrcode') {
        qrCodeDisplay.style.display = 'block';
    }
}

async function handleCheckout(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.classList.add('loading');

    try {
        // Kiểm tra người dùng đã đăng nhập
        const currentUser = JSON.parse(localStorage.getItem('loginUser') || sessionStorage.getItem('loginUser'));
        if (!currentUser || !currentUser.id) {
            throw new Error('Vui lòng đăng nhập để tiếp tục thanh toán');
        }

        const orderData = JSON.parse(localStorage.getItem('buyNowOrder'));
        if (!orderData || !orderData.items || !orderData.items.length) {
            throw new Error('Không tìm thấy thông tin đơn hàng');
        }

        const item = orderData.items[0];
        const quantity = item.quantity;
        const price = item.price;
        const subtotal = price * quantity;

        // Tính giảm giá từ voucher
        const selectedVoucher = document.querySelector('input[name="voucher"]:checked');
        let discount = 0;
        let shipping = subtotal >= 200000 ? 0 : 20000;

        if (selectedVoucher) {
            if (selectedVoucher.value === 'WELCOME10') {
                discount = subtotal * 0.1;
            } else if (selectedVoucher.value === 'FREESHIP') {
                shipping = 0;
            }
        }

        const total = subtotal - discount + shipping;

        // Lấy thông tin thanh toán chi tiết nếu là chuyển khoản
        let paymentDetails = {};
        const paymentMethod = form.payment.value;
        if (paymentMethod === 'banking') {
            paymentDetails = {
                accountName: form.bankAccountName.value,
                accountNumber: form.bankAccountNumber.value,
                bankName: form.bankName.value
            };
        }

        // Lưu thông tin người dùng
        const userInfo = {
            fullname: form.fullname.value,
            phone: form.phone.value,
            email: form.email.value,
            address: form.address.value
        };

        const newOrder = {
            id: generateOrderId(),
            userId: currentUser.id,
            items: [{
                bookId: item.bookId,
                title: item.title,
                image: item.image,
                price: item.price,
                quantity: item.quantity,
                subtotal: subtotal
            }],
            shippingInfo: {
                fullname: form.fullname.value,
                phone: form.phone.value,
                email: form.email.value,
                address: form.address.value,
                note: form.note.value
            },
            voucher: selectedVoucher ? selectedVoucher.value : null,
            discount: discount,
            paymentMethod: paymentMethod,
            paymentDetails: paymentDetails,
            subtotal: subtotal,
            shipping: shipping,
            total: total,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        // Lưu đơn hàng vào localStorage
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Xóa thông tin đơn hàng tạm thời
        localStorage.removeItem('buyNowOrder');

        // Hiển thị thông báo thành công
        Swal.fire({
            icon: 'success',
            title: 'Đặt hàng thành công!',
            text: 'Cảm ơn bạn đã mua hàng tại SmartBook. Đơn hàng của bạn đang được xử lý.',
            confirmButtonText: 'Quay về trang chủ'
        }).then((result) => {
            window.location.href = 'customer-dashboard.html';
        });

    } catch (error) {
        console.error('Lỗi khi đặt hàng:', error);
        Swal.fire({
            icon: 'error',
            title: 'Có lỗi xảy ra',
            text: error.message || 'Không thể hoàn tất đơn hàng. Vui lòng thử lại sau.',
            confirmButtonText: 'Đã hiểu'
        }).then(() => {
            if (error.message === 'Vui lòng đăng nhập để tiếp tục thanh toán') {
                window.location.href = 'login.html';
            }
        });
    } finally {
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
    }
}

function generateOrderId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD${timestamp.slice(-6)}${random}`;
}

function formatCurrency(amount) {
    // Kiểm tra nếu amount không phải là số thì trả về giá trị mặc định hoặc báo lỗi
    if (typeof amount !== 'number' || isNaN(amount)) {
        console.warn("formatCurrency received non-numeric value:", amount);
        return '0 VND'; // Hoặc giá trị mặc định khác
    }
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
} 