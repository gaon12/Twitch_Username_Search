import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import "./HideChat.css";

const HideChat = ({ stream, parentDomain }) => {
    const [flexValue, setFlexValue] = useState(window.innerWidth <= 768 ? 2 : 7);

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
            <Col span={24}>
                <div className="cinema-container hide-chat-content" style={{ width: "100%" }}>
                    <div className="cinema-stream-container" style={{ flex: flexValue }}>
                        <iframe
                            title={`${stream.nickname}-stream`}
                            src={`https://player.twitch.tv/?channel=${stream.id}&parent=${parentDomain}`}
                            className="cinema-iframe"
                            allowFullScreen={true}
                            style={{ width: "100%", height: "100%", border: 0}}
                        />
                    </div>
                </div>
            </Col>
        </Row>
    );
};

export default HideChat;
