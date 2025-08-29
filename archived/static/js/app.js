// JavaScript for [PROJECT_NAME] Web Interface

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('[PROJECT_NAME] web interface loaded');
    loadSystemStatus();
});

// Test API connection
async function testAPI() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        showNotification('API Test Successful!', 'success');
        console.log('API Response:', data);
        
        // Update status display
        updateStatusDisplay({
            status: 'Connected',
            message: 'API is responding normally',
            timestamp: new Date().toLocaleString()
        });
        
    } catch (error) {
        console.error('API Test Failed:', error);
        showNotification('API Test Failed!', 'error');
        
        updateStatusDisplay({
            status: 'Error',
            message: 'Failed to connect to API',
            timestamp: new Date().toLocaleString()
        });
    }
}

// Show info about the application
function showInfo() {
    const info = {
        name: '[PROJECT_NAME]',
        version: '0.1.0',
        author: 'Alex @ Digital Synergy Solutions',
        description: '[BRIEF_DESCRIPTION]',
        framework: 'Flask + Vanilla JavaScript'
    };
    
    showNotification(`
        <strong>${info.name}</strong> v${info.version}<br>
        Built by ${info.author}<br>
        Framework: ${info.framework}
    `, 'info');
}

// Load system status
async function loadSystemStatus() {
    const statusElement = document.getElementById('status-display');
    
    try {
        statusElement.innerHTML = '<div class="loading"></div> Loading status...';
        
        const response = await fetch('/api/status');
        const data = await response.json();
        
        updateStatusDisplay({
            status: 'Online',
            message: 'System is running normally',
            version: data.version || '0.1.0',
            timestamp: new Date().toLocaleString()
        });
        
    } catch (error) {
        console.error('Failed to load system status:', error);
        updateStatusDisplay({
            status: 'Offline',
            message: 'Unable to connect to system',
            timestamp: new Date().toLocaleString()
        });
    }
}

// Update status display
function updateStatusDisplay(status) {
    const statusElement = document.getElementById('status-display');
    const statusColor = status.status === 'Online' ? 'var(--success-color)' : 
                       status.status === 'Error' ? 'var(--danger-color)' : 
                       'var(--warning-color)';
    
    statusElement.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <strong style="color: ${statusColor};">${status.status}</strong>
            <span style="font-size: 0.8rem; color: var(--text-secondary);">${status.timestamp}</span>
        </div>
        <p>${status.message}</p>
        ${status.version ? `<p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem;">Version: ${status.version}</p>` : ''}
    `;
}

// Show notification (simple toast-style)
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = message;
    
    // Styling
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: 'var(--border-radius)',
        color: 'white',
        fontSize: '0.9rem',
        zIndex: '1000',
        maxWidth: '300px',
        boxShadow: 'var(--shadow)',
        animation: 'slideIn 0.3s ease-out'
    });
    
    // Set background color based on type
    const colors = {
        success: 'var(--success-color)',
        error: 'var(--danger-color)',
        warning: 'var(--warning-color)',
        info: 'var(--info-color)'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
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
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Utility functions for common operations
const utils = {
    // Format timestamp
    formatTime: (date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    },
    
    // Copy text to clipboard
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            showNotification('Copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            showNotification('Failed to copy to clipboard', 'error');
        }
    },
    
    // Debounce function for search/input
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Make utils available globally
window.utils = utils; 