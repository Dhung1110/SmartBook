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

        // Kiểm tra các sản phẩm đã chọn
        const selectedItems = JSON.parse(localStorage.getItem('selectedItems') || '[]');
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        if (!selectedItems.length) {
            Swal.fire({
                icon: 'warning',
                title: 'Giỏ hàng trống',
                text: 'Vui lòng chọn sản phẩm để thanh toán',
                confirmButtonText: 'Quay lại giỏ hàng'
            }).then(() => {
                window.location.href = 'cart.html';
            });
            return;
        }

        // Điền thông tin người dùng
        document.getElementById('fullname').value = currentUser.fullname || '';
        document.getElementById('phone').value = currentUser.phone || '';
        document.getElementById('email').value = currentUser.email || '';
        document.getElementById('address').value = currentUser.address || '';

        // Hiển thị thông tin đơn hàng đã chọn
        await displaySelectedItems();

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
            confirmButtonText: 'Quay về giỏ hàng'
        }).then(() => {
            window.location.href = 'cart.html';
        });
    }
});

async function displaySelectedItems() {
    const selectedItems = JSON.parse(localStorage.getItem('selectedItems') || '[]');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItemsContainer = document.getElementById('cartItems');

    if (!selectedItems.length) {
        window.location.href = 'cart.html';
        return;
    }

    try {
        const books = await fetchBooks();
        let subtotal = 0;
        let itemsHTML = '';

        for (const selectedItem of selectedItems) {
            const cartItem = cart.find(item => item.bookId === selectedItem.id);
            const book = books.find(b => b.id === selectedItem.id);
            
            if (!cartItem || !book) continue;

            const itemTotal = book.price * cartItem.quantity;
            subtotal += itemTotal;

            itemsHTML += `
                <div class="order-item">
                    <div class="item-image">
                        <img src="${book.image}" alt="${book.title}" 
                             onerror="this.src='images/book-placeholder.jpg'">
                    </div>
                    <div class="item-details">
                        <h4>${book.title}</h4>
                        <p class="quantity">Số lượng: ${cartItem.quantity}</p>
                        <div class="item-price">${formatCurrency(itemTotal)}</div>
                    </div>
                </div>
            `;
        }

        cartItemsContainer.innerHTML = itemsHTML;

        // Tính giảm giá từ voucher
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
        const total = subtotal - discount + shipping;
        const totalAmountElement = document.getElementById('totalAmount');
        if (totalAmountElement) {
            totalAmountElement.textContent = formatCurrency(total);
        }

    } catch (error) {
        console.error('Lỗi khi tải thông tin đơn hàng:', error);
        Swal.fire({
            icon: 'error',
            title: 'Có lỗi xảy ra',
            text: 'Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.',
            confirmButtonText: 'Quay lại giỏ hàng'
        }).then(() => {
            window.location.href = 'cart.html';
        });
    }
}

function handleVoucherChange() {
    displaySelectedItems();
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

async function fetchBooks() {
    try {
        const response = await fetch('/api/books');
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.warn('Không thể lấy dữ liệu từ API, sử dụng dữ liệu cục bộ:', error);
        return JSON.parse(localStorage.getItem('books') || '[]');
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

        const selectedItems = JSON.parse(localStorage.getItem('selectedItems') || '[]');
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        if (!selectedItems.length) {
            throw new Error('Giỏ hàng trống, không thể thanh toán');
        }

        const books = await fetchBooks();

        let subtotal = 0;
        const orderItems = [];

        // Tạo danh sách sản phẩm đã chọn với thông tin đầy đủ
        for (const selectedItem of selectedItems) {
            const cartItem = cart.find(item => item.bookId === selectedItem.id);
            const book = books.find(b => b.id === selectedItem.id);
            
            if (!cartItem || !book) continue; // Bỏ qua nếu không tìm thấy thông tin

            const itemTotal = book.price * cartItem.quantity;
            subtotal += itemTotal;

            orderItems.push({
                bookId: book.id,
                title: book.title,
                image: book.image,
                price: book.price,
                quantity: cartItem.quantity,
                subtotal: itemTotal
            });
        }
        
        // Đảm bảo có sản phẩm hợp lệ để tiếp tục
        if (orderItems.length === 0) {
            throw new Error('Không tìm thấy sản phẩm hợp lệ trong giỏ hàng');
        }

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

        // Lưu thông tin người nhận
        const shippingInfo = {
            fullname: form.fullname.value,
            phone: form.phone.value,
            email: form.email.value,
            address: form.address.value,
            note: form.note.value
        };

        // Tạo đơn hàng mới
        const newOrder = {
            id: generateOrderId(),
            userId: currentUser.id, // Sử dụng currentUser.id đã kiểm tra
            items: orderItems,
            shippingInfo: shippingInfo,
            voucher: selectedVoucher ? selectedVoucher.value : null,
            discount: discount,
            paymentMethod: paymentMethod,
            paymentDetails: paymentDetails, // Thêm chi tiết thanh toán
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

        // Xóa các sản phẩm đã mua khỏi giỏ hàng
        const newCart = cart.filter(item => !selectedItems.some(selected => selected.id === item.bookId));
        localStorage.setItem('cart', JSON.stringify(newCart));

        // Xóa danh sách sản phẩm đã chọn
        localStorage.removeItem('selectedItems');

        // Hiển thị thông báo thành công
        Swal.fire({
            icon: 'success',
            title: 'Đặt hàng thành công!',
            text: 'Cảm ơn bạn đã mua hàng tại SmartBook. Đơn hàng của bạn đang được xử lý.',
            confirmButtonText: 'Quay về trang chủ'
        }).then(() => {
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
            } else if (error.message === 'Giỏ hàng trống, không thể thanh toán' || error.message === 'Không tìm thấy sản phẩm hợp lệ trong giỏ hàng') {
                window.location.href = 'cart.html';
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
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
} 