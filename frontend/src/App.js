import React, { useCallback, useEffect, useState, useContext  } from "react";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import {
  Alert,
  Col,
  Modal,
  Row,
  Spin,
  Tabs,
  Typography
} from "antd";
import {
  BrowserRouter as Router,
  useNavigate
} from "react-router-dom";
import "./App.css";
import IntlProvider from "./IntlProvider";
import { LanguageContext } from './IntlProvider';
import AddStream from "./components/AddStream";
import Settings from "./components/Settings";
import SortableList from "./components/SortableList";
import useMessage from "./components/useMessage";
import useUpdateUrl from "./components/useUpdateUrl";

const { Title } = Typography;

const actions = [
  { icon: <AddIcon />, name: "Add Stream" },
  { icon: <EditIcon />, name: "Edit Order" },
  { icon: <SettingsIcon />, name: "Settings" },
];

function AppContent() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const handleOpen = () => setOpen(true);
  const [isSorting, setIsSorting] = useState(false); // 채널 순서 변경
  const [addstreamVisible, setAddstreamVisible] = useState(false); // 채널 목록 추가 모달
  const [settingsVisible, setSettingsVisible] = useState(false); // 설정 모달
  const [streams, setStreams] = useState([]);
  const [message, setMessage] = useMessage();
  const updateUrl = useUpdateUrl(streams);
  const { locale, messages, setLocale } = useContext(LanguageContext);  // Get the locale and messages from the LanguageContext

  const parentDomain = window.location.hostname;

  // 채널을 추가하는 함수
  const addStream = (record) => {
    setStreams((prevStreams) => {
      const newStreams = [
        ...prevStreams,
        {
          nickname: record.nickname,
          id: record.id,
          partner: record.partner,
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

  // useState 훅을 호출하여 span 상태를 초기화합니다. 이제 calculateSpan 함수는 이미 선언되었습니다.
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

  const { TabPane } = Tabs;

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

  // useEffect(() => {
  //   setStreamsFromUrl(); // 컴포넌트가 마운트될 때 URL에서 채널 ID를 파싱하여 streams 상태를 설정
  // }, []); // 의존성 배열은 빈 배열이므로 이 useEffect는 컴포넌트가 마운트될 때 한 번만 실행됩니다.

  // useEffect(() => {
  //   // streams 상태가 변경될 때마다 URL을 업데이트
  //   const newPath = "/" + streams.map((stream) => stream.id).join("/");
  //   navigate(newPath);
  // }, [streams, navigate]); // streams 상태나 navigate 함수가 변경될 때마다 이 useEffect를 실행

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

  // 언어 변경 시, 즉시 적용
  const handleLanguageChange = (value) => {
    setLocale(value);  // Update the locale when the selected language changes
  };

  return (
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
                if (action.name === "Add Stream") setAddstreamVisible(true); // 이 부분을 확인해 주세요.
                if (action.name === "Edit Order") setIsSorting(true);
                if (action.name === "Settings") setSettingsVisible(true);
              }}
            />
          ))}
        </SpeedDial>
        <AddStream
          open={addstreamVisible}
          onClose={() => setAddstreamVisible(false)}
          onAddStream={addStream} // onAddStream으로 이름 변경
        />
        <Settings
          visible={settingsVisible}
          onClose={() => setSettingsVisible(false)}
        />{" "}
        {/* 설정 모달 */}
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
        {message && (
          <Alert message={message} type="error" style={{ margin: "16px 0" }} />
        )}
        {streams.length > 0 ? ( // streams 배열이 비어 있지 않은 경우에만 아이프레임을 렌더링합니다.
          <Row gutter={[16, 16]}>
            {streams.map((stream, index) => (
              <Col span={span} key={index}>
                <Tabs defaultActiveKey="1">
                  <TabPane tab="Stream" key="1">
                    <div className="stream-container">
                      <iframe
                        title={`${stream.nickname}-stream`}
                        src={`https://player.twitch.tv/?channel=${stream.id}&parent=${parentDomain}`}
                        style={{ border: "none" }}
                        allowFullScreen={true}
                      />
                    </div>
                  </TabPane>
                  <TabPane tab="Chat" key="2">
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
                  </TabPane>
                </Tabs>
              </Col>
            ))}
          </Row>
        ) : (
          <div style={{ textAlign: "center", marginTop: "20%" }}>
            <Spin size="large" />
            <Title level={3} style={{ marginTop: 20 }}>
            {messages['app.nostream.alert'] || "To add a stream, click the button in the bottom right."}
            </Title>
          </div>
        )}
      </div>
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
