const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const Plant = require('../models/Plant');

class NotificationService {
  constructor() {
    this.transporter = this.createTransporter();
    this.startCronJobs();
  }

  createTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  startCronJobs() {
    // Check for reminders every hour
    cron.schedule('0 * * * *', async () => {
      await this.checkReminders();
    });

    // Daily summary email at 8 AM
    cron.schedule('0 8 * * *', async () => {
      await this.sendDailySummary();
    });

    // Weekly summary email on Monday at 9 AM
    cron.schedule('0 9 * * 1', async () => {
      await this.sendWeeklySummary();
    });

    console.log('Notification service cron jobs started');
  }

  async checkReminders() {
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      // Find reminders that are due within the next hour and haven't been notified
      const upcomingReminders = await Reminder.find({
        scheduledDate: { $gte: now, $lte: oneHourFromNow },
        isActive: true,
        isCompleted: false,
        'notifications.email.enabled': true,
        'notifications.email.sent': false
      }).populate('user plant');

      for (const reminder of upcomingReminders) {
        await this.sendReminderNotification(reminder);
      }

      // Find overdue reminders
      const overdueReminders = await Reminder.find({
        scheduledDate: { $lt: now },
        isActive: true,
        isCompleted: false,
        'notifications.email.enabled': true,
        'notifications.email.sent': false
      }).populate('user plant');

      for (const reminder of overdueReminders) {
        await this.sendOverdueNotification(reminder);
      }

      console.log(`Checked ${upcomingReminders.length + overdueReminders.length} reminders`);
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }

  async sendReminderNotification(reminder) {
    try {
      const user = reminder.user;
      const plant = reminder.plant;

      const emailContent = {
        from: `"Plant Care Reminder" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: `🌱 Reminder: ${reminder.title}`,
        html: this.generateReminderEmailHTML(reminder, plant, user),
        text: this.generateReminderEmailText(reminder, plant, user)
      };

      await this.transporter.sendMail(emailContent);

      // Mark notification as sent
      reminder.notifications.email.sent = true;
      reminder.notifications.email.sentAt = new Date();
      await reminder.save();

      console.log(`Reminder notification sent to ${user.email} for ${plant.name}`);
    } catch (error) {
      console.error('Error sending reminder notification:', error);
    }
  }

  async sendOverdueNotification(reminder) {
    try {
      const user = reminder.user;
      const plant = reminder.plant;

      const emailContent = {
        from: `"Plant Care Reminder" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: `⚠️ Overdue: ${reminder.title}`,
        html: this.generateOverdueEmailHTML(reminder, plant, user),
        text: this.generateOverdueEmailText(reminder, plant, user)
      };

      await this.transporter.sendMail(emailContent);

      // Mark notification as sent
      reminder.notifications.email.sent = true;
      reminder.notifications.email.sentAt = new Date();
      await reminder.save();

      console.log(`Overdue notification sent to ${user.email} for ${plant.name}`);
    } catch (error) {
      console.error('Error sending overdue notification:', error);
    }
  }

  async sendDailySummary() {
    try {
      const users = await User.find({ 'preferences.notifications.email': true });

      for (const user of users) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get today's reminders
        const todayReminders = await Reminder.find({
          user: user._id,
          scheduledDate: { $gte: today, $lt: tomorrow },
          isActive: true,
          isCompleted: false
        }).populate('plant');

        // Get overdue reminders
        const overdueReminders = await Reminder.find({
          user: user._id,
          scheduledDate: { $lt: today },
          isActive: true,
          isCompleted: false
        }).populate('plant');

        if (todayReminders.length > 0 || overdueReminders.length > 0) {
          const emailContent = {
            from: `"Plant Care Reminder" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: '🌱 Your Daily Plant Care Summary',
            html: this.generateDailySummaryHTML(todayReminders, overdueReminders, user),
            text: this.generateDailySummaryText(todayReminders, overdueReminders, user)
          };

          await this.transporter.sendMail(emailContent);
          console.log(`Daily summary sent to ${user.email}`);
        }
      }
    } catch (error) {
      console.error('Error sending daily summary:', error);
    }
  }

  async sendWeeklySummary() {
    try {
      const users = await User.find({ 'preferences.notifications.email': true });

      for (const user of users) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        weekStart.setHours(0, 0, 0, 0);

        // Get completed reminders from the past week
        const completedReminders = await Reminder.find({
          user: user._id,
          isCompleted: true,
          completedAt: { $gte: weekStart }
        }).populate('plant');

        // Get upcoming reminders for the next week
        const upcomingReminders = await Reminder.find({
          user: user._id,
          scheduledDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
          isActive: true,
          isCompleted: false
        }).populate('plant');

        const emailContent = {
          from: `"Plant Care Reminder" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: '🌱 Your Weekly Plant Care Report',
          html: this.generateWeeklySummaryHTML(completedReminders, upcomingReminders, user),
          text: this.generateWeeklySummaryText(completedReminders, upcomingReminders, user)
        };

        await this.transporter.sendMail(emailContent);
        console.log(`Weekly summary sent to ${user.email}`);
      }
    } catch (error) {
      console.error('Error sending weekly summary:', error);
    }
  }

