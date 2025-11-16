// Data Storage
let businessData = JSON.parse(localStorage.getItem('businessData')) || [];
let editMode = false;
let editingId = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
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
    document.getElementById('editModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEditModal();
        }
    });
});

// Handle Form Submission
function handleFormSubmit(e) {
    e.preventDefault();
    
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

// Load Data to Table
function loadData() {
    const tableBody = document.getElementById('tableBody');
    
    if (businessData.length === 0) {
        tableBody.innerHTML = `
            <tr class="empty-state">
                <td colspan="25">
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

// Reset Form
function resetForm() {
    document.getElementById('dataForm').reset();
    document.getElementById('formTotal').textContent = '0';
    editMode = false;
    editingId = null;
    
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
