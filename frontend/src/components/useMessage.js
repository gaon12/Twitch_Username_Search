// src/components/useMessage.js
import { useState } from "react";

const useMessage = () => {
  const [message, setMessage] = useState(null);

  return [message, setMessage];
};

export default useMessage;
