import axios from 'axios';
import dotenv from 'dotenv';

import { dd } from '../utils/dd';
import { attachToken } from '../middlewares/attachToken';
import { getUserHandlerAndTokens } from './saveTempController';

dotenv.config();

export interface SaveTempReqData { // rename to universal, replace somewhere
  token: string
  hostOrigin: string // same
}

export interface SaveTempReq { // rename to universal, replace somewhere
  path: string // same
  fileName: string
  data: SaveTempReqData
}

export class TokenShareController {

  // export interface ShareTokenReq {
  //   backendUrl: string - адрес, на который нужно сделать запрос
  //   hostOrigin: string - адрес хоста, который нужно переслать
  //   token?: string
  // }
// headers.origin !!!
  static async share(req) {
    const body = req.body
    dd(body)
    try {
      const backOrigin = `${req.protocol}://${req.get('host')}` // todo rename
      
      console.log('backOrigin: ' + backOrigin)
      const encodedBackOrigin = encodeURIComponent(backOrigin)
      const backendUrlForRequest = body.backendUrl // mb get it secure? no not show in frontend?
      
      // Get backend service token before making the request
      const backendServiceToken = await attachToken(
        body.projectId, // target project
        backendUrlForRequest, // target URL
        backOrigin
      )

      // get saved locally token & user hash
      const savedTempData = await getUserHandlerAndTokens(encodedBackOrigin, 'userHandler.json')

      const hostOrigin = req.body.hostOrigin; // todo rename +web
      const encodedHostOrigin = encodeURIComponent(hostOrigin);
      console.log('hostOrigin: ' + hostOrigin)

      const payload = {
        path: encodedHostOrigin, // needed for file path to save creds
        fileName: `token.json`,
        data: {
          userHandler: savedTempData.userHandler,
          accessToken: savedTempData.accessToken,
          refreshToken: savedTempData.refreshToken,
        }
      };

      const response = await axios.post(
        `${backendUrlForRequest}/save-temp/save`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${backendServiceToken.token}`,
            'X-Requester-Project': process.env.PROJECT_ID,
            'X-Requester-Url': backOrigin
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

    } catch (error: any) {
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

