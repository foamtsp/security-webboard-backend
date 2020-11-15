const CryptoJS = require('crypto-js');
const dotenv = require('dotenv');
dotenv.config({
  path: './config.env'
});

const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, process.env.PASSWORD_SECRET);
  const payload = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return payload;
};

exports.getDecryptedData = (req, res, next) => {
  console.log(getDec)
  if (process.env.NODE_ENV === 'development') {
    req.body = decryptData(req.body.data);
    delete req.body.data
  }
  next();
};

exports.encryptData = data => {
  if (process.env.NODE_ENV === 'development') {
    data = CryptoJS.AES.encrypt(JSON.stringify(data),  process.env.PASSWORD_SECRET).toString();
  }
  return data;
};