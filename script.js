// Data Storage
let businessData = JSON.parse(localStorage.getItem('businessData')) || [];
let editMode = false;
let editingId = null;

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    loadData();
    updateStats();

    // Form submission
    document.getElementById('dataForm').addEventListener('submit', handleFormSubmit);

    // Real-time total calculation
    const sizeInputs = document.querySelectorAll('.size-input input');
    sizeInputs.forEach(input => {
        input.addEventListener('input', calculateFormTotal);
    });

    // Search functionality
    document.getElementById('searchInput').addEventListener('input', handleSearch);

    // Close modal on outside click
    document.getElementById('editModal').addEventListener('click', function (e) {
        if (e.target === this) {
            closeEditModal();
        }
    });

    // MAHIMA field auto-formatting
    document.getElementById('mahimaCode').addEventListener('input', formatMahimaField);
    document.getElementById('mahimaCode').addEventListener('blur', formatMahimaField);

    // Last order history functionality
    setupLastOrderHistory();
});

// Handle Form Submission
function handleFormSubmit(e) {
    e.preventDefault();

    // Get product image if uploaded (use compressed version)
    const imagePreview = document.getElementById('imagePreview');
    let productImage = null;

    if (imagePreview.dataset.compressedImage) {
        // Use the compressed image from preview
        productImage = imagePreview.dataset.compressedImage;
        saveFormData(productImage);
    } else if (editMode) {
        // Check if editing and image already exists
        const existingItem = businessData.find(item => item.id === editingId);
        productImage = existingItem ? existingItem.productImage : null;
        saveFormData(productImage);
    } else {
        saveFormData(null);
    }
}

function saveFormData(productImage) {
    const formData = {
        id: editMode ? editingId : Date.now(),
        poNo: document.getElementById('poNo').value,
        skuNo: document.getElementById('skuNo').value,
        buyerCode: document.getElementById('buyerCode').value,
        mahimaCode: document.getElementById('mahimaCode').value,
        color: document.getElementById('color').value,
        department: document.getElementById('department').value,
        exFactory: document.getElementById('exFactory').value,
        remark: document.getElementById('remark').value,
        productImage: productImage,
        sizes: {
            size2: parseInt(document.getElementById('size2').value) || 0,
            size4: parseInt(document.getElementById('size4').value) || 0,
            size6: parseInt(document.getElementById('size6').value) || 0,
            size8: parseInt(document.getElementById('size8').value) || 0,
            size10: parseInt(document.getElementById('size10').value) || 0,
            size12: parseInt(document.getElementById('size12').value) || 0,
            size14: parseInt(document.getElementById('size14').value) || 0,
            size16: parseInt(document.getElementById('size16').value) || 0,
            size18: parseInt(document.getElementById('size18').value) || 0,
            size20: parseInt(document.getElementById('size20').value) || 0,
            size22: parseInt(document.getElementById('size22').value) || 0,
            size24: parseInt(document.getElementById('size24').value) || 0,
            size26: parseInt(document.getElementById('size26').value) || 0,
            size28: parseInt(document.getElementById('size28').value) || 0,
            size30: parseInt(document.getElementById('size30').value) || 0,
        }
    };

    // Calculate total
    formData.total = Object.values(formData.sizes).reduce((sum, val) => sum + val, 0);

    if (editMode) {
        // Update existing order
        const index = businessData.findIndex(item => item.id === editingId);
        if (index !== -1) {
            businessData[index] = formData;
        }
        showToast('Order updated successfully! ✅');
        editMode = false;
        editingId = null;

        // Update button text
        const submitBtn = document.querySelector('.btn-large');
        submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Add Order';
    } else {
        // Add new order
        businessData.push(formData);
        showToast('Order added successfully! 🎉');
    }

    // Save to localStorage
    localStorage.setItem('businessData', JSON.stringify(businessData));

    // Update UI
    loadData();
    updateStats();

    // Reset form
    resetForm();
}

