import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import "./HideChat.css";

interface HideChatProps {
  stream: {
    nickname: string;
    id: string;
  };
  parentDomain: string;
}

const HideChat: React.FC<HideChatProps> = ({ stream, parentDomain }) => {
  const [flexValue, setFlexValue] = useState<number>(window.innerWidth <= 768 ? 2 : 7);

  useEffect(() => {
    const handleResize = () => {
      setFlexValue(window.innerWidth <= 768 ? 2 : 7);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Row
      gutter={[16, 16]}
      className="custom-row"
    >
      <Col span={24} style={{ width: '100%' }}>
        <div className="hidechat-container">
          <div className="hidechat-stream-container" style={{ flex: flexValue }}>
            <iframe
              title={`${stream.nickname}-stream`}
              src={`https://player.twitch.tv/?channel=${stream.id}&parent=${parentDomain}`}
              className="hidechat-iframe"
              allowFullScreen={true}
            />
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default HideChat;
