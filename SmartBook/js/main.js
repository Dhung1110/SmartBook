document.addEventListener('DOMContentLoaded', function() {
    const guestLinks = document.querySelector('.guest-links');
    const userLinks = document.querySelector('.user-links');
    const usernameDisplay = document.querySelector('.username-display');
    const userGreeting = document.querySelector('.user-greeting');

    // Kiểm tra trạng thái đăng nhập
    function checkLoginStatus() {
        const loginUser = JSON.parse(localStorage.getItem('loginUser') || sessionStorage.getItem('loginUser'));
        
        if (loginUser) {
            // Nếu là admin hoặc staff
            if (loginUser.role === 'admin' || loginUser.role === 'staff') {
                // Chuyển hướng đến trang admin nếu đang ở giao diện khách hàng
                if (!window.location.pathname.includes('/admin/')) {
                    window.location.href = 'admin/dashboard.html';
                    return;
                }
            } else {
                // Nếu là khách hàng thông thường
                // Hiển thị menu khách hàng
                guestLinks.style.display = 'none';
                userLinks.style.display = 'block';
                usernameDisplay.textContent = loginUser.fullname;
                
                // Nếu khách hàng cố gắng truy cập trang admin
                if (window.location.pathname.includes('/admin/')) {
                    window.location.href = '../index.html';
                }
            }
        } else {
            // Chưa đăng nhập
            guestLinks.style.display = 'block';
            userLinks.style.display = 'none';
            
            // Nếu đang ở trang admin mà chưa đăng nhập, chuyển về trang login
            if (window.location.pathname.includes('/admin/')) {
                window.location.href = '../login.html';
            }
        }
    }

    // Xử lý sự kiện click vào user greeting
    if (userGreeting) {
        userGreeting.addEventListener('click', function(e) {
            const dropdown = this.querySelector('.user-dropdown');
            if (e.target === this || e.target === usernameDisplay) {
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            }
        });

        // Đóng dropdown khi click ra ngoài
        document.addEventListener('click', function(e) {
            if (!userGreeting.contains(e.target)) {
                userGreeting.querySelector('.user-dropdown').style.display = 'none';
            }
        });
    }

    // Kiểm tra trạng thái đăng nhập khi tải trang
    checkLoginStatus();

    // Quản lý các chức năng được bảo vệ
    const protectedFeatures = document.querySelectorAll('.protected-feature');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Kiểm tra nếu người dùng đã đăng nhập
    if (currentUser) {
        protectedFeatures.forEach(feature => {
            feature.classList.add('active');
        });
    }

    // Thêm sự kiện click cho các chức năng được bảo vệ
    protectedFeatures.forEach(feature => {
        feature.addEventListener('click', function(e) {
            const loginUser = JSON.parse(localStorage.getItem('loginUser') || sessionStorage.getItem('loginUser'));
            if (!loginUser) {
                e.preventDefault();
                e.stopPropagation();
                
                // Chuyển hướng đến trang đăng nhập
                window.location.replace('login.html');
            }
        });
    });
});

// Thêm styles cho thông báo đăng nhập
const style = document.createElement('style');
style.textContent = `
    .login-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }

    .login-notification p {
        margin: 0 0 10px 0;
        color: #333;
    }

    .login-notification .login-btn {
        display: inline-block;
        padding: 8px 15px;
        background: #3498db;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        transition: background 0.3s;
    }

    .login-notification .login-btn:hover {
        background: #2980b9;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

document.head.appendChild(style); 