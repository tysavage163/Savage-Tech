const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, 'settings.json');

const DEFAULT_SETTINGS = {
    prefix: '.',
    worktype: 'public',
    antiDeleteEnabled: false,
    antiEditEnabled: false,
    antideleteMode: 'on',
    autoViewStatus: 'on',
    autoTyping: 'off',
    autoRead: false,
    alwaysOnline: true,
    botFont: null,
    menuStyle: 'original',
    menuImages: [],
    menuImageIndex: 0,
    anticall: { mode: 'off', msg: '❌ Calls are not accepted.' },
    groups: {},
    warnings: {}
};

let settings = null;

function loadSettings() {
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
            settings = JSON.parse(data);
            settings = deepMerge(DEFAULT_SETTINGS, settings);
        } else {
            settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
            saveSettings();
        }
        return settings;
    } catch (e) {
        console.error('Failed to load settings:', e);
        settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        saveSettings();
        return settings;
    }
}

function saveSettings() {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    } catch (e) {
        console.error('Failed to save settings:', e);
    }
}

function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(target[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

// --- Global getters/setters ---
function getGlobal(key, defaultValue = null) {
    return settings[key] !== undefined ? settings[key] : defaultValue;
}

function setGlobal(key, value) {
    settings[key] = value;
    saveSettings();
}

// --- Group settings ---
function getGroup(groupId, key, defaultValue = null) {
    if (!settings.groups[groupId]) settings.groups[groupId] = {};
    return settings.groups[groupId][key] !== undefined ? settings.groups[groupId][key] : defaultValue;
}

function setGroup(groupId, key, value) {
    if (!settings.groups[groupId]) settings.groups[groupId] = {};
    settings.groups[groupId][key] = value;
    saveSettings();
}

function loadAllGroupSettings(groupId) {
    return settings.groups[groupId] || {};
}

// --- Warnings (generic) ---
function getWarning(groupId, userId, type) {
    if (!settings.warnings[groupId]) return 0;
    if (!settings.warnings[groupId][userId]) return 0;
    return settings.warnings[groupId][userId][type] || 0;
}

function setWarning(groupId, userId, type, count) {
    if (!settings.warnings[groupId]) settings.warnings[groupId] = {};
    if (!settings.warnings[groupId][userId]) settings.warnings[groupId][userId] = {};
    if (count <= 0) {
        delete settings.warnings[groupId][userId][type];
        if (Object.keys(settings.warnings[groupId][userId]).length === 0) {
            delete settings.warnings[groupId][userId];
        }
        if (Object.keys(settings.warnings[groupId]).length === 0) {
            delete settings.warnings[groupId];
        }
    } else {
        settings.warnings[groupId][userId][type] = count;
    }
    saveSettings();
}

function incrementWarning(groupId, userId, type) {
    const current = getWarning(groupId, userId, type);
    const newCount = current + 1;
    setWarning(groupId, userId, type, newCount);
    return newCount;
}

function resetWarnings(groupId, userId, type) {
    setWarning(groupId, userId, type, 0);
}

function loadAllWarnings(groupId) {
    return settings.warnings[groupId] || {};
}

// --- Sync globals from settings (optional) ---
function syncGlobals() {
    for (const key in settings) {
        if (key !== 'groups' && key !== 'warnings') {
            global[key] = settings[key];
        }
    }
}

module.exports = {
    loadSettings,
    saveSettings,
    getGlobal,
    setGlobal,
    getGroup,
    setGroup,
    loadAllGroupSettings,
    getWarning,
    setWarning,
    incrementWarning,
    resetWarnings,
    loadAllWarnings,
    syncGlobals,
    settings
};
