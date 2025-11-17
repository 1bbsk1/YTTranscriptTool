type MockResponse = {
  status?: number;
  ok?: boolean;
  json?: () => any;
  text?: () => Promise<string>;
};

export const useMockFetch = (implementations: Array<() => Promise<MockResponse>>) => {
  let callCount = 0;
  const calls: any[] = [];

  const mock = async (...args: any[]) => {
    calls.push(args);
    const impl = implementations[Math.min(callCount, implementations.length - 1)];
    callCount += 1;
    const response = await impl();
    return {
      ok: response.ok ?? true,
      status: response.status ?? 200,
      statusText: response.status === 500 ? "Internal Server Error" : "OK",
      json: async () => (response.json ? response.json() : ({} as any)),
      text: response.text || (async () => ""),
      headers: new Map()
    };
  };

  return { mock, calls };
};
