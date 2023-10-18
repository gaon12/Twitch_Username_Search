import React, { useContext, useState, useEffect } from 'react';
import { Modal, Select, Switch, Tooltip } from 'antd';
import { LanguageContext } from '../IntlProvider';
import "./Settings.css";

const { Option } = Select;

const CHAT_DISPLAY_OPTIONS = {
    TAB: 'TabMenu',
    CINEMA: 'CinemaMode',
    CHATCOMBINE: 'ChatCombine',
    CHATCOMBINEPLUS: 'ChatCombinePlus',
    HIDE: 'Hide'
};

const Settings = ({ open, onClose }) => {
    const { locale, messages, setLocale } = useContext(LanguageContext);
    
    const [chatDisplayOption, setChatDisplayOption] = useState('Tab');

    useEffect(() => {
        const checkLocalStorage = () => {
            const storedValue = localStorage.getItem('ShowChat');
            if (Object.values(CHAT_DISPLAY_OPTIONS).includes(storedValue) && storedValue !== chatDisplayOption) {
                setChatDisplayOption(storedValue);
            } else if (!storedValue || !Object.values(CHAT_DISPLAY_OPTIONS).includes(storedValue)) {
                localStorage.setItem('ShowChat', CHAT_DISPLAY_OPTIONS.TAB);
                setChatDisplayOption(CHAT_DISPLAY_OPTIONS.TAB);
            }
        };
        
        checkLocalStorage();  // 초기에 한 번 실행
        const intervalId = setInterval(checkLocalStorage, 300);  // 이후 300ms마다 실행

        return () => clearInterval(intervalId);  // 컴포넌트가 언마운트될 때 인터벌 클리어
    }, [chatDisplayOption]);

    const handleLanguageChange = (value) => {
        setLocale(value);
    };

    const handleChatDisplayChange = (value) => {
        const optionValue = CHAT_DISPLAY_OPTIONS[value.toUpperCase()];
        if (optionValue) {
            localStorage.setItem('ShowChat', optionValue);
            setChatDisplayOption(optionValue);
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
                    {Object.entries(CHAT_DISPLAY_OPTIONS).map(([key, value]) => (
                        <Option key={key} value={value}>
                            {messages[`settings.chat.${value.toLowerCase()}`] || value}
                        </Option>
                    ))}
                </Select>
            </div>
        </Modal>
    );
};

export default Settings;
