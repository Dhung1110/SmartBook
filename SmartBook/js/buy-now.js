document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra đăng nhập
    const user = JSON.parse(localStorage.getItem('loginUser') || sessionStorage.getItem('loginUser'));
    if (!user) {
        // Nếu chưa đăng nhập, thêm class protected-feature vào nút mua ngay
        const buyNowBtns = document.querySelectorAll('.buy-now-btn');
        buyNowBtns.forEach(btn => {
            btn.classList.add('protected-feature');
        });
        return;
    }

    // Xử lý sự kiện mua ngay cho tất cả nút
    const buyNowBtns = document.querySelectorAll('.buy-now-btn');
    buyNowBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const bookCard = btn.closest('.book-card');
            if (bookCard) {
                handleBuyNow(bookCard);
            }
        });
    });
});

// Xử lý chức năng mua ngay
function handleBuyNow(bookCard) {
    const currentUser = JSON.parse(localStorage.getItem('loginUser') || sessionStorage.getItem('loginUser'));
    if (!currentUser) {
        Swal.fire({
            icon: 'warning',
            title: 'Thông báo',
            text: 'Vui lòng đăng nhập để mua sách',
            confirmButtonText: 'Đăng nhập',
            showCancelButton: true,
            cancelButtonText: 'Đóng'
        }).then((result) => {
            if (result.isConfirmed) {
                // Lưu URL hiện tại để sau khi đăng nhập quay lại
                sessionStorage.setItem('returnUrl', window.location.href);
                window.location.href = 'login.html';
            }
        });
        return;
    }

    try {
        // Lấy thông tin sách từ book card
        const bookInfo = bookCard.querySelector('.book-info');
        const bookImage = bookCard.querySelector('.book-image img');

        const book = {
            id: bookCard.getAttribute('data-book-id') || generateTempId(),
            title: bookInfo.querySelector('h4').textContent,
            author: bookInfo.querySelector('.author').textContent,
            price: parseFloat(bookInfo.querySelector('.price').textContent.replace(/[^\d]/g, '')),
            image: bookImage.src
        };

        // Tính toán giá tiền
        const quantity = 1;
        const subtotal = book.price * quantity;
        const shipping = subtotal > 300000 ? 0 : 30000;
        const total = subtotal + shipping;

        // Lưu thông tin đơn hàng tạm thời
        const orderData = {
            book: {
                id: book.id,
                title: book.title,
                author: book.author,
                price: book.price,
                image: book.image
            },
            quantity: quantity,
            subtotal: subtotal,
            shipping: shipping,
            total: total,
            userId: currentUser.id,
            orderDate: new Date().toISOString()
        };

        // Lưu vào localStorage để xử lý ở trang thanh toán
        localStorage.setItem('buyNowOrder', JSON.stringify(orderData));

        // Thêm độ trễ nhỏ để đảm bảo localStorage được cập nhật
        setTimeout(() => {
            // Chuyển đến trang thanh toán
            window.location.href = 'buy-now-checkout.html';
        }, 100); // 100ms delay

    } catch (error) {
        console.error('Lỗi khi xử lý mua ngay:', error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: error.message || 'Không thể xử lý yêu cầu mua ngay',
            timer: 2000
        });
    }
}

function generateTempId() {
    return 'TEMP_' + Date.now().toString();
}

function showNotification(message, type = 'success') {
    Swal.fire({
        icon: type,
        title: message,
        timer: 2000,
        showConfirmButton: false
    });
} 