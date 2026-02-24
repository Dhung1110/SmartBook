document.addEventListener('DOMContentLoaded', async function() {
    await loadCart();
    setupEventListeners();
});

async function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartDiv = document.getElementById('emptyCart');
    const checkoutButton = document.getElementById('checkoutButton');

    if (!cart.length) {
        cartItemsContainer.parentElement.style.display = 'none';
        emptyCartDiv.style.display = 'block';
        return;
    }

    try {
        const books = await fetchBooks();
        let totalItems = 0;
        let subtotal = 0;

        const itemsHTML = cart.map(item => {
            const book = books.find(b => b.id === item.bookId);
            if (!book) return '';

            totalItems += item.quantity;
            const itemTotal = book.price * item.quantity;
            subtotal += itemTotal;

            return `
                <div class="cart-item" data-id="${book.id}">
                    <label class="checkbox-container">
                        <input type="checkbox" class="item-checkbox" data-id="${book.id}" data-price="${itemTotal}">
                        <span class="checkmark"></span>
                    </label>
                    <div class="item-image">
                        <img src="${book.image}" alt="${book.title}" 
                             onerror="this.src='images/book-placeholder.jpg'">
                    </div>
                    <div class="item-details">
                        <h4 class="item-title">${book.title}</h4>
                        <div class="item-quantity">
                            <button class="quantity-btn minus" onclick="updateQuantity(${book.id}, -1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" class="quantity-input" value="${item.quantity}" 
                                   min="1" max="99" onchange="updateQuantityInput(${book.id}, this.value)">
                            <button class="quantity-btn plus" onclick="updateQuantity(${book.id}, 1)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="item-price">${formatCurrency(itemTotal)}</div>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${book.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }).join('');

        cartItemsContainer.innerHTML = `
            <div class="select-all">
                <label class="checkbox-container">
                    <input type="checkbox" id="selectAllItems">
                    <span class="checkmark"></span>
                    Chọn tất cả
                </label>
            </div>
            ${itemsHTML}
        `;
        
        // Cập nhật tổng kết
        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('subtotal').textContent = formatCurrency(subtotal);
        
        // Tính phí vận chuyển (miễn phí cho đơn > 200,000đ)
        const shippingFee = subtotal >= 200000 ? 0 : 20000;
        document.getElementById('shippingFee').textContent = formatCurrency(shippingFee);
        
        // Tổng cộng
        const total = subtotal + shippingFee;
        document.getElementById('totalAmount').textContent = formatCurrency(total);

        // Kích hoạt nút thanh toán
        checkoutButton.disabled = true;
        updateSelectedItems();

    } catch (error) {
        console.error('Lỗi khi tải giỏ hàng:', error);
        Swal.fire({
            icon: 'error',
            title: 'Có lỗi xảy ra',
            text: 'Không thể tải thông tin giỏ hàng. Vui lòng thử lại sau.'
        });
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

function setupEventListeners() {
    // Xử lý chọn tất cả
    document.addEventListener('click', function(e) {
        if (e.target.id === 'selectAllItems') {
            const checkboxes = document.querySelectorAll('.item-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
            updateSelectedItems();
        }
        
        if (e.target.classList.contains('item-checkbox')) {
            updateSelectedItems();
            updateSelectAllCheckbox();
        }
    });

    // Xử lý nút thanh toán
    document.getElementById('checkoutButton').addEventListener('click', function() {
        const selectedItems = getSelectedItems();
        if (selectedItems.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Chưa chọn sản phẩm',
                text: 'Vui lòng chọn ít nhất một sản phẩm để mua hàng',
                confirmButtonText: 'Đã hiểu'
            });
            return;
        }

        // Lưu các sản phẩm đã chọn vào localStorage
        localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
        // Chuyển đến trang thanh toán
        window.location.href = 'cart-checkout.html';
    });
}

function updateSelectedItems() {
    const selectedCheckboxes = document.querySelectorAll('.item-checkbox:checked');
    const selectedCount = selectedCheckboxes.length;
    let selectedTotal = 0;

    selectedCheckboxes.forEach(checkbox => {
        selectedTotal += parseFloat(checkbox.dataset.price);
    });

    document.getElementById('selectedItems').textContent = selectedCount;
    document.getElementById('selectedCount').textContent = selectedCount;
    
    // Cập nhật tổng tiền và phí vận chuyển dựa trên sản phẩm đã chọn
    document.getElementById('subtotal').textContent = formatCurrency(selectedTotal);
    const shippingFee = selectedTotal >= 200000 ? 0 : (selectedTotal > 0 ? 20000 : 0);
    document.getElementById('shippingFee').textContent = formatCurrency(shippingFee);
    document.getElementById('totalAmount').textContent = formatCurrency(selectedTotal + shippingFee);

    // Kích hoạt/vô hiệu hóa nút thanh toán
    document.getElementById('checkoutButton').disabled = selectedCount === 0;
}

function updateSelectAllCheckbox() {
    const totalCheckboxes = document.querySelectorAll('.item-checkbox').length;
    const selectedCheckboxes = document.querySelectorAll('.item-checkbox:checked').length;
    const selectAllCheckbox = document.getElementById('selectAllItems');
    
    selectAllCheckbox.checked = totalCheckboxes === selectedCheckboxes;
    selectAllCheckbox.indeterminate = selectedCheckboxes > 0 && selectedCheckboxes < totalCheckboxes;
}

function getSelectedItems() {
    const selectedCheckboxes = document.querySelectorAll('.item-checkbox:checked');
    return Array.from(selectedCheckboxes).map(checkbox => ({
        id: parseInt(checkbox.dataset.id),
        price: parseFloat(checkbox.dataset.price)
    }));
}

function updateQuantity(bookId, change) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemIndex = cart.findIndex(item => item.bookId === bookId);
    
    if (itemIndex === -1) return;
    
    const newQuantity = cart[itemIndex].quantity + change;
    if (newQuantity < 1 || newQuantity > 99) return;
    
    cart[itemIndex].quantity = newQuantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

function updateQuantityInput(bookId, value) {
    const quantity = parseInt(value);
    if (isNaN(quantity) || quantity < 1 || quantity > 99) return;
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemIndex = cart.findIndex(item => item.bookId === bookId);
    
    if (itemIndex === -1) return;
    
    cart[itemIndex].quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

function removeFromCart(bookId) {
    Swal.fire({
        title: 'Xác nhận xóa',
        text: 'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#e74c3c'
    }).then((result) => {
        if (result.isConfirmed) {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const newCart = cart.filter(item => item.bookId !== bookId);
            localStorage.setItem('cart', JSON.stringify(newCart));
            loadCart();

            // Hiển thị thông báo xóa thành công
            Swal.fire({
                icon: 'success',
                title: 'Đã xóa sản phẩm',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}