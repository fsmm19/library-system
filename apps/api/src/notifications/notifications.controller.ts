import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../generated/prisma/enums';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles(Role.MEMBER, Role.LIBRARIAN)
  async getNotifications(
    @CurrentUser('id') userId: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const notifications = await this.notificationsService.getUserNotifications(
      userId,
      unreadOnly === 'true',
    );

    return notifications.map((notification) => ({
      ...notification,
      createdAt: notification.createdAt.toISOString(),
      readAt: notification.readAt ? notification.readAt.toISOString() : null,
    }));
  }

  @Get('unread-count')
  @Roles(Role.MEMBER, Role.LIBRARIAN)
  async getUnreadCount(@CurrentUser('id') userId: string) {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Patch(':id/read')
  @Roles(Role.MEMBER, Role.LIBRARIAN)
  async markAsRead(
    @Param('id') notificationId: string,
    @CurrentUser('id') userId: string,
  ) {
    const notification = await this.notificationsService.markAsRead(
      notificationId,
      userId,
    );

    return {
      ...notification,
      createdAt: notification.createdAt.toISOString(),
      readAt: notification.readAt ? notification.readAt.toISOString() : null,
    };
  }

  @Patch('read-all')
  @Roles(Role.MEMBER, Role.LIBRARIAN)
  async markAllAsRead(@CurrentUser('id') userId: string) {
    await this.notificationsService.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  @Roles(Role.MEMBER, Role.LIBRARIAN)
  async deleteNotification(
    @Param('id') notificationId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.notificationsService.deleteNotification(notificationId, userId);
    return { message: 'Notification deleted' };
  }

  @Delete('read/all')
  @Roles(Role.MEMBER, Role.LIBRARIAN)
  async deleteAllRead(@CurrentUser('id') userId: string) {
    await this.notificationsService.deleteAllRead(userId);
    return { message: 'All read notifications deleted' };
  }
}
