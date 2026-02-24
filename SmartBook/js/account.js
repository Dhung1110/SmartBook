document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    const user = JSON.parse(localStorage.getItem('loginUser') || sessionStorage.getItem('loginUser'));
    console.log('Login user:', user);
    
   

    // Lấy các phần tử form
    const accountForm = document.getElementById('accountForm');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const birthdayInput = document.getElementById('birthday');
    const genderInputs = document.getElementsByName('gender');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');

    // Điền thông tin người dùng vào form
    function populateUserInfo() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        console.log('All users:', users);
        
        // Tìm người dùng hiện tại
        const currentUser = users.find(u => String(u.id) === String(user.id));
        console.log('Found user:', currentUser);
        
        if (currentUser) {
            console.log('Populating user info...');
            fullNameInput.value = currentUser.fullName || currentUser.fullname || '';
            emailInput.value = currentUser.email || '';
            phoneInput.value = currentUser.phone || '';
            addressInput.value = currentUser.address || '';
            birthdayInput.value = currentUser.birthday || '';
            
            if (currentUser.gender) {
                const genderInput = Array.from(genderInputs)
                    .find(input => input.value === currentUser.gender);
                if (genderInput) genderInput.checked = true;
            }
        } else {
            console.log('User not found in users array, using login data');
            // Nếu không tìm thấy trong mảng users, sử dụng thông tin từ user đăng nhập
            fullNameInput.value = user.fullName || user.fullname || '';
            emailInput.value = user.email || '';
            phoneInput.value = user.phone || '';
            addressInput.value = user.address || '';
            birthdayInput.value = user.birthday || '';
            
            if (user.gender) {
                const genderInput = Array.from(genderInputs)
                    .find(input => input.value === user.gender);
                if (genderInput) genderInput.checked = true;
            }
        }
    }

    // Xử lý hiện/ẩn mật khẩu
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            this.innerHTML = type === 'password' ? 
                '<i class="fas fa-eye"></i>' : 
                '<i class="fas fa-eye-slash"></i>';
        });
    });

    // Xử lý submit form
    accountForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        // Cập nhật thông tin người dùng
        updateUserInfo();
    });

    // Validate form
    function validateForm() {
        let isValid = true;

        // Validate required fields
        if (!fullNameInput.value.trim()) {
            showError('Vui lòng nhập họ tên');
            isValid = false;
        }

        if (!emailInput.value.trim()) {
            showError('Vui lòng nhập email');
            isValid = false;
        } else if (!isValidEmail(emailInput.value)) {
            showError('Email không hợp lệ');
            isValid = false;
        }

        if (!phoneInput.value.trim()) {
            showError('Vui lòng nhập số điện thoại');
            isValid = false;
        } else if (!isValidPhone(phoneInput.value)) {
            showError('Số điện thoại không hợp lệ');
            isValid = false;
        }

        // Validate password if changing
        if (currentPasswordInput.value || newPasswordInput.value || confirmPasswordInput.value) {
            if (!currentPasswordInput.value) {
                showError('Vui lòng nhập mật khẩu hiện tại');
                isValid = false;
            }

            if (!newPasswordInput.value) {
                showError('Vui lòng nhập mật khẩu mới');
                isValid = false;
            }

            if (!confirmPasswordInput.value) {
                showError('Vui lòng xác nhận mật khẩu mới');
                isValid = false;
            }

            if (newPasswordInput.value !== confirmPasswordInput.value) {
                showError('Mật khẩu xác nhận không khớp');
                isValid = false;
            }

            // Kiểm tra mật khẩu hiện tại
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const currentUser = users.find(u => String(u.id) === String(user.id));
            
            if (currentUser) {
                // Nếu tìm thấy trong mảng users
                if (currentUser.password !== currentPasswordInput.value) {
                    showError('Mật khẩu hiện tại không đúng');
                    isValid = false;
                }
            } else if (user.password !== currentPasswordInput.value) {
                // Nếu không tìm thấy trong mảng users, kiểm tra mật khẩu từ đối tượng user đang đăng nhập
                showError('Mật khẩu hiện tại không đúng');
                isValid = false;
            }
        }

        return isValid;
    }

    // Cập nhật thông tin người dùng
    function updateUserInfo() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => String(u.id) === String(user.id));
        console.log('Updating user at index:', userIndex);

        if (userIndex !== -1) {
            // Cập nhật thông tin cơ bản
            const updatedUser = {
                ...users[userIndex],
                fullName: fullNameInput.value.trim(),
                fullname: fullNameInput.value.trim(),
                email: emailInput.value.trim(),
                phone: phoneInput.value.trim(),
                address: addressInput.value.trim(),
                birthday: birthdayInput.value,
                gender: Array.from(genderInputs).find(input => input.checked)?.value
            };

            // Cập nhật mật khẩu nếu có thay đổi
            if (newPasswordInput.value) {
                updatedUser.password = newPasswordInput.value;
            }

            users[userIndex] = updatedUser;
            console.log('Updated user:', updatedUser);

            // Lưu vào localStorage
            localStorage.setItem('users', JSON.stringify(users));
            
            // Cập nhật thông tin đăng nhập hiện tại
            if (localStorage.getItem('loginUser')) {
                localStorage.setItem('loginUser', JSON.stringify(updatedUser));
            } else if (sessionStorage.getItem('loginUser')) {
                sessionStorage.setItem('loginUser', JSON.stringify(updatedUser));
            }

            showSuccess('Cập nhật thông tin thành công');
            
            // Reset form mật khẩu
            currentPasswordInput.value = '';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
        } else {
            console.log('User not found for update');
            showError('Không thể cập nhật thông tin. Vui lòng thử lại sau.');
        }
    }

    // Hiển thị thông báo lỗi
    function showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: message,
            confirmButtonText: 'Đóng',
            confirmButtonColor: '#3498db'
        });
    }

    // Hiển thị thông báo thành công
    function showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: message,
            confirmButtonText: 'Đóng',
            confirmButtonColor: '#3498db'
        });
    }

    // Validate email
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Validate phone
    function isValidPhone(phone) {
        return /^[0-9]{10}$/.test(phone);
    }

    // Khởi tạo form
    console.log('Initializing form...');
    populateUserInfo();
}); 