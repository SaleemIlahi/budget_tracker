const BASE_URL = "http://127.0.0.1:8000/api/v1/";

export const getApi: <Res>(endpoint: string) => Promise<Res> = async (
  endpoint
) => {
  const config: RequestInit = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  return await response.json();
};

export const postApi: <Res, Req>(
  endpoint: string,
  data: Req
) => Promise<Res> = async (endpoint, data) => {
  const config: RequestInit = {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  return await response.json();
};

export const putApi: <Res, Req>(
  endpoint: string,
  data: Req
) => Promise<Res> = async (endpoint, data) => {
  const config: RequestInit = {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  return await response.json();
};

export const deleteApi: <Res, Req>(
  endpoint: string,
  data: Req
) => Promise<Res> = async (endpoint, data) => {
  const config: RequestInit = {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  return await response.json();
};
