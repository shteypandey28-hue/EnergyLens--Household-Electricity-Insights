import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

export const initSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);

        // Clients can join specific "rooms" based on appliance ID to listen to only their own hardware
        socket.on('subscribe_appliance', (applianceId: string) => {
            socket.join(`appliance_${applianceId}`);
            console.log(`Client ${socket.id} subscribed to appliance_${applianceId}`);
        });

        socket.on('unsubscribe_appliance', (applianceId: string) => {
            socket.leave(`appliance_${applianceId}`);
            console.log(`Client ${socket.id} unsubscribed from appliance_${applianceId}`);
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io is not initialized!');
    }
    return io;
};
