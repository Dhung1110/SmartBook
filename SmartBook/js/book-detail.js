document.addEventListener('DOMContentLoaded', function() {
    // Lấy ID sách từ tham số URL
    const urlParams = new URLSearchParams(window.location.search);
    let bookId = urlParams.get('id');
    
    // Nếu không có ID trong URL, thử lấy từ localStorage
    if (!bookId) {
        bookId = localStorage.getItem('currentBookId');
    }
    
    if (!bookId) {
        showError("Không tìm thấy thông tin sách");
        return;
    }
    
    // Lấy danh sách sách từ localStorage hoặc API
    const books = JSON.parse(localStorage.getItem('books') || '[]');
    const book = books.find(b => b.id == bookId);
    
    if (!book) {
        showError("Không tìm thấy thông tin sách");
        return;
    }
    
    // Hiển thị thông tin sách
    displayBookDetail(book);
    
    // Cập nhật số lượng giỏ hàng trên header
    updateCartCount();
    
    // Xử lý các tab
    setupTabs();
    
    // Xử lý thay đổi số lượng
    setupQuantityControl();
    
    // Xử lý thêm vào giỏ hàng
    document.getElementById('addToCart').addEventListener('click', function() {
        addToCart(book);
    });
    
    // Xử lý mua ngay
    document.getElementById('buyNow').addEventListener('click', function() {
        buyNow(book);
    });
    
    // Hiển thị sách liên quan
    displayRelatedBooks(book);
});

function displayBookDetail(book) {
    // Cập nhật tiêu đề trang
    document.title = `${book.title} - SmartBook`;
    
    // Cập nhật thông tin sách
    document.getElementById('bookTitle').textContent = book.title;
    document.getElementById('bookTitleNav').textContent = book.title;
    document.getElementById('bookTitleDetail').textContent = book.title;
    document.getElementById('bookImage').src = book.image || 'images/placeholder.jpg';
    document.getElementById('bookImage').alt = book.title;
    document.getElementById('bookAuthor').textContent = book.author || 'Không rõ';
    document.getElementById('bookCategoryDetail').textContent = book.category || 'Sách';
    document.getElementById('bookCategory').textContent = book.category || 'Sách';
    document.getElementById('bookYear').textContent = book.year || 'Không rõ';
    
    // Cập nhật giá
    const price = book.price || 0;
    const originalPrice = book.originalPrice || price;
    const discount = book.discount || 0;
    
    document.getElementById('bookPrice').textContent = formatCurrency(price);
    
    if (originalPrice > price) {
        document.getElementById('bookOriginalPrice').textContent = formatCurrency(originalPrice);
        document.getElementById('bookOriginalPrice').style.display = 'inline';
    } else {
        document.getElementById('bookOriginalPrice').style.display = 'none';
    }
    
    if (discount > 0) {
        document.getElementById('bookDiscount').textContent = `-${discount}%`;
        document.getElementById('bookDiscount').style.display = 'inline';
    } else {
        document.getElementById('bookDiscount').style.display = 'none';
    }
    
    // Cập nhật mô tả
    document.getElementById('bookDescription').innerHTML = book.description || 'Không có mô tả cho sách này.';
    
    // Cập nhật thông tin chi tiết
    document.getElementById('bookPages').textContent = book.pages || 'Không rõ';
    document.getElementById('bookSize').textContent = book.size || 'Không rõ';
    document.getElementById('bookPublisher').textContent = book.publisher || 'Không rõ';
    document.getElementById('bookLanguage').textContent = book.language || 'Tiếng Việt';
    document.getElementById('bookISBN').textContent = book.isbn || 'Không rõ';
    
    // Cập nhật đánh giá (giả lập)
    updateReviews(book);
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Ẩn tất cả tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Hiển thị tab được chọn
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

function setupQuantityControl() {
    const decreaseBtn = document.getElementById('decreaseQuantity');
    const increaseBtn = document.getElementById('increaseQuantity');
    const quantityInput = document.getElementById('quantity');
    
    decreaseBtn.addEventListener('click', function() {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });
    
    increaseBtn.addEventListener('click', function() {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue < 99) {
            quantityInput.value = currentValue + 1;
        }
    });
    
    quantityInput.addEventListener('change', function() {
        const value = parseInt(this.value);
        if (isNaN(value) || value < 1) {
            this.value = 1;
        } else if (value > 99) {
            this.value = 99;
        }
    });
}

function addToCart(book) {
    const quantity = parseInt(document.getElementById('quantity').value);
    
    // Lấy giỏ hàng hiện tại
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Kiểm tra xem sách đã có trong giỏ hàng chưa
    const existingItem = cart.find(item => item.bookId === book.id);
    
    if (existingItem) {
        // Cập nhật số lượng
        existingItem.quantity += quantity;
    } else {
        // Thêm sách mới vào giỏ hàng
        cart.push({
            bookId: book.id,
            quantity: quantity
        });
    }
    
    // Lưu giỏ hàng vào localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Cập nhật số lượng trên icon giỏ hàng
    updateCartCount();
    
    // Hiển thị thông báo
    Swal.fire({
        icon: 'success',
        title: 'Đã thêm vào giỏ hàng!',
        text: `Đã thêm ${quantity} "${book.title}" vào giỏ hàng.`,
        confirmButtonText: 'Tiếp tục mua sắm',
        showCancelButton: true,
        cancelButtonText: 'Đến giỏ hàng'
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
            window.location.href = 'cart.html';
        }
    });
}

