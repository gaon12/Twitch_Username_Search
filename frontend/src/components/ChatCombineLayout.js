import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Col, Row, Spin, Tooltip, message } from 'antd';
import Box from '@mui/material/Box';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// ChatCombineLayout(채팅창을 하나의 탭으로 분리)
export default function ChatCombineLayout({ streams, parentDomain }) {
    const [browserHeight, setBrowserHeight] = useState(window.innerHeight - 180); // 180px 빼기
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    }; 

    // 영상 한개인 경우에는 전체화면, 2개는 반반... 이런식으로 자동 계산
    // 스트림의 개수에 따라 그리드 템플릿 열을 계산합니다.
    // 모바일(가로 768px 이하)에서는 영상과 채팅탭을 각각 윗쪽과 아랫쪽에 배치합니다.
    const isMobile = window.innerWidth <= 768;

    const getGridTemplate = () => {
        if (isMobile) {
            return {
                gridTemplateColumns: '1fr',
                gridTemplateRows: '1fr 1fr',
            };
        }

        const streamCount = streams.length;
        if (streamCount === 1) {
            return {
                gridTemplateColumns: '1fr',
                gridTemplateRows: '1fr',
            };
        }
        if (streamCount === 2) {
            return {
                gridTemplateColumns: '1fr',
                gridTemplateRows: '1fr 1fr',  // 2개일 때 상하로 나눕니다.
                height: '99%',
            };
        }
        const columnCount = Math.ceil(Math.sqrt(streamCount));  // 제곱근을 올림하여 열 개수를 계산합니다.
        return {
            gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
            gridTemplateRows: `repeat(${columnCount}, 1fr)`,  // 열 개수와 동일한 행 개수를 설정합니다.
            height: '97%',
        };
    };

    // 클립보드 복사 시 툴팁 클릭했을 때에만 복사되고, 탭 클릭 시에는 복사되지 않도록
    const [copyText, setCopyText] = useState('');  // 복사할 텍스트의 상태

    const handleTooltipClick = useCallback((text) => {
        setCopyText(text);
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        message.success('복사되었습니다!');
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setBrowserHeight(window.innerHeight - 40);  // 40px 빼기
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const fetchNickname = useCallback(async (id) => {
        const sessionKey = `tw_id_${id}`;
        const cachedData = sessionStorage.getItem(sessionKey);
        if (cachedData) {
            return JSON.parse(cachedData).nickname;
        } else {
            try {
                const response = await axios.post("https://mt.uiharu.dev/api2.php", {
                    SearchType: "ID",
                    SearchValue: id,
                });
                const data = response.data;
                if (data.StatusCode === 200) {
                    const transformedData = {
                        nickname: data.data.Nickname,
                        id: data.data.ID,
                        UniqueNumber: data.data.UniqueNumber,
                        Icon: data.data.Icon,
                        URL: data.data.URL,
                        Broadcasting: data.data.Broadcasting,
                        partner: data.data.Partner,
                    };
                    sessionStorage.setItem(sessionKey, JSON.stringify(transformedData));
                    return transformedData.nickname;
                }
            } catch (error) {
                console.error("API 호출 중 에러 발생:", error);
                return null;
            }
        }
    }, []);

    const [items, setItems] = useState([]);

    useEffect(() => {
        const updateNicknames = async () => {
            const updatedItems = await Promise.all(
                streams.map(async (stream, index) => {
                    const nickname = await fetchNickname(stream.id);
                    return {
                        ...stream,
                        nickname: nickname || stream.id,
                    };
                })
            );
            setItems(updatedItems.map((stream, index) => ({
                key: index + 1,
                label: (
                    <Tooltip title={`${stream.nickname}(@${stream.id})`}>
                        <span>
                            {stream.nickname || <Spin />}
                        </span>
                    </Tooltip>
                ),
                children: (
                    <div className="chat-container" style={{ height: `${browserHeight}px` }}>
                        <iframe
                            title={`${stream.nickname}-chat`}
                            src={stream.chatUrl}
                            style={{ border: "none", width: "100%", height: "100%" }}
                            allowFullScreen={true}
                        />
                    </div>
                ),
            })));
        };
    
        updateNicknames();
    }, [streams, fetchNickname, browserHeight, handleTooltipClick]);

    return (
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: 'calc(100vh - 110px)', overflow: 'hidden', marginBottom: isMobile ? '10px' : '0' }} className="chat-combine-layout">
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
              <div
                  style={{
                      display: 'grid',
                      ...getGridTemplate(),
                      gap: '12px',
                      marginBottom: '20px',
                      width: '100%',
                      aspectRatio: '16/9'
                  }}
              >
                  {streams.map((stream, index) => (
                      <div className="stream-container" key={index} style={{ marginRight: -5 }}>
                          <iframe
                              title={`${stream.nickname}-stream`}
                              src={`https://player.twitch.tv/?channel=${stream.id}&parent=${parentDomain}`}
                              style={{ border: "none", width: "100%", height: "100%" }}
                              allowFullScreen={true}
                          />
                      </div>
                  ))}
              </div>
          </div>
          <div style={{ width: isMobile ? '100%' : '300px', borderLeft: isMobile ? 'none' : '1px solid #ccc', overflowY: 'auto', overflowX: 'hidden', height: isMobile ? 'auto' : 'calc(100vh - 80px)' }}>
              <Box
                  sx={{
                      flexGrow: 1,
                      bgcolor: 'background.paper',
                      height: '97%',
                      display: 'flex',
                      flexDirection: 'column'
                  }}
              >
                  <Tabs
                      value={value}
                      onChange={handleChange}
                      variant="scrollable"
                      scrollButtons
                      aria-label="visible arrows tabs example"
                      sx={{
                          [`& .${tabsClasses.scrollButtons}`]: {
                              '&.Mui-disabled': { opacity: 0.3 },
                          },
                      }}
                  >
                      {items.map((item, index) => (
                          <Tab label={item.label} key={index} />
                      ))}
                  </Tabs>
                  {items[value] && items[value].children}
              </Box>
          </div>
      </div>
  );
}