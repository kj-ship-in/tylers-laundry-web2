import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
export async function sendEmail({ to, subject, text, code, expiresAt, }) {
    await transporter.sendMail({
        from: `"Kodoo App" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html: `
      <div style="max-width: 500px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;">
      <h2 style="color: #2c3e50; text-align: center;">🔐 Verify Your Email</h2>
      <p style="font-size: 16px; color: #555;">
        Hi there,<br/><br/>
        Your <strong>Kodoo</strong> ${text} is:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="display: inline-block; padding: 14px 24px; font-size: 28px; font-weight: bold; letter-spacing: 4px; background-color: #f0f0f0; border-radius: 8px; color: #333;">
          ${code}
        </span>
      </div>
      <p style="font-size: 14px; color: #888; text-align: center;">
        This code is valid for the next <strong>${expiresAt}</strong>.<br/>
        Please do not share this code with anyone.
      </p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #aaa; text-align: center;">
        You received this email because you're signing in to Kodoo. If this wasn't you, you can ignore this message.
      </p>
    </div>
    `,
        text: `Your Kodoo ${text} is: ${code}. This code is valid for the next ${expiresAt}. Please do not share this code with anyone.`,
    });
}
export const getWelcomeEmailTemplate = (userName) => {
    return {
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #F8F8F8;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .welcome-message {
            color: #333;
            line-height: 1.6;
          }
          .feature-box {
            background-color: #3b82f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 6px;
            border-left: 4px solid #3b82f6;
          }
          .cta-button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
            font-weight: bold;
          }
          .tips-section {
            background-color: #e8f5e8;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
          .icon {
            font-size: 18px;
            margin-right: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Welcome to Kodoo App!</h1>
          </div>
          <div class="content">
            <div class="welcome-message">
              <h2>Hi ${userName},</h2>
              <p>🎉 Congratulations! Your email has been successfully verified and you're all set to start managing your finances like a pro.</p>
              
              <div class="feature-box">
                <h3>🚀 You can now:</h3>
                <ul>
                  <li><span class="icon">📝</span><strong>Track Expenses:</strong> Log your daily spending with ease</li>
                  <li><span class="icon">📊</span><strong>View Analytics:</strong> Get insights into your spending patterns</li>
                  <li><span class="icon">🏷️</span><strong>Categorize:</strong> Organize expenses by categories</li>
                  <li><span class="icon">💸</span><strong>Set Budgets:</strong> Create monthly budget limits</li>
                  <li><span class="icon">📱</span><strong>Mobile Access:</strong> Manage expenses on the go</li>
                  <li><span class="icon">📈</span><strong>Generate Reports:</strong> Export your financial data</li>
                </ul>
              </div>
              
              <div class="tips-section">
                <h3>💡 Quick Tips to Get Started:</h3>
                <ol>
                  <li><strong>Add your first expense</strong> - Start with today's coffee or lunch</li>
                  <li><strong>Set up categories</strong> - Food, Transport, Entertainment, etc.</li>
                  <li><strong>Create a monthly budget</strong> - Set spending limits for each category</li>
                  <li><strong>Check your dashboard</strong> - Review your spending trends</li>
                </ol>
              </div>
              
              <p>Ready to take control of your finances? Let's get started!</p>
              
              <p>Need help? Our support team is here to assist you with any questions about expense tracking, budgeting, or using the app.</p>
              
              <p>Happy budgeting!<br>
              <strong>The Kodoo ExpenseTracker Team</strong> 💚</p>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 Kodoo App. All rights reserved.</p>
            <p>Questions? Reply to this email or visit our help center</p>
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `
      💰 Welcome to Kodoo App!
      
      Hi ${userName},
      
      🎉 Congratulations! Your email has been successfully verified and you're all set to start managing your finances like a pro.
      
      🚀 You can now:
      • Track Expenses: Log your daily spending with ease
      • View Analytics: Get insights into your spending patterns  
      • Categorize: Organize expenses by categories
      • Set Budgets: Create monthly budget limits
      • Mobile Access: Manage expenses on the go
      • Generate Reports: Export your financial data
      
      💡 Quick Tips to Get Started:
      1. Add your first expense - Start with today's coffee or lunch
      2. Set up categories - Food, Transport, Entertainment, etc.
      3. Create a monthly budget - Set spending limits for each category
      4. Check your dashboard - Review your spending trends
      
      Ready to take control of your finances? Let's get started!
      
      Need help? Our support team is here to assist you with any questions about expense tracking, budgeting, or using the app.
      
      Happy budgeting!
      The Kodoo App Team 💚

      © 2025 Kodoo App. All rights reserved.
       Questions? Reply to this email or visit our help center
      If you didn't create this account, please ignore this email.
    `,
    };
};
export const sendWelcomeEmail = async (email, userName) => {
    try {
        const emailTemplate = getWelcomeEmailTemplate(userName);
        const mailOptions = {
            from: {
                name: 'Kodoo App',
                address: process.env.EMAIL_USER,
            },
            to: email,
            subject: 'Welcome to Kodoo App - Start Managing Your Finances!',
            html: emailTemplate.html,
            text: emailTemplate.text,
        };
        const info = (await transporter.sendMail(mailOptions));
        // eslint-disable-next-line no-console
        console.log('✅ Welcome email sent successfully:', info?.messageId);
        return { success: true, messageId: info?.messageId ?? 'sent' };
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ Failed to send welcome email:', error);
        throw new Error('Failed to send welcome email');
    }
};
export const sendBookingConfirmationEmail = async (email, customerName, serviceTitle, pickupAddress, deliveryAddress, bookingDate, pickupTime, totalAmount, bookingId) => {
    try {
        const mailOptions = {
            from: {
                name: 'Tylers Laundry',
                address: process.env.SMTP_USER,
            },
            to: email,
            subject: 'Booking Confirmation - Tylers Laundry',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .container {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #2563EB;
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .booking-card {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 25px;
              border-radius: 8px;
              margin: 20px 0;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid rgba(255, 255, 255, 0.3);
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label {
              font-weight: bold;
            }
            .info-box {
              background-color: #EEF2FF;
              padding: 20px;
              border-left: 4px solid #2563EB;
              margin: 20px 0;
              border-radius: 4px;
            }
            .status-badge {
              display: inline-block;
              background-color: #10B981;
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: bold;
              margin: 15px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
            .divider {
              border-top: 2px solid #eee;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Booking Confirmed</h1>
              <p>Your laundry booking has been successfully created</p>
            </div>
            <div class="content">
              <h2>Hello ${customerName},</h2>
              <p>Thank you for choosing Tylers Laundry! Your booking has been confirmed and we'll take excellent care of your clothes.</p>
              
              <div class="status-badge">
                ✓ BOOKING CONFIRMED
              </div>
              
              <div class="booking-card">
                <h3 style="margin-top: 0; font-size: 20px;">Booking Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span>
                  <span>#${bookingId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Service:</span>
                  <span>${serviceTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Booking Date:</span>
                  <span>${bookingDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Pickup Time:</span>
                  <span>${pickupTime}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Pickup Location:</span>
                  <span>${pickupAddress}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Delivery Location:</span>
                  <span>${deliveryAddress}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Total Amount:</span>
                  <span style="font-size: 18px; font-weight: bold;">$${totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div class="info-box">
                <h3>What's Next?</h3>
                <ul>
                  <li>✓ Our team will pick up your laundry at the scheduled time</li>
                  <li>✓ Your items will be professionally cleaned and pressed</li>
                  <li>✓ We'll deliver your fresh laundry to the specified address</li>
                  <li>✓ You'll receive a delivery notification with tracking</li>
                </ul>
              </div>

              <div class="info-box" style="background-color: #FEF3C7; border-left-color: #F59E0B;">
                <h3>Important Reminders:</h3>
                <ul>
                  <li>Please ensure someone is available at the pickup time</li>
                  <li>Our driver will contact you 30 minutes before arrival</li>
                  <li>Check your items for any special cleaning instructions</li>
                  <li>Keep your booking ID for reference and tracking</li>
                </ul>
              </div>

              <div class="divider"></div>
              
              <p>If you need to modify or cancel your booking, please contact us as soon as possible. We strive to provide you with the best laundry service experience.</p>
              
              <p>Questions? Feel free to reach out to our support team. We're here to help!</p>
              
              <p>Thank you for choosing Tylers Laundry!<br>
              <strong>The Tylers Laundry Team</strong> 👔</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Tylers Laundry. All rights reserved.</p>
              <p>Need help? Contact our support team</p>
              <p>Don't share this email with others to protect your booking details</p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
        ✓ Booking Confirmed - Tylers Laundry

        Hello ${customerName},

        Thank you for choosing Tylers Laundry! Your booking has been confirmed.

        BOOKING DETAILS:
        
        Booking ID: #${bookingId}
        Service: ${serviceTitle}
        Booking Date: ${bookingDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        Pickup Time: ${pickupTime}
        Pickup Location: ${pickupAddress}
        Delivery Location: ${deliveryAddress}
        Total Amount: $${totalAmount.toFixed(2)}

        WHAT'S NEXT?
        
        ✓ Our team will pick up your laundry at the scheduled time
        ✓ Your items will be professionally cleaned and pressed
        ✓ We'll deliver your fresh laundry to the specified address
        ✓ You'll receive a delivery notification with tracking

        IMPORTANT REMINDERS:
        
        • Please ensure someone is available at the pickup time
        • Our driver will contact you 30 minutes before arrival
        • Check your items for any special cleaning instructions
        • Keep your booking ID for reference and tracking

        If you need to modify or cancel your booking, please contact us as soon as possible.

        Questions? Feel free to reach out to our support team. We're here to help!

        Thank you for choosing Tylers Laundry!
        The Tylers Laundry Team 👔

        © ${new Date().getFullYear()} Tylers Laundry. All rights reserved.
      `,
        };
        const info = (await transporter.sendMail(mailOptions));
        // eslint-disable-next-line no-console
        console.log('✅ Booking confirmation email sent successfully:', info?.messageId);
        return { success: true, messageId: info?.messageId ?? 'sent' };
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ Failed to send booking confirmation email:', error);
        throw new Error('Failed to send booking confirmation email');
    }
};
