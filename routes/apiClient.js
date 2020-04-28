const axios = require("axios");

const apiClient = axios.create({
  baseURL: ''
})

module.exports = apiClient