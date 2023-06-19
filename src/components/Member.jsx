import axios from 'axios';
import React, { useEffect, useState } from 'react';

export default function Member() {
  // 전체 api 주소
  const apiUrl = 'https://sandbox.konaplate.com/open-api';

  // 계좌 충전 취소 엔드 포인트 & 데이터
  const cancelApi = '/api/v1/recharges/by-bank-accounts/no-hce/cancel';
  const cancelBody = {
    "dcvv": "366",
    "userId": 50000104652,
    "nrNumber": "KMN221114031773543",
    "cardExpiry": "2509",
    "sequenceId": "202211149990015",
    "oneTimeToken": "9461442187322710"
  }

  const testKonaApi = async () => {
    const res = await axios.post('http://localhost:4000');
    console.log(res.data)
    // axios.post(`${apiUrl + cancelApi}`, cancelBody, {
    //   headers: {
    //     'X-KM-User-AspId': '000170000000000',
    //     'X-KM-Correlation-Id': '2203260931333-1234567',
    //     'X-KM-Access-Key': '115dfe4-0c5b9132c0a2325733f503ecd2665da9',
    //     'X-KM-Crypto-Key-Id': 'e961de1dc6ca833f4f4c0297459ddc2b',        
    //   }
    // });
  }

  useEffect(() => {
    testKonaApi();
  }, []);


  return (
    <div></div>
  )
}
