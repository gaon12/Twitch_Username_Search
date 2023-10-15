import React, { useContext, useState, useEffect } from 'react';
import { Modal, Select, Switch, Tooltip } from 'antd';
import { LanguageContext } from '../IntlProvider';
import "./Settings.css";

const { Option } = Select;

// 매직 스트링을 상수로 대체
const CHAT_DISPLAY_OPTIONS = {
    TAB: 'TabMenu',
    CINEMA: 'CinemaMode',
    COMBINE: 'ChatCombine'
};

const Settings = ({ open, onClose }) => {
    const { locale, messages, setLocale } = useContext(LanguageContext);
    
    const [chatDisplayOption, setChatDisplayOption] = useState('tab');

    useEffect(() => {
        const storedValue = localStorage.getItem('ShowChat');
        const option = Object.keys(CHAT_DISPLAY_OPTIONS).find(key => CHAT_DISPLAY_OPTIONS[key] === storedValue) || 'TAB';
        setChatDisplayOption(option.toLowerCase());
    }, []);

    const handleLanguageChange = (value) => {
        setLocale(value);
    };

    const handleChatDisplayChange = (value) => {
        const localStorageValue = CHAT_DISPLAY_OPTIONS[value.toUpperCase()];
        if (localStorageValue) {
            localStorage.setItem('ShowChat', localStorageValue);
            setChatDisplayOption(value);
        }
    };

    return (
        <Modal
            title={messages['settings.title'] || "Settings"}
            className="settings-modal-title"
            open={open}
            onCancel={onClose}
            footer={null}
        >
            <div className="settings-option">
                <Tooltip title="Select your preferred language.">
                    <label>{messages['settings.language'] || "Language"}: </label>
                </Tooltip>
                <Select value={locale} style={{ width: 120 }} onChange={handleLanguageChange}>
                    <Option value="auto">Auto</Option>
                    <Option value="ko">{messages['settings.languages.ko'] || "Korean"}</Option>
                    <Option value="en">{messages['settings.languages.en'] || "English"}</Option>
                </Select>
            </div>

            <div className="settings-option">
                <Tooltip title="Choose your theme.">
                    <label>{messages['settings.theme'] || "Theme"}: </label>
                </Tooltip>
                <Switch 
                    checkedChildren={messages['settings.theme.dark'] || 'Dark'} 
                    unCheckedChildren={messages['settings.theme.light'] || 'Light'} 
                    defaultChecked 
                />
            </div>

            <div className="settings-option">
                <Tooltip title="Choose your chat display option.">
                    <label>{messages['settings.chat.display'] || 'Chat Display'}: </label>
                </Tooltip>
                <Select value={chatDisplayOption} style={{ width: 160 }} onChange={handleChatDisplayChange}>
                    <Option value="tab">{messages['settings.chat.tab'] || "Tab Menu"}</Option>
                    <Option value="cinema">{messages['settings.chat.cinemamode'] || "Cinema Mode"}</Option>
                    <Option value="combine">{messages['settings.chat.chatcombine'] || "Combine Chats"}</Option>
                    <Option value="hide">{messages['settings.chat.hidechat'] || "Hide Chat"}</Option>
                </Select>
            </div>
        </Modal>
    );
};

export default Settings;
