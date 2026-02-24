function logout() {
    // Xóa thông tin đăng nhập khỏi localStorage và sessionStorage
    localStorage.removeItem('loginUser');
    sessionStorage.removeItem('loginUser');

    // Chuyển hướng về trang đăng nhập
    window.location.href = '/login.html';
}

// Thêm sự kiện click cho nút đăng xuất
document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.querySelector('.logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

    // Kiểm tra trạng thái đăng nhập
    function checkAuth() {
        const loginUser = JSON.parse(localStorage.getItem('loginUser') || sessionStorage.getItem('loginUser'));
        if (!loginUser) {
            // Nếu chưa đăng nhập và đang ở trang cần xác thực, chuyển về trang đăng nhập
            if (window.location.pathname.includes('/admin/') || 
                window.location.pathname.includes('/staff/')) {
                window.location.href = '/login.html';
            }
        } else {
            // Hiển thị tên người dùng nếu có phần tử username-display
            const usernameDisplay = document.querySelector('.username-display');
            if (usernameDisplay) {
                usernameDisplay.textContent = loginUser.fullname;
            }

            // Kiểm tra quyền truy cập
            const currentPath = window.location.pathname;
            if (currentPath.includes('/admin/') && loginUser.role !== 'admin') {
                alert('Bạn không có quyền truy cập trang này!');
                window.location.href = '/login.html';
            } else if (currentPath.includes('/staff/') && loginUser.role !== 'staff') {
                alert('Bạn không có quyền truy cập trang này!');
                window.location.href = '/login.html';
            }
        }
    }

    // Kiểm tra xác thực khi tải trang
    checkAuth();
}); 