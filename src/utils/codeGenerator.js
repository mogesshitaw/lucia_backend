// src/utils/codeGenerator.js
class CodeGenerator {
  // Generate 6-digit numeric verification code
  static generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate secure random token
  static generateToken() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate employee ID
  static generateEmployeeId() {
    const prefix = 'EMP';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(100 + Math.random() * 900).toString();
    return `${prefix}${timestamp}${random}`;
  }

  // Generate customer code
  static generateCustomerCode() {
    const prefix = 'CUST';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(100 + Math.random() * 900).toString();
    return `${prefix}${timestamp}${random}`;
  }

  // Generate order number
  static generateOrderNumber() {
    const prefix = 'ORD';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000).toString();
    return `${prefix}${year}${month}${day}${random}`;
  }
}

module.exports = CodeGenerator;