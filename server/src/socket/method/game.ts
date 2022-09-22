const WSGAME = require("ws");

module.exports = {
  move: async (
    msg: { room: number; x: number; y: number; a: number },
    jwt: { walletAddress: string },
    clients: [
      {
        send: (arg0: string) => void;
        room: number;
        x: number;
        y: number;
        a: number;
      }
    ]
  ) => {
    clients[jwt.walletAddress].room = msg.room;
    clients[jwt.walletAddress].x = msg.x;
    clients[jwt.walletAddress].y = msg.y;
    clients[jwt.walletAddress].a = msg.a;

    Object.keys(clients).forEach((otherPlayer) => {
      if (
        clients[otherPlayer].room === msg.room /*&&
        jwt.walletAddress !== otherPlayer*/
      ) {
        if (clients[otherPlayer].readyState === WSGAME.OPEN) {
          clients[otherPlayer].send(
            JSON.stringify({
              action: "move",
              user: { w: otherPlayer, x: msg.x, y: msg.y, a: msg.a },
            })
          );
        }
      }
    });
  },
};
