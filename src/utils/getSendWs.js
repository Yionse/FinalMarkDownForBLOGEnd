// WebSocket 连接列表
const wsConnections = new Map();

function sendWs(targetQQ, fromQQ, type, data) {
  const ws = wsConnections.get(targetQQ);
  if (ws) {
    ws.send(
      JSON.stringify({
        fromQQ,
        type,
        data,
      })
    );
  }
}

module.exports = {
  wsConnections,
  sendWs,
};