  generateReminderEmailHTML(reminder, plant, user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Plant Care Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; border-radius: 8px; margin: 20px 0; }
          .plant-info { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 Plant Care Reminder</h1>
          </div>
          
          <div class="content">
            <h2>Hi ${user.firstName}!</h2>
            <p>It's time to take care of your plant:</p>
            
            <div class="plant-info">
              <h3>${plant.name}</h3>
              <p><strong>Species:</strong> ${plant.species}</p>
              <p><strong>Task:</strong> ${reminder.title}</p>
              ${reminder.description ? `<p><strong>Description:</strong> ${reminder.description}</p>` : ''}
              <p><strong>Scheduled:</strong> ${new Date(reminder.scheduledDate).toLocaleString()}</p>
            </div>
            
            <p>Don't forget to mark this task as completed in your Plant Care app!</p>
          </div>
          
          <div class="footer">
            <p>This is an automated reminder from your Plant Care app.</p>
            <p>You can manage your notification preferences in the app settings.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateReminderEmailText(reminder, plant, user) {
    return `
Plant Care Reminder

Hi ${user.firstName}!

It's time to take care of your plant:

Plant: ${plant.name}
Species: ${plant.species}
Task: ${reminder.title}
${reminder.description ? `Description: ${reminder.description}` : ''}
Scheduled: ${new Date(reminder.scheduledDate).toLocaleString()}

Don't forget to mark this task as completed in your Plant Care app!

This is an automated reminder from your Plant Care app.
You can manage your notification preferences in the app settings.
    `;
  }

  generateOverdueEmailHTML(reminder, plant, user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Overdue Plant Care Task</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ef4444; color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { padding: 20px; background-color: #fef2f2; border-radius: 8px; margin: 20px 0; }
          .plant-info { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .urgent { color: #ef4444; font-weight: bold; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Overdue Plant Care Task</h1>
          </div>
          
          <div class="content">
            <h2>Hi ${user.firstName}!</h2>
            <p class="urgent">You have an overdue plant care task:</p>
            
            <div class="plant-info">
              <h3>${plant.name}</h3>
              <p><strong>Species:</strong> ${plant.species}</p>
              <p><strong>Task:</strong> ${reminder.title}</p>
              ${reminder.description ? `<p><strong>Description:</strong> ${reminder.description}</p>` : ''}
              <p class="urgent"><strong>Was scheduled for:</strong> ${new Date(reminder.scheduledDate).toLocaleString()}</p>
            </div>
            
            <p>Please take care of this task as soon as possible to keep your plant healthy!</p>
          </div>
          
          <div class="footer">
            <p>This is an automated reminder from your Plant Care app.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateOverdueEmailText(reminder, plant, user) {
    return `
OVERDUE Plant Care Task

Hi ${user.firstName}!

You have an overdue plant care task:

Plant: ${plant.name}
Species: ${plant.species}
Task: ${reminder.title}
${reminder.description ? `Description: ${reminder.description}` : ''}
Was scheduled for: ${new Date(reminder.scheduledDate).toLocaleString()}

Please take care of this task as soon as possible to keep your plant healthy!

This is an automated reminder from your Plant Care app.
    `;
  }

  generateDailySummaryHTML(todayReminders, overdueReminders, user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Daily Plant Care Summary</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; border-radius: 8px; margin: 20px 0; }
          .section { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .urgent { color: #ef4444; font-weight: bold; }
          .reminder-item { padding: 10px; border-left: 4px solid #10b981; margin: 10px 0; background-color: #f9fafb; }
          .overdue-item { border-left-color: #ef4444; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 Daily Plant Care Summary</h1>
            <p>${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="content">
            <h2>Hi ${user.firstName}!</h2>
            <p>Here's your plant care summary for today:</p>
            
            ${overdueReminders.length > 0 ? `
              <div class="section">
                <h3 class="urgent">⚠️ Overdue Tasks (${overdueReminders.length})</h3>
                ${overdueReminders.map(reminder => `
                  <div class="reminder-item overdue-item">
                    <strong>${reminder.plant.name}</strong> - ${reminder.title}
                    <br><small>Was due: ${new Date(reminder.scheduledDate).toLocaleString()}</small>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${todayReminders.length > 0 ? `
              <div class="section">
                <h3>📅 Today's Tasks (${todayReminders.length})</h3>
                ${todayReminders.map(reminder => `
                  <div class="reminder-item">
                    <strong>${reminder.plant.name}</strong> - ${reminder.title}
                    ${reminder.description ? `<br><small>${reminder.description}</small>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${todayReminders.length === 0 && overdueReminders.length === 0 ? `
              <div class="section">
                <h3>🎉 Great job!</h3>
                <p>You have no plant care tasks scheduled for today. Your plants are well taken care of!</p>
              </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>Keep up the great work with your plant care routine!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateDailySummaryText(todayReminders, overdueReminders, user) {
    return `
Daily Plant Care Summary - ${new Date().toLocaleDateString()}

Hi ${user.firstName}!

Here's your plant care summary for today:

${overdueReminders.length > 0 ? `
OVERDUE Tasks (${overdueReminders.length}):
${overdueReminders.map(reminder => 
  `- ${reminder.plant.name}: ${reminder.title} (was due: ${new Date(reminder.scheduledDate).toLocaleString()})`
).join('\n')}
` : ''}

${todayReminders.length > 0 ? `
Today's Tasks (${todayReminders.length}):
${todayReminders.map(reminder => 
  `- ${reminder.plant.name}: ${reminder.title}${reminder.description ? ` - ${reminder.description}` : ''}`
).join('\n')}
` : ''}

${todayReminders.length === 0 && overdueReminders.length === 0 ? `
Great job! You have no plant care tasks scheduled for today. Your plants are well taken care of!
` : ''}

Keep up the great work with your plant care routine!
    `;
  }

  generateWeeklySummaryHTML(completedReminders, upcomingReminders, user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Weekly Plant Care Report</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { padding: 20px; background-color: #f9fafb; border-radius: 8px; margin: 20px 0; }
          .section { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .stats { display: flex; justify-content: space-around; text-align: center; margin: 20px 0; }
          .stat { padding: 15px; }
          .stat-number { font-size: 24px; font-weight: bold; color: #10b981; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌱 Weekly Plant Care Report</h1>
            <p>Week of ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="content">
            <h2>Hi ${user.firstName}!</h2>
            
            <div class="stats">
              <div class="stat">
                <div class="stat-number">${completedReminders.length}</div>
                <div>Tasks Completed</div>
              </div>
              <div class="stat">
                <div class="stat-number">${upcomingReminders.length}</div>
                <div>Upcoming Tasks</div>
              </div>
            </div>
            
            ${completedReminders.length > 0 ? `
              <div class="section">
                <h3>✅ Completed This Week</h3>
                <p>Great job completing ${completedReminders.length} plant care tasks!</p>
              </div>
            ` : ''}
            
            ${upcomingReminders.length > 0 ? `
              <div class="section">
                <h3>📅 Coming Up This Week</h3>
                <p>You have ${upcomingReminders.length} tasks scheduled for the upcoming week.</p>
              </div>
            ` : ''}
            
            <div class="section">
              <h3>🌱 Keep Growing!</h3>
              <p>Consistent plant care leads to healthy, thriving plants. Keep up the excellent work!</p>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for using Plant Care Reminder!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateWeeklySummaryText(completedReminders, upcomingReminders, user) {
    return `
Weekly Plant Care Report - Week of ${new Date().toLocaleDateString()}

Hi ${user.firstName}!

Your weekly plant care statistics:
- Tasks Completed: ${completedReminders.length}
- Upcoming Tasks: ${upcomingReminders.length}

${completedReminders.length > 0 ? `Great job completing ${completedReminders.length} plant care tasks this week!` : ''}

${upcomingReminders.length > 0 ? `You have ${upcomingReminders.length} tasks scheduled for the upcoming week.` : ''}

Keep Growing!
Consistent plant care leads to healthy, thriving plants. Keep up the excellent work!

Thank you for using Plant Care Reminder!
    `;
  }
}

module.exports = NotificationService;
