import Express from 'express';
import admincheck from '../middlewares/admincheck';
import { LogEntry } from '../models/Log';
import { Preset } from '../models/Preset';
import { Room } from '../models/Room';
import { Session } from '../models/Session';
import { getActiveRooms, getConnectionCount } from '../socket';

const router = Express.Router();

router.use(admincheck);

router.get('/stats', async (req, res) => {
  const roomCount = await Room.count({});
  const sessionCount = await Session.count({});
  const basicStats = {
    connections: getConnectionCount(),
    activeRooms: getActiveRooms(),
    allRooms: roomCount,
    lifetimeSessions: sessionCount,
  }
  res.send(basicStats);
});

router.get('/history', async (req, res) => {
  const connections = await LogEntry.find({ name: 'connections' });
  const activeRooms = await LogEntry.find({ name: 'activeRooms' });
  res.send({ connections, activeRooms });
});

export default router;