// Calculate Form Total
function calculateFormTotal() {
    const sizeInputs = document.querySelectorAll('.size-input input');
    let total = 0;

    sizeInputs.forEach(input => {
        total += parseInt(input.value) || 0;
    });

    document.getElementById('formTotal').textContent = total;
}

// Format MAHIMA Field
function formatMahimaField(e) {
    let value = e.target.value.trim();

    // If field is empty, don't add #
    if (value === '' || value === '#') {
        e.target.value = '';
        return;
    }

    // Remove existing # if present at start
    if (value.startsWith('#')) {
        value = value.substring(1);
    }

    // Add # prefix if there's content
    if (value.length > 0) {
        e.target.value = '#' + value;
    }
}

// Image compression helper
function compressImage(file, maxWidth, maxHeight, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to base64 with reduced quality
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            callback(compressedBase64);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Image Preview Functions
function previewImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('imagePreview');

    if (file) {
        compressImage(file, 300, 300, function(compressedImage) {
            preview.innerHTML = `
                <img src="${compressedImage}" alt="Product Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
                <button type="button" class="remove-image-btn" onclick="removeImage()">
                    <i class="fas fa-times"></i> Remove Image
                </button>
            `;
            preview.style.display = 'block';
            preview.dataset.compressedImage = compressedImage;
        });
    }
}

function removeImage() {
    document.getElementById('productImage').value = '';
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    preview.style.display = 'none';
    delete preview.dataset.compressedImage;
}

function previewEditImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('editImagePreview');

    if (file) {
        compressImage(file, 300, 300, function(compressedImage) {
            preview.innerHTML = `
                <img src="${compressedImage}" alt="Product Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
                <button type="button" class="remove-image-btn" onclick="removeEditImage()">
                    <i class="fas fa-times"></i> Remove Image
                </button>
            `;
            preview.style.display = 'block';
            preview.dataset.compressedImage = compressedImage;
        });
    }
}

function removeEditImage() {
    document.getElementById('editProductImage').value = '';
    const preview = document.getElementById('editImagePreview');
    preview.innerHTML = '';
    preview.style.display = 'none';
    delete preview.dataset.compressedImage;
}

// Show Image in Modal
function showImageModal(imageSrc) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 3000;
        cursor: pointer;
    `;

    // Create image container
    const imgContainer = document.createElement('div');
    imgContainer.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        background: white;
        padding: 20px;
        border-radius: 8px;
    `;

    const img = document.createElement('img');
    img.src = imageSrc;
    img.style.cssText = `
        max-width: 100%;
        max-height: 80vh;
        display: block;
    `;

    imgContainer.appendChild(img);
    overlay.appendChild(imgContainer);
    document.body.appendChild(overlay);

    // Close on click
    overlay.addEventListener('click', function() {
        document.body.removeChild(overlay);
    });
}

