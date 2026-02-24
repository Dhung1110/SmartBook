document.addEventListener('DOMContentLoaded', function() {
    // 1. Kiểm tra đăng nhập và vai trò Manager
    const manager = JSON.parse(localStorage.getItem('staffUser') || sessionStorage.getItem('staffUser'));
    if (!manager || manager.role !== 'manager') {
        console.error('Truy cập bị từ chối: Không phải Manager hoặc chưa đăng nhập.');
        window.location.href = 'staff-login.html';
        return;
    }

    // 2. Lấy các phần tử DOM
    const accountForm = document.getElementById('accountForm');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    const logoutBtn = document.getElementById('logoutBtn');
    const managerNameDisplay = document.getElementById('managerName'); // ID cho tên trên header
    const userMenuBtn = document.getElementById('userMenuBtn'); // Thêm dòng này
    const dropdownMenu = document.querySelector('.dropdown-menu'); // Thêm dòng này
    // const managerAvatarDisplay = document.getElementById('managerAvatar'); // ID cho avatar nếu cần cập nhật

    // 3. Điền thông tin quản lý vào form và header
    function populateManagerInfo() {
        // Ưu tiên lấy thông tin mới nhất từ mảng staffUsers nếu có
        const staffList = JSON.parse(localStorage.getItem('staffUsers') || '[]'); 
        const currentManagerData = staffList.find(u => String(u.id) === String(manager.id)) || manager;

        if (currentManagerData) {
            fullNameInput.value = currentManagerData.name || ''; // Giả sử tên lưu là 'name'
            emailInput.value = currentManagerData.email || '';
            phoneInput.value = currentManagerData.phone || '';
            
            // Cập nhật header
            if (managerNameDisplay) {
                managerNameDisplay.textContent = currentManagerData.name || 'Quản lý';
            }
            // Cập nhật avatar nếu cần
            // if (managerAvatarDisplay && currentManagerData.avatar) {
            //     managerAvatarDisplay.src = currentManagerData.avatar;
            // }
        } else {
            // Nên chuyển về login nếu không tìm thấy dữ liệu manager
            console.error('Không tìm thấy dữ liệu quản lý.');
            logout(); // Thực hiện đăng xuất
        }
    }

    // 4. Xử lý dropdown menu (Thêm đoạn này)
    if (userMenuBtn && dropdownMenu) { 
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('userMenuBtn clicked on account page!'); 
            dropdownMenu.classList.toggle('show');
        });

        // Đóng dropdown khi click ra ngoài
        document.addEventListener('click', function(e) {
            if (dropdownMenu.classList.contains('show') && !userMenuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    } else {
        console.error('Không tìm thấy userMenuBtn hoặc dropdownMenu trên trang account!');
    }

    // 5. Xử lý hiện/ẩn mật khẩu
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.closest('.password-input').querySelector('input');
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            this.innerHTML = type === 'password' ? 
                '<i class="fas fa-eye"></i>' : 
                '<i class="fas fa-eye-slash"></i>';
        });
    });

    // 6. Xử lý submit form
    accountForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        updateManagerInfo();
    });

    // 7. Validate form
    function validateForm() {
        let isValid = true;
        // Validate required fields
        if (!fullNameInput.value.trim()) {
            showError('Vui lòng nhập họ tên'); isValid = false;
        }
        if (!emailInput.value.trim()) {
            showError('Vui lòng nhập email'); isValid = false;
        } else if (!isValidEmail(emailInput.value)) {
            showError('Email không hợp lệ'); isValid = false;
        }

        // Validate password if changing
        if (currentPasswordInput.value || newPasswordInput.value || confirmPasswordInput.value) {
             const staffList = JSON.parse(localStorage.getItem('staffUsers') || '[]');
             const currentManagerData = staffList.find(u => String(u.id) === String(manager.id)) || manager;

            if (!currentPasswordInput.value) {
                showError('Vui lòng nhập mật khẩu hiện tại'); isValid = false;
            }
             // Kiểm tra mật khẩu hiện tại với dữ liệu đã lưu
            else if (currentManagerData.password !== currentPasswordInput.value) {
                 showError('Mật khẩu hiện tại không đúng');
                 isValid = false;
            }

            if (!newPasswordInput.value) {
                showError('Vui lòng nhập mật khẩu mới'); isValid = false;
            } else if (newPasswordInput.value.length < 6) { // Ví dụ: yêu cầu độ dài tối thiểu
                 showError('Mật khẩu mới phải có ít nhất 6 ký tự'); isValid = false;
            }

            if (!confirmPasswordInput.value) {
                showError('Vui lòng xác nhận mật khẩu mới'); isValid = false;
            }
            else if (newPasswordInput.value !== confirmPasswordInput.value) {
                showError('Mật khẩu xác nhận không khớp'); isValid = false;
            }
        }
        return isValid;
    }

    // 8. Cập nhật thông tin quản lý
    function updateManagerInfo() {
        const staffList = JSON.parse(localStorage.getItem('staffUsers') || '[]');
        const managerIndex = staffList.findIndex(u => String(u.id) === String(manager.id));

        if (managerIndex !== -1) {
            // Dữ liệu quản lý hiện tại trong mảng
            const currentManagerInList = staffList[managerIndex];
            
            // Tạo object cập nhật
            const updatedManager = {
                ...currentManagerInList, // Giữ lại các trường cũ không thay đổi
                name: fullNameInput.value.trim(),
                email: emailInput.value.trim(),
                phone: phoneInput.value.trim(),
                // Cập nhật các trường khác nếu có
            };

            // Cập nhật mật khẩu nếu có
            if (newPasswordInput.value) {
                updatedManager.password = newPasswordInput.value;
            }

            // Cập nhật trong mảng staffList
            staffList[managerIndex] = updatedManager;
            localStorage.setItem('staffUsers', JSON.stringify(staffList));
            
            // Cập nhật thông tin đăng nhập hiện tại (quan trọng)
            if (localStorage.getItem('staffUser')) {
                localStorage.setItem('staffUser', JSON.stringify(updatedManager));
            } else if (sessionStorage.getItem('staffUser')) {
                sessionStorage.setItem('staffUser', JSON.stringify(updatedManager));
            }

            showSuccess('Cập nhật thông tin thành công');
            
            // Cập nhật lại tên trên header
            populateManagerInfo(); 

            // Reset form mật khẩu
            currentPasswordInput.value = '';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
        } else {
             // Trường hợp này không nên xảy ra nếu checkAuth hoạt động đúng
            showError('Lỗi: Không tìm thấy thông tin quản lý để cập nhật.');
            console.error('Không tìm thấy manager trong staffUsers với ID:', manager.id);
        }
    }
    
    // 9. Xử lý đăng xuất
    function logout() {
        localStorage.removeItem('staffUser');
        sessionStorage.removeItem('staffUser');
        window.location.href = 'staff-login.html';
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }

    // 10. Hàm tiện ích (validate, thông báo)
    function showError(message) {
        Swal.fire({ icon: 'error', title: 'Lỗi', text: message, confirmButtonColor: '#3498db' });
    }
    function showSuccess(message) {
        Swal.fire({ icon: 'success', title: 'Thành công', text: message, confirmButtonColor: '#3498db' });
    }
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // 11. Khởi tạo form khi tải trang
    populateManagerInfo();
}); 