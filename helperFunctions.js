require('dotenv').config();

const formatArguments = (template) => {
  return template
    .replace(/\s+/g, ' ')
    .replace(/\s/g, '\n')
    .split('\n')
    .filter((arg) => (arg != '' ? true : false));
};

const tryValue = (tryFunction) => {
  try {
    return tryFunction();
  } catch {
    return null;
  }
};

const isAuthorized = (token) => {
  if (token == process.env.API_KEY) {
    return true;
  } else {
    return false;
  }
};

const unauthrizedMessage = () => {
  return { message: 'You are not authorized to access this resource.' };
};

module.exports = { formatArguments, tryValue, isAuthorized, unauthrizedMessage };
