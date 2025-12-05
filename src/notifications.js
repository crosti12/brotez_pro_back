let clients = [];

export const eventRegistry = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  const userId = req.query?.userId;
  const client = { id: userId ? userId : "", res };
  clients.push(client);

  res.write(`data: connected\n\n`);

  req.on("close", () => {
    clients = clients.filter((c) => c.res !== res);
    res.end();
  });
};
export function sendEvent(eventType = "", excludeUserId = null) {
  clients.forEach(({ id, res }) => {
    if (id === excludeUserId) {
      return console.log("Excluding user", id);
    }
    res.write(`data: ${eventType}\n\n`);
  });
}
