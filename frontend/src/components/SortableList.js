import {
  CheckCircleOutlined,
  CloseOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { Button, Spin, Tooltip } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemType = "ITEM";

const DraggableItem = ({ 
  item, 
  index, 
  moveItem, 
  length, 
  removeItem, 
  processedNicknames, 
  setProcessedNicknames 
}) => {
  const [userInfo, setUserInfo] = useState(null);
  const sessionKey = `tw_id_${item.id}`;

  useEffect(() => {
    const fetchData = async () => {
      const storedData = sessionStorage.getItem(sessionKey);
      if (storedData) {
        setUserInfo(JSON.parse(storedData));
        return;
      }

      if (processedNicknames.has(item.nickname)) {
        return;
      }

      try {
        const response = await axios.post("https://mt.uiharu.dev/api2.php", {
          SearchType: "ID",
          SearchValue: item.id,
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
          setUserInfo(transformedData);
          setProcessedNicknames(prev => new Set([...prev, item.nickname]));
        }
      } catch (error) {
        console.error("API 호출 중 에러 발생:", error);
      }
    };

    fetchData();
  }, [item.id, item.nickname, sessionKey, processedNicknames, setProcessedNicknames]);

  const [, ref] = useDrag({
    type: ItemType,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => ref(drop(node))}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px",
        border: "1px solid #ccc",
        marginBottom: "4px",
      }}
    >
      <span>
        {userInfo ? (
          `${userInfo.nickname}(${userInfo.id})`
        ) : (
          <>
            <Spin size="small" /> 로딩 중...
          </>
        )}
        {userInfo?.partner && (
          <Tooltip title="트위치 파트너 계정">
            <CheckCircleOutlined
              style={{ color: "blue", marginLeft: 8 }}
              onClick={() => console.log("트위치 파트너 계정")}
            />
          </Tooltip>
        )}
      </span>
      <span>
        {index !== 0 && (
          <Button
            icon={<UpOutlined />}
            onClick={() => moveItem(index, index - 1)}
            style={{ marginRight: "8px" }}
          />
        )}
        {index !== length - 1 && (
          <Button
            icon={<DownOutlined />}
            onClick={() => moveItem(index, index + 1)}
            style={{ marginRight: "8px" }}
          />
        )}
        <Button
          icon={<CloseOutlined />}
          onClick={() => removeItem(index)}
          style={{ color: "red" }}
        />
      </span>
    </div>
  );
};

const SortableList = ({ items, onSort }) => {
  const [processedNicknames, setProcessedNicknames] = useState(new Set());

  const moveItem = (fromIndex, toIndex) => {
    const updatedItems = [...items];
    const [movedItem] = updatedItems.splice(fromIndex, 1);
    updatedItems.splice(toIndex, 0, movedItem);
    onSort(updatedItems);
  };

  const removeItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    onSort(updatedItems);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {items.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            fontSize: "large",
            fontWeight: "bold",
            margin: "20px 0",
          }}
        >
          <Spin />
          <div style={{ margin: "20px 0" }}>
            아직 추가한 채널이 없네요. 채널을 추가해 보세요!
          </div>
        </div>
      ) : (
        items.map((item, index) => (
          <DraggableItem
            key={index}
            index={index}
            item={item}
            moveItem={moveItem}
            length={items.length}
            removeItem={removeItem}
            processedNicknames={processedNicknames}
            setProcessedNicknames={setProcessedNicknames}
          />
        ))
      )}
    </DndProvider>
  );
};

export default SortableList;
