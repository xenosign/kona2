// 익스프레스 프레임워크 불러오기
const express = require('express');

// cors 이슈 회피를 위한 미들 웨어 호출
const cors = require('cors');
// 통신을 위한 axios 호출
const axios = require('axios');
// Tran Token 생성 시, hmac sha256 해쉬 암호화를 위한 crypto 모듈 호출
const crypto = require('crypto');

// 4000번 포트에서 백엔드 서버 실행
const PORT = 4000;
const app = express();

// cors 회피를 위한 미들웨어 설정
app.use(cors());

// Tran Token 이 현재 시간을 YYYYMMDDHHSSMMM 형태로 표기하므로 해당 형태에 맞게 현재 시간을 변경하기 위한 프로토타입 설정
// 현재의 타임 스탬프가 2023년 6월 19일 11시 50분 11초 333 세컨드라면 20230619115011333 이런 식으로 변환해 줌
Date.prototype.YYYYMMDDHHMMSSMMM = function () {
  let yyyy = this.getFullYear().toString();
  let MM = pad(this.getMonth() + 1, 2);
  let dd = pad(this.getDate(), 2);
  let hh = pad(this.getHours(), 2);
  let mm = pad(this.getMinutes(), 2)
  let ss = pad(this.getSeconds(), 2)
  let mmm = pad(this.getMilliseconds(), 3);


  return yyyy + MM + dd + hh + mm + ss + mmm;
};

// 위의 timestamp 를 위한 0 채우기 함수
function pad(number, length) {
  var str = '' + number;
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}

// 현재 시간을 타임 스탬프로 구해서 암호화 알고리즘에 필요한 형태로 변경
var nowDate = new Date();
const timestamp = nowDate.YYYYMMDDHHMMSSMMM();

// 암호화 함수, 첫번째로는 암호화 키(코나 아이 프로젝트에서 제공하는 시크릿키)를 받고
// 두 번째로는 요청 보내는 body 객체를 문자열 형태로 받음
function GenerateHMAC(key, payload) {
  // 암호화 객체 생성, sha256 알고리즘 선택
  var hmac = crypto.createHmac('sha256', key);

  const message = new Buffer(payload).toString('base64');

  hmac.write(message);
  hmac.end();

  return hmac.read();
}

// 테스트를 위한 미들웨어
app.post('/', async (req, res) => {
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

  // 코나 아이 프로젝트 고유 값들
  // ASPID
  const aspId = '000170000000000';
  // 데이터 암호화 키
  const cryptoKey = 'e961de1dc6ca833f4f4c0297459ddc2b';
  // AccessKey
  const accessKey = '115dfe4-0c5b9132c0a2325733f503ecd2665da9';
  // 시크릿 키
  const secretKey = 'ea5912';

  // 위에서 만든 암호화 함수를 통해 Tran Token 발행을 위한 암호화 작업
  const hash = GenerateHMAC(secretKey, JSON.stringify(cancelBody));
  // base64 양식에 맞추어 암호화 된 결과물을 문자열 변경
  const encoded_hash = new Buffer(hash).toString('base64');

  // 최종 완성 된 Tran Token
  const tranToken = "KMV1" + ':' + timestamp + ':' + encoded_hash;


  const resNa = await axios.post(`${apiUrl + cancelApi}`, cancelBody, {
    headers: {
      'X-KM-User-AspId': aspId,
      'X-KM-Correlation-Id': '2203260931333-1234567',
      'X-KM-Access-Key': accessKey,
      'X-KM-Crypto-Key-Id': cryptoKey,
      'X-KM-Tran-Token': tranToken,
      'X-KM-Tran-Time': timestamp,
      'X-KM-Time-Zone': 'KST'
    }
  });

  console.log(resNa.data);

  res.send('it works');
})

app.listen(PORT, () => {
  console.log(`서버는 ${PORT}번에서 실행 중입니다!`);
});
