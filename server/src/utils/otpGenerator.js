// src/utils/otpGenerator.js
import crypto from 'crypto';

// 6-digit numeric OTP
export const generateOTP = (length = 6) => {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += crypto.randomInt(0, 10).toString();
  }
  return otp;
};

export default generateOTP;