import {
  CheckCircleOutlined,
  SearchOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Input,
  Modal,
  Select,
  Spin,
  Table,
  Tooltip,
} from "antd";
import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import useMessage from "./useMessage";

const AddStream = ({ open: propOpen, onClose, onAddStream }) => {
  const [searchType, setSearchType] = useState("nickname");
  const [streams, setStreams] = useState([]);
  const [visible, setVisible] = useState(propOpen);
  const parentDomain = window.location.hostname;
  const [loading, setLoading] = useState(false);
  const [disableSearch, setDisableSearch] = useState(false);
  const searchCounter = useRef(0);
  const lastSearchTime = useRef(null);
  const [searchResult, setSearchResult] = useState([]);
  const [message, setMessage] = useMessage();
  const [searchData, setSearchData] = useState([]);
  const [onlyPartners, setOnlyPartners] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // 검색어 상태 추가

  const { Option } = Select;

  const updateUrl = useCallback(
    (updatedStreams = streams) => {
      const path = updatedStreams.map((stream) => stream.id).join("/");
      const protocol = window.location.protocol;
      const host = window.location.host;
      const url = `${protocol}//${host}/${path}`;
      window.history.pushState({}, "", url);
    },
    [streams]
  );

  const columns = [
    {
      title: "Nickname",
      dataIndex: "Nickname",
      key: "Nickname",
      render: (text, record) => (
        <span>
          {text}
          {record.Partner && (
            <Tooltip title="트위치 파트너 계정">
              <CheckCircleOutlined style={{ color: "blue", marginLeft: 8 }} />
            </Tooltip>
          )}
          {record.Broadcasting && (
            <Tooltip
              title={
                <>
                  <div>방송 중</div>
                  <div>({new Date().toLocaleString()} 기준)</div>
                </>
              }
            >
              <VideoCameraOutlined style={{ marginLeft: 8 }} />
            </Tooltip>
          )}
        </span>
      ),
    },
    {
      title: "ID",
      dataIndex: "ID",
      key: "ID",
    },
    {
      title: "URL",
      dataIndex: "URL",
      key: "URL",
      render: (text) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Button onClick={() => addStream(record)}>Select</Button> // onAddStream으로 이름 변경
      ),
    },
  ];

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setOnlyPartners(isChecked);
    const filteredData = isChecked
      ? searchResult.filter((channel) => channel.Partner)
      : searchData;
    setSearchResult(filteredData);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value); // 검색어 변경 처리
  };

  useEffect(() => {
    const filteredData = onlyPartners
      ? searchData.filter((channel) => channel.Partner)
      : searchData;
    setSearchResult(filteredData);
  }, [onlyPartners, searchData]);

  // 선택했거나 모달을 닫으면 검색 결과를 초기화합니다.
  useEffect(() => {
    if (!visible) {
      setSearchData([]);  // 검색 데이터 초기화
      setSearchResult([]);  // 검색 결과 초기화
      setSearchQuery("");  // 검색어 초기화
      setOnlyPartners(false);  // 체크박스 상태 초기화
      setSearchType("nickname");  // searchType 상태 초기화
    }
  }, [visible]);

  useEffect(() => {
    setVisible(propOpen); // propOpen이 변경될 때마다 visible 상태를 업데이트합니다.
  }, [propOpen]);

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
  
      updateUrl(newStreams);
      return newStreams;
    });
    setSearchData([]); // 검색 데이터 초기화
    setSearchResult([]); // 검색 결과 초기화
    setVisible(false); // 모달 닫기

    // 새로운 스트림을 추가하는 부분
    if (onAddStream) {
      onAddStream(record);
    }
  };

  const searchChannels = async () => {
    const currentTime = Date.now();
    if (lastSearchTime.current && currentTime - lastSearchTime.current < 1000) {
      searchCounter.current += 1;
      if (searchCounter.current >= 3) {
        setDisableSearch(true);
        setTimeout(() => setDisableSearch(false), 3000);
        setMessage("Too many requests. Please wait a moment and try again.");
        return;
      }
    } else {
      searchCounter.current = 0;
    }
    lastSearchTime.current = currentTime;

    setLoading(true); // Set loading to true at the start of the search
    setMessage(null); // Clear the previous message
    const value = searchQuery; // 사용자가 입력한 검색어 사용
    if (searchType === "nickname") {
      try {
        const response = await axios.post(
          searchType === "nickname"
            ? "https://mt.uiharu.dev/api.php"
            : "https://mt.uiharu.dev/api2.php",
          {
            SearchType: searchType,
            SearchValue: value,
          }
        );
        if (response.data.StatusCode === 404) {
          setMessage("No channels found");
        } else {
          let resultData =
            searchType === "nickname"
              ? response.data.data
              : [response.data.data];
          setSearchData(resultData); // 원본 데이터 저장
          const filteredData = onlyPartners
            ? resultData.filter((channel) => channel.Partner)
            : resultData;
          setSearchResult(filteredData); // 필터링된 데이터 저장
        }
      } catch (error) {
        console.error(error);
        setMessage("An error occurred while searching for channels");
      }
    } else {
      try {
        const response = await axios.post("https://mt.uiharu.dev/api2.php", {
          SearchType: "ID",
          SearchValue: value,
        });
        if (response.data.StatusCode === 404) {
          Swal.fire({
            // Use sweetalert2 for error messages
            icon: "error",
            title: "Oops...",
            text: "No channels found",
          });
        } else {
          setSearchResult([response.data.data]); // Set the response data as an array to be compatible with the Table component
        }
      } catch (error) {
        console.error(error);
        Swal.fire({
          // Use sweetalert2 for error messages
          icon: "error",
          title: "Oops...",
          text: "An error occurred while searching for channels",
        });
      }
    }
    setSearchQuery(""); // 검색 완료 후 검색어 초기화
    setLoading(false); // Set loading to false once the search is complete
  };

  return (
    <Modal
      title="스트림 추가"
      open={visible}
      onCancel={() => {
        setSearchData([]);  // 검색 데이터 초기화
        setSearchResult([]);  // 검색 결과 초기화
        setSearchQuery("");  // 검색어 초기화
        setOnlyPartners(false);  // 체크박스 체크 해제
        onClose();
      }}
      footer={null}
      width={window.innerWidth > 768 ? "50%" : "80%"}
    >
      <Select
        value={searchType}
        onChange={setSearchType}
        style={{ width: 120, marginRight: 8 }}
      >
        <Option value="nickname">닉네임</Option>
        <Option value="id">아이디</Option>
      </Select>
      <Input.Search
        value={searchQuery} // 검색어 상태 사용
        onChange={handleSearchChange} // 검색어 변경 처리
        placeholder={searchType === "nickname" ? "닉네임 입력" : "아이디 입력"}
        enterButton={<SearchOutlined />}
        onSearch={searchChannels}
        style={{ width: "calc(100% - 128px)", marginBottom: 16 }}
        disabled={disableSearch}
      />
      <Checkbox
        checked={onlyPartners}
        onChange={handleCheckboxChange} // Updated onChange handler
        style={{ marginBottom: 16 }}
      >
        트위치 파트너만 보기
      </Checkbox>
      {loading && (
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <Spin />
          <div>로딩중...</div>
        </div>
      )}
      {(searchType === "nickname" || searchType === "id") &&
        searchResult.length > 0 && (
          <Table
            dataSource={searchResult}
            columns={columns}
            rowKey="UniqueNumber"
            style={{ marginTop: 16 }}
            scroll={window.innerWidth > 768 ? { y: 240 } : { y: 150 }}
            pagination={{
              position: ["bottomCenter"],
              pageSize: 5,
              showSizeChanger: false,
            }}
          />
        )}
    </Modal>
  );
};

export default AddStream;