function buyNow(book) {
    const quantity = parseInt(document.getElementById('quantity').value);
    
    // Tạo đối tượng đơn hàng mua ngay
    const buyNowOrder = {
        items: [{
            bookId: book.id,
            title: book.title,
            image: book.image,
            price: book.price,
            quantity: quantity
        }]
    };
    
    // Lưu vào localStorage
    localStorage.setItem('buyNowOrder', JSON.stringify(buyNowOrder));
    
    // Chuyển đến trang thanh toán
    window.location.href = 'buy-now-checkout.html';
}

function updateReviews(book) {
    // Giả lập dữ liệu đánh giá
    const ratings = {
        average: 4.2,
        count: 25,
        distribution: {
            5: 15,
            4: 5,
            3: 3,
            2: 1,
            1: 1
        }
    };
    
    // Hiển thị đánh giá trung bình
    document.getElementById('avgRating').textContent = ratings.average.toFixed(1);
    document.getElementById('ratingCount').textContent = `${ratings.count} đánh giá`;
    
    // Hiển thị phân phối đánh giá
    for (let i = 5; i >= 1; i--) {
        const count = ratings.distribution[i] || 0;
        const percent = ratings.count > 0 ? Math.round((count / ratings.count) * 100) : 0;
        
        document.getElementById(`rating${i}`).style.width = `${percent}%`;
        document.getElementById(`rating${i}Percent`).textContent = `${percent}%`;
    }
    
    // Hiển thị danh sách đánh giá
    const reviewsList = document.getElementById('reviewsList');
    
    if (ratings.count > 0) {
        // Xóa thông báo rỗng
        reviewsList.innerHTML = '';
        
        // Thêm các đánh giá giả lập
        for (let i = 0; i < Math.min(5, ratings.count); i++) {
            const rating = Math.floor(Math.random() * 5) + 1;
            const reviewDate = new Date();
            reviewDate.setDate(reviewDate.getDate() - Math.floor(Math.random() * 30));
            
            const reviewHtml = `
                <div class="review-item">
                    <div class="review-header">
                        <div class="review-author">Người dùng ${i + 1}</div>
                        <div class="review-date">${reviewDate.toLocaleDateString('vi-VN')}</div>
                    </div>
                    <div class="review-rating">
                        ${'<i class="fas fa-star"></i>'.repeat(rating)}
                        ${'<i class="far fa-star"></i>'.repeat(5 - rating)}
                    </div>
                    <div class="review-content">
                        Đây là một đánh giá mẫu về sách "${book.title}". Nội dung đánh giá sẽ được hiển thị ở đây.
                    </div>
                </div>
            `;
            
            reviewsList.innerHTML += reviewHtml;
        }
    }
}

function displayRelatedBooks(currentBook) {
    // Lấy danh sách sách
    const books = JSON.parse(localStorage.getItem('books') || '[]');
    
    // Lọc sách liên quan (cùng danh mục, trừ sách hiện tại)
    let relatedBooks = books.filter(book => {
        return book.id !== currentBook.id && book.category === currentBook.category;
    });
    
    // Nếu không có sách cùng danh mục, hiển thị một số sách khác
    if (relatedBooks.length === 0) {
        relatedBooks = books.filter(book => book.id !== currentBook.id).slice(0, 4);
    } else {
        // Giới hạn số lượng sách liên quan
        relatedBooks = relatedBooks.slice(0, 4);
    }
    
    // Hiển thị sách liên quan
    const relatedBooksContainer = document.getElementById('relatedBooks');
    relatedBooksContainer.innerHTML = '';
    
    relatedBooks.forEach(book => {
        const bookHtml = `
            <div class="book-card">
                <div class="book-image">
                    <a href="book-detail.html?id=${book.id}">
                        <img src="${book.image || 'images/placeholder.jpg'}" alt="${book.title}">
                    </a>
                    <div class="book-overlay">
                        <a href="book-detail.html?id=${book.id}" class="view-detail-btn">
                            <i class="fas fa-search"></i> Xem chi tiết
                        </a>
                    </div>
                </div>
                <div class="book-info">
                    <h4>${book.title}</h4>
                    <p class="author">${book.author || 'Không rõ'}</p>
                    <p class="price">${formatCurrency(book.price || 0)}</p>
                </div>
            </div>
        `;
        
        relatedBooksContainer.innerHTML += bookHtml;
    });
}

function updateCartCount() {
    // Lấy giỏ hàng
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Tính tổng số lượng
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Cập nhật số lượng trên icon giỏ hàng
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = count;
    }
}

function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: message,
        confirmButtonText: 'Quay về trang chủ'
    }).then(() => {
        window.location.href = 'customer-dashboard.html';
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
} 