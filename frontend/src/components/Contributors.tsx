import React, { useContext, useEffect, useState, FC } from 'react';
import { Modal, List, Collapse, CollapseProps } from 'antd';
import { LanguageContext } from '../IntlProvider';
import axios from 'axios';
import "./Settings.css";

interface Contributor {
  nickname: string;
  date: string;
  contribution: string;
}

interface ContributorsProps {
  open: boolean;
  onClose: () => void;
}

interface ContributorsData {
  [key: string]: Contributor[];
}

const Contributors: FC<ContributorsProps> = ({ open, onClose }) => {
  const { locale, messages } = useContext(LanguageContext);
  const [contributors, setContributors] = useState<ContributorsData>({});

  const fetchAndParseContributors = async (filename: string, category: string) => {
    try {
      const { data } = await axios.get(`https://apis.uiharu.dev/fixcors/api.php?url=https://mt.uiharu.dev/users/${filename}.txt`);
      const lines = data.split('\n');
      const parsedData = lines.map((line: string) => {
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

  const items: CollapseProps['items'] = Object.keys(contributors).map((key) => ({
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
      <Collapse items={items} />
    </Modal>
  );
};

export default Contributors;
