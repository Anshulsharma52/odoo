const store = require('../storage/jsonStore');

class OtpService {
  constructor() {
    this.otpStore = new Map(); // email -> { otp, expiresAt, verified }
  }

  generateOtp(email) {
    // Generate a 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    this.otpStore.set(email.toLowerCase(), {
      otp,
      expiresAt,
      verified: false
    });

    console.log(`[StockSense OTP Service] Generated OTP for ${email}: ${otp}`);
    return { otp, expiresAt };
  }

  verifyOtp(email, otp) {
    const record = this.otpStore.get(email.toLowerCase());
    if (!record) {
      return { success: false, message: 'No OTP request found for this email address.' };
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(email.toLowerCase());
      return { success: false, message: 'OTP has expired. Please request a new code.' };
    }

    if (record.otp !== otp.trim()) {
      return { success: false, message: 'Invalid OTP code. Please check and try again.' };
    }

    record.verified = true;
    return { success: true, message: 'OTP verified successfully.' };
  }

  isOtpVerified(email) {
    const record = this.otpStore.get(email.toLowerCase());
    return !!(record && record.verified && Date.now() <= record.expiresAt);
  }

  clearOtp(email) {
    this.otpStore.delete(email.toLowerCase());
  }
}

module.exports = new OtpService();
