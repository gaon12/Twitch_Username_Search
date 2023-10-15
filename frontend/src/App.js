import { Add as AddIcon, Edit as EditIcon, Settings as SettingsIcon, Groups as GroupsIcon } from "@mui/icons-material";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import { Alert, Col, Modal, Row, Spin, Tabs, Tooltip, Typography } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter as Router, useNavigate } from "react-router-dom";
import "./App.css";
import IntlProvider from "./IntlProvider";
import AddStream from "./components/AddStream";
import ChatCombineLayout from "./components/ChatCombineLayout";
import ChatCombinePlus from './components/ChatCombinePlus';
import HideChat from './components/HideChat';
import Settings from "./components/Settings";
import SortableList from "./components/SortableList";
import Contributors from "./components/Contributors";
import useMessage from "./components/useMessage";
import useUpdateUrl from "./components/useUpdateUrl";

const { Title } = Typography;

const actions = [
    { icon: <AddIcon />, name: "Add Stream" },
    { icon: <EditIcon />, name: "Edit Order" },
    { icon: <SettingsIcon />, name: "Settings" },
    { icon: <GroupsIcon />, name: "Contributors" },
];

function AppContent() {
    const [visible, setVisible] = useState(false);
    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false);
    const handleOpen = () => setOpen(true);
    const [isSorting, setIsSorting] = useState(false); // 채널 순서 변경
    const [addstreamVisible, setAddstreamVisible] = useState(false); // 채널 목록 추가 모달
    const [settingsVisible, setSettingsVisible] = useState(false); // 설정 모달
    const [contributorsVisible, setContributorsVisible] = useState(false); // 코드 제공자 모달
    const [streams, setStreams] = useState([]);
    const [message, setMessage] = useMessage();
    const updateUrl = useUpdateUrl(streams);

    const parentDomain = window.location.hostname;

    // 채널을 추가하는 함수
    const addStream = (record) => {
        setStreams((prevStreams) => {
            const newStreams = [
                ...prevStreams,
                {
                    nickname: record.Nickname,
                    id: record.ID,
                    partner: record.Partner,
                    chatUrl: `https://www.twitch.tv/embed/${record.ID}/chat?parent=${parentDomain}`,
                },
            ];
            updateUrl(newStreams); // URL 업데이트
            return newStreams;
        });
        setAddstreamVisible(false); // 모달을 닫습니다
    };

    // 순서가 변경되면 streams 상태를 업데이트하는 함수
    const handleSort = (updatedItems) => {
        setStreams(updatedItems);
        updateUrl(updatedItems); // updatedItems 배열을 매개변수로 전달
    };

    // 화면 너비에 따라 span 값을 계산하여 각 Col 컴포넌트의 span 속성을 동적으로 설정합니다.
    // calculateSpan 함수를 useCallback 훅을 사용하여 메모화합니다.
    const calculateSpan = useCallback(() => {
        const width = window.innerWidth;
        if (width > 1200) return 6;
        if (width > 992) return 8;
        if (width > 768) return 12;
        return 24;
    }, []); // 빈 의존성 배열을 전달하여 calculateSpan 함수가 한 번만 생성되도록 합니다.

    // useState 훅을 호출하여 span 상태를 초기화합니다.
    const [span, setSpan] = useState(calculateSpan());

    useEffect(() => {
        const handleResize = () => {
            setSpan(calculateSpan());
        };

        window.addEventListener("resize", handleResize);

        // 컴포넌트가 언마운트될 때 이벤트 리스너를 제거합니다.
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [calculateSpan]); // calculateSpan 함수를 의존성 배열에 추가하여 handleResize 함수가 항상 최신 버전의 calculateSpan 함수를 사용하도록 합니다.

    // 로컬스토리지로부터 값을 불러온다.
    const [layoutMode, setLayoutMode] = useState(localStorage.getItem("ShowChat") || "TabMenu");

    useEffect(() => {
        // 로컬스토리지의 ShowChat 키의 현재 값을 가져와서 상태를 업데이트하는 함수를 정의합니다.
        const updateLayoutMode = () => {
            const updatedMode = localStorage.getItem("ShowChat");
            setLayoutMode(updatedMode || "TabMenu");
        };
    
        // 주기적으로 로컬스토리지의 값을 확인하고 상태를 업데이트하기 위해 setInterval을 사용합니다.
        // 여기서는 예를 들어 500ms 간격으로 체크하고 있습니다.
        const intervalId = setInterval(updateLayoutMode, 100);
    
        // 컴포넌트가 언마운트될 때 setInterval을 정리합니다.
        return () => {
            clearInterval(intervalId);
        };
    }, []);  // 빈 의존성 배열을 전달하여 이 useEffect는 컴포넌트가 마운트될 때 한 번만 실행됩니다.

    const renderStreamLayout = (stream) => {
        // TabMenu 틀
        const items = [
            {
                key: '1',
                label: 'Stream',
                children: (
                    <div className="flex-container">
                        <div className="stream-container">
                            <iframe
                                title={`${stream.nickname}-stream`}
                                src={`https://player.twitch.tv/?channel=${stream.id}&parent=${parentDomain}`}
                                style={{ border: "none", width: "100%", height: "300px" }}
                                allowFullScreen={true}
                            />
                        </div>
                    </div>
                ),
            },
            {
                key: '2',
                label: 'Chat',
                children: (
                    <div className="flex-container">
                        <div className="stream-container">
                            <iframe
                                title={`${stream.nickname}-chat`}
                                src={stream.chatUrl}
                                style={{
                                    border: "none",
                                    width: "100%",
                                    height: "300px",
                                }}
                                allowFullScreen={true}
                            />
                        </div>
                    </div>
                ),
            },
        ];
        if (layoutMode === "CinemaMode") {
            return (
                <Row
                    gutter={[16, 16]}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContents: "center",
                        alignItem: "center",
                        marginBottom: 20,
                    }}
                >
                    <Col span={24}>
                        <div
                            className="cinema-container"
                            style={{ display: "flex", justifyContent: "center", width: "100%", height: "calc(100vh - 64px)" }}  // 높이를 100vh로 설정
                        >
                            <div className="cinema-stream-container" style={{ flex: window.innerWidth <= 768 ? 2 : 7, height: "100%" }}>
                                <iframe
                                    title={`${stream.nickname}-stream`}
                                    src={`https://player.twitch.tv/?channel=${stream.id}&parent=${parentDomain}`}
                                    style={{ border: "none", width: "100%", height: "100%" }}
                                    allowFullScreen={true}
                                />
                            </div>
                            <div className="chat-container" style={{ flex: window.innerWidth <= 768 ? 10 : 3, height: "100%" }}>
                                <iframe
                                    title={`${stream.nickname}-chat`}
                                    src={stream.chatUrl}
                                    style={{ border: "none", width: "100%", height: "100%" }}
                                    allowFullScreen={true}
                                />
                            </div>
                        </div>
                    </Col>
                </Row>
            );
        } else if (layoutMode === "HideChat") {
            return <HideChat stream={stream} parentDomain={parentDomain} />;
        } else {
            // "TabMenu"를 기본으로 설정
            return (
                <div className="flex-containers">
                        <Tabs defaultActiveKey="1" items={items} className="custom-tabs" />
                </div>
            );
        }
    };

    const navigate = useNavigate();

    // URL에서 채널 ID를 파싱하여 streams 상태를 설정하는 함수
    const setStreamsFromUrl = () => {
        const path = window.location.pathname;
        const channelIds = path.split("/").slice(1);
        const newStreams = channelIds
            .filter((id) => id.trim() !== "")
            .map((id) => ({
                id,
                chatUrl: `https://www.twitch.tv/embed/${id}/chat?parent=${parentDomain}`,
                // 기타 필요한 속성이 있다면 여기에 추가
            }));
        setStreams(newStreams.length > 0 ? newStreams : []);
    };

    useEffect(() => {
        setStreamsFromUrl(); // 컴포넌트가 마운트될 때 URL에서 채널 ID를 파싱하여 streams 상태를 설정
    }, []); // 의존성 배열은 빈 배열이므로 이 useEffect는 컴포넌트가 마운트될 때 한 번만 실행됩니다.

    useEffect(() => {
        // streams 상태가 변경될 때마다 URL을 업데이트
        if (streams.length > 0) {
            // streams 배열이 비어 있지 않은 경우에만 URL을 변경합니다.
            const newPath = "/" + streams.map((stream) => stream.id).join("/");
            navigate(newPath);
        }
    }, [streams, navigate]); // streams 상태나 navigate 함수가 변경될 때마다 이 useEffect를 실행

    // 모바일(가로 너비가 768px 미만)인 경우 margin 값을 5px로 설정합니다.
    useEffect(() => {
        const updateMargin = () => {
            const appElement = document.querySelector('.App');
            if (window.innerWidth <= 768 && appElement) {
                appElement.style.margin = '5px';
            } else if (appElement) {
                appElement.style.margin = '';  // 원래의 margin 값으로 되돌립니다.
            }
        };
    
        window.addEventListener('resize', updateMargin);
        updateMargin();  // 초기 로드시에도 마진을 설정합니다.
    
        return () => {
            window.removeEventListener('resize', updateMargin);  // 컴포넌트가 언마운트될 때 이벤트 리스너를 제거합니다.
        };
    }, []);  // 빈 의존성 배열을 전달하여 이 useEffect는 컴포넌트가 마운트될 때 한 번만 실행됩니다.
    

    return (
        <IntlProvider>
            <div className="App">
                <SpeedDial
                    ariaLabel="SpeedDial"
                    sx={{ position: "fixed", bottom: 16, right: 16 }}
                    icon={<SpeedDialIcon />}
                    onClose={handleClose}
                    onOpen={handleOpen}
                    open={open}
                >
                    {actions.map((action, index) => (
                        <SpeedDialAction
                            key={index}
                            icon={action.icon}
                            tooltipTitle={action.name}
                            onClick={() => {
                                handleClose();
                                if (action.name === "Add Stream") setAddstreamVisible(true);
                                if (action.name === "Edit Order") setIsSorting(true);
                                if (action.name === "Settings") setSettingsVisible(true);
                                if (action.name === "Contributors") setContributorsVisible(true);
                            }}
                        />
                    ))}
                </SpeedDial>
                <AddStream
                    open={addstreamVisible}
                    onClose={() => setAddstreamVisible(false)}
                    onAddStream={addStream}
                />
                <Settings open={settingsVisible} onClose={() => setSettingsVisible(false)} />
                {/* 설정 모달 */}
                <Contributors open={contributorsVisible} onClose={() => setContributorsVisible(false)} />
                {isSorting && (
                    <Modal
                        title="순서 변경"
                        open={isSorting}
                        onCancel={() => setIsSorting(false)}
                        footer={null}
                    >
                        <SortableList items={streams} onSort={handleSort} />
                    </Modal>
                )}
                {message && <Alert message={message} type="error" style={{ margin: "16px 0" }} />}
                {streams.length > 0 ? (
                    layoutMode === "ChatCombine" ? (
                        <ChatCombineLayout streams={streams} parentDomain={parentDomain} />
                    ) : layoutMode === "ChatCombinePlus" ? (
                        <ChatCombinePlus streams={streams} parentDomain={parentDomain} />
                    ) : (
                        streams.map((stream, index) => (
                            <div key={index} className={
                                layoutMode === "TabMenu" ? "tab-mode-container" : 
                                layoutMode === "HideChat" ? "hide-chat-container" : ""
                            }>
                                {renderStreamLayout(stream)}
                            </div>
                        ))
                    )
                ) : (
                    <div style={{ textAlign: "center", marginTop: "20%" }}>
                        <Spin size="large" />
                        <Title level={3} style={{ marginTop: 20 }}>
                            스트림을 추가하려면 오른쪽 하단의 버튼을 클릭하세요.
                        </Title>
                    </div>
                )}
            </div>
        </IntlProvider>
    );
}

function App() {
    return (
        <Router>
            <IntlProvider>
                <AppContent />
            </IntlProvider>
        </Router>
    );
}

export default App;
