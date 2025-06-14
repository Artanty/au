const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

class TokenShareController {

  // export interface ShareTokenReq {
  //   backendUrl: string - адрес, на который нужно сделать запрос
  //   hostOrigin: string - адрес хоста, который нужно переслать
  //   token?: string
  // }
  static async share(req) {
    try {
      const encodedHostOrigin = encodeURIComponent(req.hostOrigin) // передлать на получение его из запроса?
      const backendUrlForRequest = req.backendUrl

      const payload = {
        path: encodedHostOrigin,
        fileName: `token.json`,
        data: {
          token: req.token,
          hostOrigin: encodedHostOrigin,
        }
      };

      const response = await axios.post(
        `${backendUrlForRequest}/save-temp/save`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 5000
        }
      );

      return {
        success: true,
        receiverResponse: response.data,
        // tokenMetadata: {
        //   // id: tokenId,
        //   // expiresIn: '1h'
        // }
      };

    } catch (error) {
      const errorDetails = {
        message: error.message,
        ...(error.response && {
          status: error.response.status,
          responseData: error.response.data
        }),
        ...(error.config && {
          requestUrl: error.config.url,
          payload: error.config.data
        })
      };

      throw new Error(`Token sharing failed: ${JSON.stringify(errorDetails)}`);
    }
  }
}

module.exports = TokenShareController;