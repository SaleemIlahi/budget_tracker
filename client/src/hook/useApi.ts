import { useState, useCallback } from "react";
import { getApi, postApi, putApi, deleteApi } from "../utils/api";

export const useApi = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback(
    async <Res, Req = unknown>(
      method: "GET" | "POST" | "PUT" | "DELETE",
      endpoint: string,
      body?: Req
    ) => {
      setLoading(true);
      setError(null);
      try {
        let res: Res;
        if (method === "GET") res = await getApi<Res>(endpoint);
        else if (method === "POST")
          res = await postApi<Res, Req>(endpoint, body as Req);
        else if (method === "PUT")
          res = await putApi<Res, Req>(endpoint, body as Req);
        else res = await deleteApi<Res, Req>(endpoint, body as Req);

        return res;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );
  return { error, loading, request };
};
