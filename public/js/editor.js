const elements = {
    primaryColor: document.getElementById('primaryColor'),
    glassBgColor: document.getElementById('glassBgColor'),
    activeFontSize: document.getElementById('activeFontSize'),
    inactiveFontSize: document.getElementById('inactiveFontSize'),
    showAlbumArt: document.getElementById('showAlbumArt'),
    showTrackInfo: document.getElementById('showTrackInfo'),
    lyricAlignment: document.getElementById('lyricAlignment'),
    saveBtn: document.getElementById('saveBtn'),
    statusMessage: document.getElementById('statusMessage'),
    iframe: document.getElementById('previewIframe')
};

const loadSettings = async () => {
    try {
        const res = await fetch('/api/settings');
        const settings = await res.json();
        
        elements.primaryColor.value = settings.primaryColor;
        elements.glassBgColor.value = settings.glassBgColor;
        elements.activeFontSize.value = settings.activeFontSize;
        elements.inactiveFontSize.value = settings.inactiveFontSize;
        elements.showAlbumArt.checked = settings.showAlbumArt;
        elements.showTrackInfo.checked = settings.showTrackInfo;
        elements.lyricAlignment.value = settings.lyricAlignment;
    } catch (err) {
        console.error('Failed to load settings:', err);
    }
};

const saveSettings = async () => {
    const newSettings = {
        primaryColor: elements.primaryColor.value,
        glassBgColor: elements.glassBgColor.value,
        activeFontSize: elements.activeFontSize.value,
        inactiveFontSize: elements.inactiveFontSize.value,
        showAlbumArt: elements.showAlbumArt.checked,
        showTrackInfo: elements.showTrackInfo.checked,
        lyricAlignment: elements.lyricAlignment.value
    };

    try {
        elements.saveBtn.textContent = 'Saving...';
        const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSettings)
        });

        if (res.ok) {
            elements.statusMessage.textContent = 'Settings saved successfully!';
            setTimeout(() => elements.statusMessage.textContent = '', 3000);
            
            // Reload iframe
            elements.iframe.src = elements.iframe.src;
        } else {
            elements.statusMessage.textContent = 'Failed to save settings.';
            elements.statusMessage.style.color = '#ff4444';
        }
    } catch (err) {
        console.error(err);
    } finally {
        elements.saveBtn.textContent = 'Save Changes';
    }
};

elements.saveBtn.addEventListener('click', saveSettings);

// Load on start
loadSettings();
