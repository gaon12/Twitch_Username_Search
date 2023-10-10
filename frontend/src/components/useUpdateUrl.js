// src/components/useUpdateUrl.js
import { useCallback } from "react";

const useUpdateUrl = (streams) => {
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

  return updateUrl;
};

export default useUpdateUrl;
