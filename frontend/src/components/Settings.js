// src/components/Settings.js

import React, { useContext } from 'react';
import { Modal, Select, Radio, Switch } from 'antd';
import { LanguageContext } from '../IntlProvider';  // Import the LanguageContext from IntlProvider.js
import "./Settings.css";

const { Option } = Select;

const Settings = ({ open, onClose }) => {
    const { locale, messages, setLocale } = useContext(LanguageContext);  // Get the locale and messages from the LanguageContext

    const handleLanguageChange = (value) => {
        setLocale(value);  // Update the locale when the selected language changes
      };

  return (
    <Modal
      title={messages['settings.title'] || "Settings"}  // Use the messages object instead of FormattedMessage
      className="settings-modal-title"
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <div className="settings-option">
        <label>{messages['settings.language'] || "Language"}: </label>
        <Select defaultValue={locale} style={{ width: 120 }} onChange={handleLanguageChange}>
          <Option value="auto">Auto</Option>
          <Option value="ko">{messages['settings.languages.ko'] || "Korean"}</Option>
          <Option value="en">{messages['settings.languages.en'] || "English"}</Option>
        </Select>
      </div>
      <div className="settings-option">
        <label>{messages['settings.theme'] || "Theme"}: </label>
        <Switch checkedChildren={messages['settings.theme.dark'] || 'Dark'} unCheckedChildren={messages['settings.theme.light'] || 'Light'} defaultChecked />
      </div>
      <div className="settings-option">
        <label>{messages['settings.chat.display'] || 'Chat Display'} </label>
        <Radio.Group defaultValue="tab">
          <Radio.Button value="tab">{messages['settings.chat.tab'] || "Tab Menu"}</Radio.Button>
          <Radio.Button value="drag">{messages['settings.chat.drag'] || "Drag to Resize"}</Radio.Button>
          <Radio.Button value="hide">{messages['settings.chat.hide'] || "Hide Chat"}</Radio.Button>
        </Radio.Group>
      </div>
    </Modal>
  );
};

export default Settings;
