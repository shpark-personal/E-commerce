# E-commerce 상품 주문 서비스

### Milestone


### 요구사항
* 상품 주문에 필요한 메뉴 정보들을 구성하고 조회가 가능하다
* 사용자는 상품을 여러개 선택하여 주문할 수 있고, 미리 충전한 잔액을 사용한다
* 상품 주문 내역을 통해 판매량이 가장 높은 상품을 추천한다

### 요구사항 분석
* 사용자를 식별하여 금액을 충전,조회,사용해야함
* 상품 조회 시 조회 시점의 상품별 잔여수량이 정확해야함
* 주문 시점에 상품 잔여 수량이 주문 수량에 비해 부족하면 결제로 넘어갈 수 없음
* 주문 시점에 상품 잔여수량이 충분했더라도 결제 시점에 잔여 수량이 부족하면 결제에 실패함
* 결제 성공 시, 금액의 차감은 한 번에 한 건만 가능하도록 한다 (동시성 이슈 고려)
* 결제 성공 시, 잔여 수량의 차감은 한 번에 한 건만 가능하도록 한다 (동시성 이슈 고려)
* 주문 성공 시, 정보를 데이터 플랫폼에 전송함

### 시퀀스 다이어그램
* 잔액 충전
  
  <img src=https://github.com/shpark-personal/E-commerce/assets/58277594/5b907cfc-badc-4a53-87b3-61374e48e21e.png  width="500" height="350"/> 

* 잔액 조회
  
  <img src=https://github.com/shpark-personal/E-commerce/assets/58277594/61615479-7a93-4609-9d65-61df32862c4d.png  width="500" height="350"/> 

* 상품 조회
  
  <img src=https://github.com/shpark-personal/E-commerce/assets/58277594/fedc70f6-bc64-4f93-b5fb-0351a1fec982.png  width="500" height="350"/> 
  
* 주문

  <img src=https://github.com/shpark-personal/E-commerce/assets/58277594/c2389147-1762-493b-b8ef-74af7214ed05  width="500" height="350"/> 
  
* 결제

  <img src=https://github.com/shpark-personal/E-commerce/assets/58277594/  width="500" height="350"/> 
  
* 상위 상품 조회
  
  <img src=https://github.com/shpark-personal/E-commerce/assets/58277594/bda715d0-b6a9-443d-95be-fd15fcaf2bba  width="500" height="350"/> 


  
### API 명세

| 구분 | API 명 | 설명 |
| ----- | ----- | --------------------- |
| 잔액 충전 | charge | user의 point를 충전한다 |
| 잔액 조회 | check | user의 point를 조회한다 |
| 상품 조회 | search | 상품을 검색하여 정보와 수량을 확인한다 |
| 주문 | order | 상품들을 주문 가능한지 확인한다. 가능하면 주문 form을 생성하여 결제창으로 넘어갈 수 있다. |
| 결제 | pay | 주문 가능한 상품들을 결제한다. 결제가 완료되면 주문 form을 외부로 전송한다. |
| 상위 상품 조회 | searchTopRanked | 3일간 많이 팔린 상품을 조회한다 |



* Request
  
  | 구분 | method | Request Url | param | Body
  | ---- | ---- | ---------------- | ---- | ---- |
  | 잔액 충전 | PATCH | http://{USER_ID}/charge | USER_ID : string | amount : number |
  | 잔액 조회 | GET | http://{USER_ID}/check | USER_ID : string |  |
  | 상품 조회 | GET | http://search/{PRODUCT_ID} | PRODUCT_ID : number |  |
  | 주문 | GET | http://{USER_ID}/order | USER_ID : string | { product_id : number, count : number }[] |
  | 결제 | UPDATE | http://{USER_ID}/pay | USER_ID : string | { product_id : number, count : number }[] |
  | 상위 상품 조회 | GET | http://searchTopRanked |  |  |



* Response

  | 구분 | Body |
  | ---- | ---- |
  | 잔액 충전 | { errorcode : ErrorCode, amount : number } |
  | 잔액 조회 | { errorcode : ErrorCode, amount : number } |
  | 상품 조회 | { errorcode : ErrorCode, product : Product } |
  | 주문 | errorcode : ErrorCode |
  | 결제 | errorcode : ErrorCode |
  | 상위 상품 조회 | products : Product[] |


  * ErrorCode(enum)
    * 0 : Success
    * 1 : Invalid Request (등록되지 않은 사용자, 상품)
    * 2 : Invalid Amount (charge, pay에 음수값)
    * 3 : Lack of point
    * 4 : Lack of products
      
  * Product
    * id : number
    * name : string
    * quantity : number
  

### ERD 설계


