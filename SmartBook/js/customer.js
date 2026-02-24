document.addEventListener('DOMContentLoaded', async function() {
    // Hàm loại bỏ dấu tiếng Việt và chuyển sang chữ thường
    function removeVietnameseTones(str) {
        if (!str) return '';
        str = str.toLowerCase();
        str = str.normalize('NFD').replace(/[̀-ͯ]/g, ''); // Bỏ dấu huyền, sắc, hỏi, ngã, nặng
        str = str.replace(/đ/g, 'd'); // Thay đ thành d
        return str;
    }

    // Kiểm tra đăng nhập
    const currentUser = JSON.parse(localStorage.getItem('loginUser') || sessionStorage.getItem('loginUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Kích hoạt tất cả các chức năng được bảo vệ
    const protectedFeatures = document.querySelectorAll('.protected-feature');
    protectedFeatures.forEach(feature => {
        feature.classList.add('active');
    });

    // Hiển thị tên người dùng
    const userNameElement = document.getElementById('customerName');
    if (userNameElement) {
        userNameElement.textContent = currentUser.fullname;
    }

    // Ẩn guest links và hiển thị user links
    document.querySelector('.guest-links').style.display = 'none';
    document.querySelector('.user-links').style.display = 'block';

    // Cập nhật số lượng giỏ hàng
    function updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    // Gọi hàm cập nhật số lượng giỏ hàng khi tải trang
    updateCartCount();

    // Xử lý đăng xuất
    const logoutButton = document.querySelector('.logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('loginUser');
            sessionStorage.removeItem('loginUser');
            window.location.href = 'login.html';
        });
    }

    // Lấy dữ liệu sách từ API hoặc local
    async function fetchBooks(categoryId = null) {
        try {
            // Thử lấy từ API trước
            let url = 'api/books';
            if (categoryId) {
                url += `?categoryId=${categoryId}`;
            }
            const response = await fetch(url);
            if (!response.ok) {
                return await fallbackToLocalBooks(categoryId);
            }
            return await response.json();
        } catch (error) {
            return await fallbackToLocalBooks(categoryId);
        }
    }

    // Hàm fallback về dữ liệu local
    async function fallbackToLocalBooks(categoryId = null) {
        if (window.books) {
            if (categoryId) {
                return window.books.filter(book => book.categoryId === parseInt(categoryId));
            }
            return window.books;
        }
        throw new Error('Không thể tải dữ liệu sách');
    }

    // Hiển thị sách
    function displayBooks(booksToShow, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = booksToShow.map(book => `
            <div class="book-card">
                <div class="book-image">
                    <a href="javascript:void(0);" onclick="viewBookDetail(${book.id})">
                        <img src="${book.image}"
                             alt="${book.title}"
                             onerror="this.onerror=null; this.src='images/books/default.jpg';"
                             loading="lazy"
                             decoding="async">
                    </a>
                    <div class="book-overlay">
                        <a href="javascript:void(0);" class="view-detail-btn" onclick="viewBookDetail(${book.id})">
                            <i class="fas fa-search"></i> Xem chi tiết
                        </a>
                    </div>
                    ${book.discount ? `<span class="discount-badge">-${book.discount}%</span>` : ''}
                </div>
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p class="author">${book.author}</p>
                    <div class="price">
                        <span class="current-price">${book.price.toLocaleString()}đ</span>
                        ${book.originalPrice ? `<span class="original-price">${book.originalPrice.toLocaleString()}đ</span>` : ''}
                    </div>
                    <div class="book-actions">
                        <button class="add-to-cart" onclick="addToCart(${book.id})">
                            <i class="fas fa-shopping-cart"></i>
                            Thêm vào giỏ
                        </button>
                        <button class="buy-now" onclick="buyNow(${book.id})">
                            <i class="fas fa-bolt"></i>
                            Mua ngay
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Khởi tạo lazy loading cho ảnh
        if ('loading' in HTMLImageElement.prototype) {
            const images = container.getElementsByTagName('img');
            Array.from(images).forEach(img => {
                if (img.hasAttribute('data-src')) {
                    img.src = img.dataset.src;
                }
            });
        } else {
            // Fallback cho trình duyệt không hỗ trợ lazy loading
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
            document.body.appendChild(script);
        }
    }

    // Hàm thêm vào giỏ hàng
    window.addToCart = async function(bookId) {
        if (!currentUser) {
            Swal.fire({
                icon: 'warning',
                title: 'Thông báo',
                text: 'Vui lòng đăng nhập để thêm sách vào giỏ hàng',
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

        const button = document.querySelector(`button[onclick="addToCart(${bookId})"]`);
        if (button) {
            button.classList.add('loading');
        }

        try {
            let book;
            // Try to get book from API first
            try {
                const response = await fetch(`api/books/${bookId}`);
                if (response.ok) {
                    book = await response.json();
                } else {
                    throw new Error('API not available');
                }
            } catch (error) {
                // Fallback to window.books
                book = window.books.find(b => b.id === bookId);
                if (!book) {
                    throw new Error('Không tìm thấy sách');
                }
            }

            // Cập nhật giỏ hàng
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingItem = cart.find(item => item.bookId === bookId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    bookId: book.id,
                    quantity: 1
                });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();

            if (button) {
                setTimeout(() => {
                    button.classList.remove('loading');
                    button.classList.add('added');
                    button.innerHTML = '<i class="fas fa-check"></i> Đã thêm';

                    setTimeout(() => {
                        button.classList.remove('added');
                        button.innerHTML = '<i class="fas fa-shopping-cart"></i> Thêm vào giỏ';
                    }, 2000);
                }, 800);
            }

            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: 'Đã thêm sách vào giỏ hàng',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            if (button) {
                button.classList.remove('loading');
            }
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: error.message || 'Không thể thêm sách vào giỏ hàng',
                timer: 1500
            });
        }
    };

    // Hàm mua ngay
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
                book = window.books.find(b => b.id === bookId);
                if (!book) {
                    throw new Error('Không tìm thấy thông tin sách');
                }
            }

            // Tạo đơn hàng tạm thời
            const orderData = {
                items: [{
                    bookId: book.id,
                    title: book.title,
                    price: book.price,
                    quantity: 1,
                    image: book.image
                }],
                totalAmount: book.price,
                userId: currentUser.id,
                orderDate: new Date().toISOString(),
                status: 'pending'
            };

            // Lưu vào localStorage để xử lý ở trang thanh toán
            localStorage.setItem('buyNowOrder', JSON.stringify(orderData));

            // Chuyển đến trang thanh toán ngay
            window.location.href = 'buy-now-checkout.html';

        } catch (error) {
            if (button) {
                button.classList.remove('loading');
            }
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: error.message || 'Không thể thực hiện mua ngay',
                timer: 1500
            });
        }
    };

    // Hiển thị sách theo danh mục
    async function displayBooksByCategory(categoryId) {
        const books = await fetchBooks(categoryId);
        displayBooks(books, 'newBooksGrid');
    }

    // Xử lý menu danh mục
    function handleCategoryMenu() {
        const categoryLinks = document.querySelectorAll('.category-content a');
        categoryLinks.forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const categoryId = link.getAttribute('data-category');
                await displayBooksByCategory(categoryId);
            });
        });
    }

    // Hàm xem chi tiết sách
    window.viewBookDetail = function(bookId) {
        // Lưu ID sách vào localStorage để dùng ở trang chi tiết
        localStorage.setItem('currentBookId', bookId);
        
        // Chuyển hướng đến trang chi tiết sách
        window.location.href = `book-detail.html?id=${bookId}`;
    };

    // Hàm hiển thị kết quả tìm kiếm (tương tự displayBooks nhưng vào grid khác)
    function displaySearchResults(booksToShow) {
        const container = document.getElementById('searchResultsGrid');
        const mainContent = document.querySelector('main.customer-only');
        const searchResultsContainer = document.getElementById('searchResults');
        const noResultsMessage = document.getElementById('noResultsMessage');
        
        if (!container || !mainContent || !searchResultsContainer || !noResultsMessage) return;

        if (booksToShow.length > 0) {
            container.innerHTML = booksToShow.map(book => `
                <div class="book-card">
                    <div class="book-image">
                        <a href="javascript:void(0);" onclick="viewBookDetail(${book.id})">
                            <img src="${book.image}" 
                                 alt="${book.title}" 
                                 onerror="this.onerror=null; this.src='images/books/default.jpg';"
                                 loading="lazy"
                                 decoding="async">
                        </a>
                        <div class="book-overlay">
                            <a href="javascript:void(0);" class="view-detail-btn" onclick="viewBookDetail(${book.id})">
                                <i class="fas fa-search"></i> Xem chi tiết
                            </a>
                        </div>
                        ${book.discount ? `<span class="discount-badge">-${book.discount}%</span>` : ''}
                    </div>
                    <div class="book-info">
                        <h3>${book.title}</h3>
                        <p class="author">${book.author}</p>
                        <div class="price">
                            <span class="current-price">${book.price.toLocaleString()}đ</span>
                            ${book.originalPrice ? `<span class="original-price">${book.originalPrice.toLocaleString()}đ</span>` : ''}
                        </div>
                        <div class="book-actions">
                            <button class="add-to-cart" onclick="addToCart(${book.id})">
                                <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
                            </button>
                            <button class="buy-now" onclick="buyNow(${book.id})">
                                <i class="fas fa-bolt"></i> Mua ngay
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            noResultsMessage.style.display = 'none';
        } else {
            container.innerHTML = ''; // Xóa kết quả cũ nếu có
            noResultsMessage.style.display = 'block';
        }
        
        mainContent.style.display = 'none'; // Ẩn nội dung chính
        searchResultsContainer.style.display = 'block'; // Hiện khu vực kết quả
    }

    // Hàm xóa kết quả tìm kiếm và hiển thị lại nội dung chính
    function clearSearchResults() {
        const mainContent = document.querySelector('main.customer-only');
        const searchResultsContainer = document.getElementById('searchResults');
        const searchInput = document.getElementById('searchInput');
        
        if (mainContent && searchResultsContainer) {
            searchResultsContainer.style.display = 'none';
            mainContent.style.display = 'block';
        }
        if (searchInput) {
             searchInput.value = ''; // Xóa nội dung ô tìm kiếm
        }
    }
    
    // Xử lý sự kiện tìm kiếm
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', function() {
            const rawQuery = searchInput.value.trim(); // Giữ query gốc để kiểm tra "sach"
            const query = removeVietnameseTones(rawQuery); // Query đã bỏ dấu, lowercase
            
            const allBooks = JSON.parse(localStorage.getItem('books') || '[]');
            let booksToDisplay;

            // Nếu query gốc rỗng hoặc là "sach" (không phân biệt hoa thường), hiển thị tất cả
            if (!rawQuery || rawQuery.toLowerCase() === 'sach') {
                booksToDisplay = allBooks;
            } else {
                // Ngược lại, lọc bằng cách bỏ dấu cả dữ liệu và query
                booksToDisplay = allBooks.filter(book => {
                    const titleMatch = removeVietnameseTones(book.title).includes(query);
                    const authorMatch = removeVietnameseTones(book.author).includes(query);
                    const categoryMatch = book.category && removeVietnameseTones(book.category).includes(query);
                    
                    // Có thể bật lại log nếu cần
                    // if (book.category) {
                    //      console.log(`Kiểm tra sách ID ${book.id}: Category '${removeVietnameseTones(book.category)}' vs Query '${query}' -> Match: ${categoryMatch}`);
                    // }
                    
                    return titleMatch || authorMatch || categoryMatch;
                });
            }
            
            displaySearchResults(booksToDisplay);
        });
        
        // Tùy chọn: Tìm kiếm khi nhấn Enter trong ô input
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchButton.click(); // Giả lập click nút tìm kiếm
            }
        });
        
        // Tùy chọn: Xóa kết quả khi ô input trống
        searchInput.addEventListener('input', function() {
            // Chỉ xóa kết quả khi ô input thực sự trống
            if (searchInput.value.trim() === '') { 
                clearSearchResults();
            }
        });
    }

    // Khởi tạo trang
    try {
        const allBooks = await fetchBooks();
        if (allBooks && allBooks.length > 0) {
            displayBooks(allBooks, 'newBooksGrid');
            displayBooks(allBooks.slice().reverse(), 'bestSellersGrid');
            handleCategoryMenu();
        } else {
            throw new Error('Không có dữ liệu sách');
        }
    } catch (error) {
        console.warn('Lỗi khởi tạo trang:', error);
        Swal.fire({
            icon: 'warning',
            title: 'Thông báo',
            text: 'Đang tải dữ liệu sách từ nguồn dự phòng',
            showConfirmButton: false,
            timer: 1500
        });
    }
});