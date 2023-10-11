import React, { useContext, useEffect, useState } from 'react';
import { Modal, List, Collapse } from 'antd';
import { LanguageContext } from '../IntlProvider';
import axios from 'axios';
import "./Settings.css";

const Contributors = ({ open, onClose }) => {
  const { locale, messages } = useContext(LanguageContext);
  const [contributors, setContributors] = useState({});

  const fetchAndParseContributors = async (filename, category) => {
    try {
      const { data } = await axios.get(`https://apis.uiharu.dev/fixcors/api.php?url=https://mt.uiharu.dev/users/${filename}.txt`);
      const lines = data.split('\n');
      const parsedData = lines.map(line => {
        const [nickname, date, contribution] = line.split(' / ');
        return { nickname, date, contribution };
      });
      setContributors(prevState => ({ ...prevState, [category]: parsedData }));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAndParseContributors('code_contribute', 'Code Contributors');
    fetchAndParseContributors('langs_contribute', 'Language Contributors');
    fetchAndParseContributors('financial_support', 'Financial Supporters');
    fetchAndParseContributors('etc_helper', 'Other Helpers');
  }, []);

  const collapseItems = Object.keys(contributors).map((key) => ({
    key,
    label: key,
    children: (
      <List
        dataSource={contributors[key]}
        renderItem={item => (
          <List.Item>
            {`${item.nickname} (${item.date}) - ${item.contribution}`}
          </List.Item>
        )}
      />
    ),
  }));

  return (
    <Modal
      title={messages['settings.title'] || "Contributors"}
      className="settings-modal-title"
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Collapse items={collapseItems} />
    </Modal>
  );
};

export default Contributors;