// Load Data to Table
function loadData() {
    const tableBody = document.getElementById('tableBody');

    if (businessData.length === 0) {
        tableBody.innerHTML = `
            <tr class="empty-state">
                <td colspan="27">
                    <div class="empty-message">
                        <i class="fas fa-inbox"></i>
                        <p>No data yet. Add your first order above!</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = businessData.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${item.poNo}</td>
            <td>${item.skuNo}</td>
            <td>${item.buyerCode}</td>
            <td>${item.mahimaCode}</td>
            <td>${item.color}</td>
            <td>${item.department}</td>
            <td>${formatDate(item.exFactory)}</td>
            <td>${item.sizes.size2 || '-'}</td>
            <td>${item.sizes.size4 || '-'}</td>
            <td>${item.sizes.size6 || '-'}</td>
            <td>${item.sizes.size8 || '-'}</td>
            <td>${item.sizes.size10 || '-'}</td>
            <td>${item.sizes.size12 || '-'}</td>
            <td>${item.sizes.size14 || '-'}</td>
            <td>${item.sizes.size16 || '-'}</td>
            <td>${item.sizes.size18 || '-'}</td>
            <td>${item.sizes.size20 || '-'}</td>
            <td>${item.sizes.size22 || '-'}</td>
            <td>${item.sizes.size24 || '-'}</td>
            <td>${item.sizes.size26 || '-'}</td>
            <td>${item.sizes.size28 || '-'}</td>
            <td>${item.sizes.size30 || '-'}</td>
            <td class="total-column"><strong>${item.total}</strong></td>
            <td>${item.remark || '-'}</td>
            <td>
                ${item.productImage ? `<img src="${item.productImage}" alt="Product" style="max-width: 50px; max-height: 50px; border-radius: 4px; cursor: pointer;" onclick="showImageModal('${item.productImage}')">` : '-'}
            </td>
            <td>
                <button class="action-btn edit" onclick="openEditModal(${item.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteRow(${item.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Update Statistics
function updateStats() {
    const totalOrders = businessData.length;
    const totalItems = businessData.reduce((sum, item) => sum + item.total, 0);
    const uniqueColors = new Set(businessData.map(item => item.color)).size;
    const totalUnits = totalItems;

    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('uniqueColors').textContent = uniqueColors;
    document.getElementById('totalUnits').textContent = totalUnits;
}

// Delete Row
function deleteRow(id) {
    if (confirm('Are you sure you want to delete this order?')) {
        businessData = businessData.filter(item => item.id !== id);
        localStorage.setItem('businessData', JSON.stringify(businessData));
        loadData();
        updateStats();
        showToast('Order deleted successfully!');
    }
}

// Open Edit Modal
function openEditModal(id) {
    const item = businessData.find(data => data.id === id);
    if (!item) return;

    // Populate modal with current data
    document.getElementById('editPoNo').value = item.poNo;
    document.getElementById('editSkuNo').value = item.skuNo;
    document.getElementById('editBuyerCode').value = item.buyerCode;
    document.getElementById('editMahimaCode').value = item.mahimaCode;
    document.getElementById('editColor').value = item.color;
    document.getElementById('editDepartment').value = item.department;
    document.getElementById('editExFactory').value = item.exFactory;
    document.getElementById('editRemark').value = item.remark || '';

    // Show existing product image if available
    const editImagePreview = document.getElementById('editImagePreview');
    if (item.productImage) {
        editImagePreview.innerHTML = `
            <img src="${item.productImage}" alt="Product Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
            <button type="button" class="remove-image-btn" onclick="removeEditImage()">
                <i class="fas fa-times"></i> Remove Image
            </button>
        `;
        editImagePreview.style.display = 'block';
    } else {
        editImagePreview.innerHTML = '';
        editImagePreview.style.display = 'none';
    }

    // Populate sizes
    document.getElementById('editSize2').value = item.sizes.size2 || '';
    document.getElementById('editSize4').value = item.sizes.size4 || '';
    document.getElementById('editSize6').value = item.sizes.size6 || '';
    document.getElementById('editSize8').value = item.sizes.size8 || '';
    document.getElementById('editSize10').value = item.sizes.size10 || '';
    document.getElementById('editSize12').value = item.sizes.size12 || '';
    document.getElementById('editSize14').value = item.sizes.size14 || '';
    document.getElementById('editSize16').value = item.sizes.size16 || '';
    document.getElementById('editSize18').value = item.sizes.size18 || '';
    document.getElementById('editSize20').value = item.sizes.size20 || '';
    document.getElementById('editSize22').value = item.sizes.size22 || '';
    document.getElementById('editSize24').value = item.sizes.size24 || '';
    document.getElementById('editSize26').value = item.sizes.size26 || '';
    document.getElementById('editSize28').value = item.sizes.size28 || '';
    document.getElementById('editSize30').value = item.sizes.size30 || '';

    // Calculate and show total
    calculateEditFormTotal();

    // Store the ID being edited
    document.getElementById('editModal').dataset.editId = id;

    // Show modal
    document.getElementById('editModal').style.display = 'flex';
}

// Close Edit Modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Calculate Edit Form Total
function calculateEditFormTotal() {
    const sizeInputs = document.querySelectorAll('.edit-size-input input');
    let total = 0;

    sizeInputs.forEach(input => {
        total += parseInt(input.value) || 0;
    });

    document.getElementById('editFormTotal').textContent = total;
}

// Save Edited Data
function saveEditedData() {
    const id = parseInt(document.getElementById('editModal').dataset.editId);
    const index = businessData.findIndex(item => item.id === id);

    if (index === -1) return;

    // Get compressed image from preview or keep existing
    const editImagePreview = document.getElementById('editImagePreview');
    const existingImage = businessData[index].productImage;
    let productImage;

    if (editImagePreview.dataset.compressedImage) {
        // New compressed image uploaded
        productImage = editImagePreview.dataset.compressedImage;
    } else if (editImagePreview.innerHTML.trim() === '') {
        // Image was removed
        productImage = null;
    } else {
        // Keep existing image
        productImage = existingImage;
    }

    saveEditedDataWithImage(id, index, productImage);
}

function saveEditedDataWithImage(id, index, productImage) {
    const updatedData = {
        id: id,
        poNo: document.getElementById('editPoNo').value,
        skuNo: document.getElementById('editSkuNo').value,
        buyerCode: document.getElementById('editBuyerCode').value,
        mahimaCode: document.getElementById('editMahimaCode').value,
        color: document.getElementById('editColor').value,
        department: document.getElementById('editDepartment').value,
        exFactory: document.getElementById('editExFactory').value,
        remark: document.getElementById('editRemark').value,
        productImage: productImage,
        sizes: {
            size2: parseInt(document.getElementById('editSize2').value) || 0,
            size4: parseInt(document.getElementById('editSize4').value) || 0,
            size6: parseInt(document.getElementById('editSize6').value) || 0,
            size8: parseInt(document.getElementById('editSize8').value) || 0,
            size10: parseInt(document.getElementById('editSize10').value) || 0,
            size12: parseInt(document.getElementById('editSize12').value) || 0,
            size14: parseInt(document.getElementById('editSize14').value) || 0,
            size16: parseInt(document.getElementById('editSize16').value) || 0,
            size18: parseInt(document.getElementById('editSize18').value) || 0,
            size20: parseInt(document.getElementById('editSize20').value) || 0,
            size22: parseInt(document.getElementById('editSize22').value) || 0,
            size24: parseInt(document.getElementById('editSize24').value) || 0,
            size26: parseInt(document.getElementById('editSize26').value) || 0,
            size28: parseInt(document.getElementById('editSize28').value) || 0,
            size30: parseInt(document.getElementById('editSize30').value) || 0,
        }
    };

    // Calculate total
    updatedData.total = Object.values(updatedData.sizes).reduce((sum, val) => sum + val, 0);

    // Update the data
    businessData[index] = updatedData;

    // Save to localStorage
    localStorage.setItem('businessData', JSON.stringify(businessData));

    // Update UI
    loadData();
    updateStats();

    // Close modal
    closeEditModal();

    // Show success message
    showToast('Order updated successfully! ✅');
}

// Clear All Data
function clearAllData() {
    if (confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
        businessData = [];
        localStorage.removeItem('businessData');
        loadData();
        updateStats();
        showToast('All data cleared!');
    }
}

// Setup Last Order History
function setupLastOrderHistory() {
    // Last order history functionality is available via form button
}

// Show Last Order History
function showLastOrderHistory() {
    const recentOrders = businessData.slice(-5).reverse(); // Last 5 orders

    if (recentOrders.length === 0) {
        alert('No order history available.');
        return;
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'historyOverlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; align-items: center; justify-content: center;';
    overlay.onclick = closeHistoryModal;

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = 'background: white; padding: 25px; border-radius: 15px; max-width: 650px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); z-index: 2001; position: relative;';
    modalContent.onclick = (e) => e.stopPropagation(); // Prevent closing when clicking inside

    let contentHtml = `
        <h3 style="color: #6366f1; margin-bottom: 20px; font-size: 1.5rem; display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-history"></i> Last 5 Orders
        </h3>
        <div style="margin-bottom: 20px;">
    `;

    recentOrders.forEach((order, index) => {
        const imageHtml = order.productImage 
            ? `<img src="${order.productImage}" alt="Product" class="order-history-img">` 
            : `<div class="order-history-no-img">No<br>Image</div>`;
        
        contentHtml += `
            <div class="order-history-card">
                <!-- Row 1: Date at top right -->
                <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
                    <span class="order-history-date">
                        <i class="fas fa-calendar-alt" style="margin-right: 3px;"></i>${formatDate(order.exFactory)}
                    </span>
                </div>
                
                <!-- Row 2: Image and PO Number -->
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="flex-shrink: 0;">
                        ${imageHtml}
                    </div>
                    <div style="flex: 1;">
                        <strong class="order-history-po">PO: ${order.poNo}</strong>
                    </div>
                </div>
                
                <!-- Row 3: All Details -->
                <div class="order-history-details">
                    <div style="font-size: 0.9rem; color: #475569; line-height: 1.9; display: grid; gap: 6px;">
                        <div><strong style="color: #1e293b;">SKU:</strong> <span style="color: #6366f1; font-weight: 600;">${order.skuNo}</span> | <strong style="color: #1e293b;">Buyer:</strong> ${order.buyerCode} | <strong style="color: #1e293b;">MAHIMA:</strong> ${order.mahimaCode}</div>
                        <div><strong style="color: #1e293b;">Color:</strong> ${order.color} | <strong style="color: #1e293b;">Department:</strong> ${order.department} | <strong style="color: #1e293b;">Total:</strong> <span style="color: #10b981; font-weight: 700;">${order.total} units</span></div>
                    </div>
                </div>
                
                <!-- Row 4: Button -->
                <button onclick="fillFormWithHistory(${order.id})" class="order-history-btn">
                    <i class="fas fa-check-circle"></i> Click to use as template
                </button>
            </div>
        `;
    });

    contentHtml += `
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="closeHistoryModal()" style="padding: 12px 24px; background: #64748b; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s;" 
                onmouseover="this.style.background='#475569'" 
                onmouseout="this.style.background='#64748b'">
                <i class="fas fa-times"></i> Close
            </button>
        </div>
    `;

    modalContent.innerHTML = contentHtml;
    overlay.appendChild(modalContent);
    document.body.appendChild(overlay);
}

// Fill Form with History Data
function fillFormWithHistory(orderId) {
    const order = businessData.find(item => item.id === orderId);
    if (!order) return;

    // Fill basic information (excluding unique fields like PO number)
    document.getElementById('skuNo').value = order.skuNo;
    document.getElementById('buyerCode').value = order.buyerCode;
    document.getElementById('mahimaCode').value = order.mahimaCode;
    document.getElementById('color').value = order.color;
    document.getElementById('department').value = order.department;
    document.getElementById('remark').value = order.remark || '';

    // Fill product image if available
    const imagePreview = document.getElementById('imagePreview');
    if (order.productImage) {
        imagePreview.innerHTML = `
            <img src="${order.productImage}" alt="Product Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px;">
            <button type="button" class="remove-image-btn" onclick="removeImage()">
                <i class="fas fa-times"></i> Remove Image
            </button>
        `;
        imagePreview.style.display = 'block';
        imagePreview.dataset.compressedImage = order.productImage;
    } else {
        removeImage();
    }

    // Fill size quantities
    document.getElementById('size2').value = order.sizes.size2 || '';
    document.getElementById('size4').value = order.sizes.size4 || '';
    document.getElementById('size6').value = order.sizes.size6 || '';
    document.getElementById('size8').value = order.sizes.size8 || '';
    document.getElementById('size10').value = order.sizes.size10 || '';
    document.getElementById('size12').value = order.sizes.size12 || '';
    document.getElementById('size14').value = order.sizes.size14 || '';
    document.getElementById('size16').value = order.sizes.size16 || '';
    document.getElementById('size18').value = order.sizes.size18 || '';
    document.getElementById('size20').value = order.sizes.size20 || '';
    document.getElementById('size22').value = order.sizes.size22 || '';
    document.getElementById('size24').value = order.sizes.size24 || '';
    document.getElementById('size26').value = order.sizes.size26 || '';
    document.getElementById('size28').value = order.sizes.size28 || '';
    document.getElementById('size30').value = order.sizes.size30 || '';

    // Calculate total
    calculateFormTotal();

    // Close history modal
    closeHistoryModal();

    // Scroll to form
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });

    showToast('Order template loaded! 📋');
}

// Close History Modal
function closeHistoryModal() {
    const overlay = document.getElementById('historyOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// Reset Form
function resetForm() {
    document.getElementById('dataForm').reset();
    document.getElementById('formTotal').textContent = '0';
    editMode = false;
    editingId = null;

    // Clear image preview
    removeImage();

    // Update button text
    const submitBtn = document.querySelector('.btn-large');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Add Order';
    }
}

// Search Functionality
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#tableBody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Export to PDF
function exportToPDF() {
    if (businessData.length === 0) {
        alert('No data to export!');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape', 'mm', 'a4');

    // Add title
    doc.setFontSize(18);
    doc.setTextColor(99, 102, 241);
    doc.text('Report', 14, 15);

    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

    // Add statistics
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Orders: ${businessData.length}`, 14, 30);
    doc.text(`Total Units: ${businessData.reduce((sum, item) => sum + item.total, 0)}`, 80, 30);

    // Prepare table data
    const headers = [
        ['#', 'PO NO', 'SKU NO', 'BUYER CODE', 'MAHIMA CODE', 'COLOR', 'Department', 'Ex-Factory',
            '2', '4/UK4', '6/UK5', '8/UK6', '10/UK10', '12/UK12', '14/UK14', '16/UK16', '18/UK18',
            '20', '22', '24', '26', '28', '30', 'TOTAL', 'Remark']
    ];

    const rows = businessData.map((item, index) => [
        index + 1,
        item.poNo,
        item.skuNo,
        item.buyerCode,
        item.mahimaCode,
        item.color,
        item.department,
        formatDate(item.exFactory),
        item.sizes.size2 || '-',
        item.sizes.size4 || '-',
        item.sizes.size6 || '-',
        item.sizes.size8 || '-',
        item.sizes.size10 || '-',
        item.sizes.size12 || '-',
        item.sizes.size14 || '-',
        item.sizes.size16 || '-',
        item.sizes.size18 || '-',
        item.sizes.size20 || '-',
        item.sizes.size22 || '-',
        item.sizes.size24 || '-',
        item.sizes.size26 || '-',
        item.sizes.size28 || '-',
        item.sizes.size30 || '-',
        item.total,
        item.remark || '-'
    ]);

    // Add table
    doc.autoTable({
        head: headers,
        body: rows,
        startY: 35,
        theme: 'grid',
        headStyles: {
            fillColor: [99, 102, 241],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 8,
            halign: 'center'
        },
        bodyStyles: {
            fontSize: 7,
            halign: 'center',
            cellPadding: 1
        },
        columnStyles: {
            24: { fillColor: [220, 220, 255], fontStyle: 'bold' }, // Total column
            25: {
                cellWidth: 30,
                fontSize: 6,
                halign: 'left',
                valign: 'middle',
                overflow: 'linebreak'
            } // Remark column - wrapped text, smaller font, left aligned
        },
        margin: { top: 35, left: 5, right: 5 },
        tableWidth: 'auto'
    });

    // Add product images in grid layout on new pages - SHOW ALL ORDERS
    if (businessData.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.setTextColor(99, 102, 241);
        doc.text('Product Images', 14, 15);

        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 6;
        const imagesPerRow = 4;
        const imagesPerPage = 20; // 4 columns x 5 rows
        const imageWidth = (pageWidth - margin * 5) / imagesPerRow;
        const imageSize = 30; // Reduced image size to fit better
        const labelHeight = 10;
        const cellHeight = imageSize + labelHeight + 6; // Increased padding for image
        const rowsPerPage = 5;

        businessData.forEach((item, index) => {
            const pageIndex = Math.floor(index / imagesPerPage);
            const positionInPage = index % imagesPerPage;
            const row = Math.floor(positionInPage / imagesPerRow);
            const col = positionInPage % imagesPerRow;

            // Add new page if needed
            if (positionInPage === 0 && index > 0) {
                doc.addPage();
                doc.setFontSize(16);
                doc.setTextColor(99, 102, 241);
                doc.text('Product Images (continued)', 14, 15);
            }

            // Calculate position
            const xPosition = margin + (col * (imageWidth + margin));
            const yPosition = 22 + (row * cellHeight);

            // Add border box
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.rect(xPosition, yPosition, imageWidth, cellHeight);

            // Add item details
            doc.setFontSize(6.5);
            doc.setTextColor(0, 0, 0);
            const labelY = yPosition + 3;
            doc.text(`#${index + 1}`, xPosition + 2, labelY);
            doc.text(`PO: ${item.poNo}`, xPosition + 2, labelY + 2.5);
            doc.text(`SKU: ${item.skuNo}`, xPosition + 2, labelY + 5);
            doc.text(`Buyer: ${item.buyerCode}`, xPosition + 2, labelY + 7.5);

            // Add image centered or "No Image" text
            if (item.productImage) {
                try {
                    const imgX = xPosition + (imageWidth - imageSize) / 2;
                    const imgY = yPosition + labelHeight + 2;
                    doc.addImage(item.productImage, 'JPEG', imgX, imgY, imageSize, imageSize);
                } catch (e) {
                    doc.setFontSize(8);
                    doc.setTextColor(220, 38, 38);
                    doc.text('Error loading image', xPosition + imageWidth / 2, yPosition + cellHeight / 2, { align: 'center' });
                }
            } else {
                // Show "No Image Attached" placeholder
                doc.setFillColor(245, 245, 245);
                const imgX = xPosition + (imageWidth - imageSize) / 2;
                const imgY = yPosition + labelHeight + 2;
                doc.rect(imgX, imgY, imageSize, imageSize, 'F');
                
                doc.setFontSize(7);
                doc.setTextColor(150, 150, 150);
                doc.text('No Image', xPosition + imageWidth / 2, yPosition + labelHeight + imageSize / 2 + 2, { align: 'center' });
                doc.text('Attached', xPosition + imageWidth / 2, yPosition + labelHeight + imageSize / 2 + 5, { align: 'center' });
            }
        });
    }

    // Save PDF
    const fileName = `Business_Data_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    showToast('PDF exported successfully! 📄');
}

// Export to CSV
function exportToCSV() {
    if (businessData.length === 0) {
        alert('No data to export!');
        return;
    }

    const headers = [
        'PO NO',
        'SKU NO',
        'BUYER CODE',
        'MAHIMA CODE',
        'COLOR',
        'DEPARTMENT',
        'Ex-Factory',
        '2',
        '4/UK4',
        '6/UK5',
        '8/UK6',
        '10/UK10',
        '12/UK12',
        '14/UK14',
        '16/UK16',
        '18/UK18',
        '20',
        '22',
        '24',
        '26',
        '28',
        '30',
        'TOTAL'
    ];

    let csv = headers.join(',') + '\n';

    businessData.forEach(item => {
        const row = [
            item.poNo,
            item.skuNo,
            item.buyerCode,
            item.mahimaCode,
            item.color,
            item.department,
            item.exFactory,
            item.sizes.size2 || 0,
            item.sizes.size4 || 0,
            item.sizes.size6 || 0,
            item.sizes.size8 || 0,
            item.sizes.size10 || 0,
            item.sizes.size12 || 0,
            item.sizes.size14 || 0,
            item.sizes.size16 || 0,
            item.sizes.size18 || 0,
            item.sizes.size20 || 0,
            item.sizes.size22 || 0,
            item.sizes.size24 || 0,
            item.sizes.size26 || 0,
            item.sizes.size28 || 0,
            item.sizes.size30 || 0,
            item.total,
            item.remark || ''
        ];
        csv += row.join(',') + '\n';
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Business_Data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showToast('CSV exported successfully! 📊');
}

// Export to Excel with Formatting
function exportToExcel() {
    if (businessData.length === 0) {
        alert('No data to export!');
        return;
    }

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Prepare header row with styling
    const headers = [
        'PO NO',
        'SKU NO',
        'BUYER CODE',
        'MAHIMA CODE',
        'COLOR',
        'DEPARTMENT',
        'Ex-Factory',
        '2',
        '4/UK4',
        '6/UK5',
        '8/UK6',
        '10/UK10',
        '12/UK12',
        '14/UK14',
        '16/UK16',
        '18/UK18',
        '20',
        '22',
        '24',
        '26',
        '28',
        '30',
        'TOTAL',
        'REMARK'
    ];

    // Prepare data rows
    const data = businessData.map(item => [
        item.poNo,
        item.skuNo,
        item.buyerCode,
        item.mahimaCode,
        item.color,
        item.department,
        formatDate(item.exFactory),
        item.sizes.size2 || 0,
        item.sizes.size4 || 0,
        item.sizes.size6 || 0,
        item.sizes.size8 || 0,
        item.sizes.size10 || 0,
        item.sizes.size12 || 0,
        item.sizes.size14 || 0,
        item.sizes.size16 || 0,
        item.sizes.size18 || 0,
        item.sizes.size20 || 0,
        item.sizes.size22 || 0,
        item.sizes.size24 || 0,
        item.sizes.size26 || 0,
        item.sizes.size28 || 0,
        item.sizes.size30 || 0,
        item.total,
        item.remark || ''
    ]);

    // Combine headers and data
    const wsData = [headers, ...data];

    // Add summary rows
    wsData.push([]);
    wsData.push(['SUMMARY', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    wsData.push(['Total Orders:', businessData.length, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    wsData.push(['Total Units:', businessData.reduce((sum, item) => sum + item.total, 0), '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    const colWidths = [
        { wch: 15 }, // PO NO
        { wch: 15 }, // SKU NO
        { wch: 15 }, // BUYER CODE
        { wch: 15 }, // MAHIMA CODE
        { wch: 15 }, // COLOR
        { wch: 15 }, // DEPARTMENT
        { wch: 15 }, // EX-FACTORY
        { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
        { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
        { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
        { wch: 15 }, // TOTAL
        { wch: 20 }  // REMARK
    ];
    ws['!cols'] = colWidths;

    // Style the header row (first row) - Bold with background color
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddress]) continue;

        ws[cellAddress].s = {
            font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4F46E5" } },
            alignment: { horizontal: "center", vertical: "center" }
        };
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Business Data');

    // Generate and download file
    const fileName = `Business_Data_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    showToast('Excel file exported successfully! 📗');
}

// Show Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
