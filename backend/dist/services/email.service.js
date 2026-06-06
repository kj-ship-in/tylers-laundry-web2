import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? '');
const FROM_EMAIL = process.env.SMTP_FROM ?? '';
export async function sendEmail({ to, subject, text, code, expiresAt, }) {
    await sgMail.send({
        from: { name: "Tyler's Laundry", email: FROM_EMAIL },
        to,
        subject,
        html: `
      <div style="max-width: 500px; margin: auto; padding: 20px; font-family: Arial, sans-serif; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;">
      <h2 style="color: #2c3e50; text-align: center;">🔐 Verify Your Email</h2>
      <p style="font-size: 16px; color: #555;">
        Hi there,<br/><br/>
        Your <strong>Tyler's Laundry</strong> ${text} is:
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
        You received this email because you're signing in to Tyler's Laundry. If this wasn't you, you can ignore this message.
      </p>
    </div>
    `,
        text: `Your Tyler's Laundry ${text} is: ${code}. This code is valid for the next ${expiresAt}. Please do not share this code with anyone.`,
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
            background-color: #2563EB;
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
            background-color: #EEF2FF;
            padding: 15px;
            margin: 20px 0;
            border-radius: 6px;
            border-left: 4px solid #2563EB;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👔 Welcome to Tyler's Laundry!</h1>
          </div>
          <div class="content">
            <div class="welcome-message">
              <h2>Hi ${userName},</h2>
              <p>🎉 Your email has been successfully verified — you're all set to book your first laundry service!</p>

              <div class="feature-box">
                <h3>🚀 You can now:</h3>
                <ul>
                  <li><strong>Book Services:</strong> Wash & Fold, Dry Cleaning, Ironing, and more</li>
                  <li><strong>Track Orders:</strong> Follow your laundry from pickup to delivery</li>
                  <li><strong>View Invoices:</strong> Access your billing history anytime</li>
                  <li><strong>Leave Reviews:</strong> Share your experience with others</li>
                </ul>
              </div>

              <p>If you have any questions, our team is always happy to help.</p>

              <p>Welcome aboard!<br>
              <strong>The Tyler's Laundry Team</strong> 👔</p>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Tyler's Laundry. All rights reserved.</p>
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `
      Welcome to Tyler's Laundry!

      Hi ${userName},

      Your email has been successfully verified — you're all set to book your first laundry service!

      You can now:
      • Book Services: Wash & Fold, Dry Cleaning, Ironing, and more
      • Track Orders: Follow your laundry from pickup to delivery
      • View Invoices: Access your billing history anytime
      • Leave Reviews: Share your experience with others

      Welcome aboard!
      The Tyler's Laundry Team

      © ${new Date().getFullYear()} Tyler's Laundry. All rights reserved.
    `,
    };
};
export const sendWelcomeEmail = async (email, userName) => {
    try {
        const { html, text } = getWelcomeEmailTemplate(userName);
        await sgMail.send({
            from: { name: "Tyler's Laundry", email: FROM_EMAIL },
            to: email,
            subject: "Welcome to Tyler's Laundry!",
            html,
            text,
        });
        // eslint-disable-next-line no-console
        console.log('✅ Welcome email sent successfully');
        return { success: true };
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ Failed to send welcome email:', error);
        throw new Error('Failed to send welcome email');
    }
};
export const sendBookingConfirmationEmail = async (email, customerName, serviceTitle, pickupAddress, deliveryAddress, bookingDate, pickupTime, totalAmount, bookingId) => {
    try {
        await sgMail.send({
            from: { name: "Tyler's Laundry", email: FROM_EMAIL },
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
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: bold; }
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
            .divider { border-top: 2px solid #eee; margin: 20px 0; }
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

              <div class="status-badge">✓ BOOKING CONFIRMED</div>

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
                  <span style="font-size: 18px; font-weight: bold;">D${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div class="info-box">
                <h3>What's Next?</h3>
                <ul>
                  <li>✓ Our team will pick up your laundry at the scheduled time</li>
                  <li>✓ Your items will be professionally cleaned and pressed</li>
                  <li>✓ We'll deliver your fresh laundry to the specified address</li>
                  <li>✓ You'll receive a delivery notification</li>
                </ul>
              </div>

              <div class="info-box" style="background-color: #FEF3C7; border-left-color: #F59E0B;">
                <h3>Important Reminders:</h3>
                <ul>
                  <li>Please ensure someone is available at the pickup time</li>
                  <li>Our driver will contact you 30 minutes before arrival</li>
                  <li>Check your items for any special cleaning instructions</li>
                  <li>Keep your booking ID for reference</li>
                </ul>
              </div>

              <div class="divider"></div>

              <p>If you need to modify or cancel your booking, please contact us as soon as possible.</p>

              <p>Thank you for choosing Tylers Laundry!<br>
              <strong>The Tylers Laundry Team</strong> 👔</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Tylers Laundry. All rights reserved.</p>
              <p>Don't share this email with others to protect your booking details.</p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
        Booking Confirmed - Tylers Laundry

        Hello ${customerName},

        Your booking has been confirmed.

        Booking ID: #${bookingId}
        Service: ${serviceTitle}
        Date: ${bookingDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        Pickup Time: ${pickupTime}
        Pickup: ${pickupAddress}
        Delivery: ${deliveryAddress}
        Total: D${totalAmount.toFixed(2)}

        Our team will pick up your laundry at the scheduled time. Please ensure someone is available and our driver will contact you 30 minutes before arrival.

        Thank you for choosing Tylers Laundry!
        The Tylers Laundry Team

        © ${new Date().getFullYear()} Tylers Laundry. All rights reserved.
      `,
        });
        // eslint-disable-next-line no-console
        console.log('✅ Booking confirmation email sent successfully');
        return { success: true };
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ Failed to send booking confirmation email:', error);
        throw new Error('Failed to send booking confirmation email');
    }
};
