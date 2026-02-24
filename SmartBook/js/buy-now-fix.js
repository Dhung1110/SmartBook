// Thêm hàm buyNow để hỗ trợ nút onclick="buyNow(bookId)"
window.buyNow = async function(bookId) {
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
                window.location.href = 'login.html';
            }
        });
        return;
    }

    const button = document.querySelector(`button[onclick="buyNow(${bookId})"]`);
    if (button) {
        button.classList.add('loading');
    }

    try {
        let book;
        // Thử lấy thông tin sách từ API
        try {
            const response = await fetch(`api/books/${bookId}`);
            if (response.ok) {
                book = await response.json();
            } else {
                throw new Error('API không khả dụng');
            }
        } catch (error) {
            // Fallback: lấy từ dữ liệu local
            book = window.books.find(b => b.id == bookId);
            if (!book) {
                // Nếu không tìm thấy, sử dụng dữ liệu mẫu
                const sampleBooks = [
                    { id: 1, title: "Nhà Giả Kim", author: "Paulo Coelho", price: 69000, image: "images/books/sach1.jpg" },
                    { id: 2, title: "Đắc Nhân Tâm", author: "Dale Carnegie", price: 86000, image: "images/books/sach2.jpg" },
                    { id: 3, title: "Java Programming", author: "Oracle Press", price: 250000, image: "images/books/sach3.jpg" },
                    { id: 4, title: "Cách Nghĩ Để Thành Công", author: "Napoleon Hill", price: 108000, image: "images/books/sach4.jpg" }
                ];
                
                book = sampleBooks.find(b => b.id == bookId);
                if (!book) {
                    throw new Error('Không tìm thấy thông tin sách');
                }
            }
        }

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
                author: book.author || 'Chưa cập nhật',
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

        // Chuyển đến trang thanh toán
        window.location.href = 'buy-now-checkout.html';

    } catch (error) {
        console.error('Lỗi khi xử lý mua ngay:', error);
        if (button) {
            button.classList.remove('loading');
        }
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: error.message || 'Không thể xử lý yêu cầu mua ngay',
            timer: 2000
        });
    }
};