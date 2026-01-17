/**
 * ============================================
 * Socket.io Service
 * Made by Hammad Naeem
 * ============================================
 */

const logger = require('../utils/logger');

class SocketService {
    /**
     * Emit new sale alert to all connected dashboard clients
     */
    static emitNewSaleAlert(saleData) {
        try {
            if (!global.io) {
                logger.warn('Socket.io instance not available');
                return;
            }

            const alertData = {
                saleId: saleData.id,
                saleNumber: saleData.sale_number,
                amount: parseFloat(saleData.total_amount),
                currency: 'PKR',
                website: saleData.website_name || 'Unknown',
                items: saleData.items?.length || 0,
                timestamp: new Date().toISOString(),
                formattedTime: new Date().toLocaleTimeString('en-PK')
            };

            // Emit to all clients in dashboard room
            global.io.to('dashboard').emit('new_sale_alert', alertData);
            
            logger.info(`📢 Sale alert emitted: ${alertData.saleNumber} - Rs. ${alertData.amount}`);
        } catch (error) {
            logger.error('Error emitting socket event:', error.message);
        }
    }

    /**
     * Emit real-time stats update
     */
    static emitStatsUpdate(stats) {
        try {
            if (!global.io) return;

            global.io.to('dashboard').emit('stats_update', {
                today: stats.today,
                lastHour: stats.lastHour,
                timestamp: new Date().toISOString()
            });

            logger.debug('Stats update emitted');
        } catch (error) {
            logger.error('Error emitting stats update:', error.message);
        }
    }

    /**
     * Emit notification to specific user
     */
    static emitNotification(userId, notification) {
        try {
            if (!global.io) return;

            global.io.to(`user_${userId}`).emit('notification', notification);
            logger.debug(`Notification sent to user ${userId}`);
        } catch (error) {
            logger.error('Error emitting notification:', error.message);
        }
    }

    /**
     * Get connected clients count
     */
    static getConnectedClients() {
        if (!global.io) return 0;
        return global.io.engine.clientsCount;
    }
}

module.exports = SocketService;