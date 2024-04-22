### API 미리보기
- Swagger 사용
  
![image](https://github.com/shpark-personal/E-commerce/assets/58277594/22549381-7e02-4e47-a7ef-74c6d779b7de)




### API 명세

| 구분 | API 명 | 설명 |
| ----- | ----- | --------------------- |
| 잔액 충전 | charge | user의 point를 충전한다 |
| 잔액 조회 | point | user의 point를 조회한다 |
| 상품 조회 | product | 상품을 검색하여 정보와 수량을 확인한다 |
| 주문 | order | 상품들을 주문 가능한지 확인한다. 가능하면 주문 form을 생성하여 결제창으로 넘어갈 수 있다. |
| 결제 | pay | 주문 가능한 상품들을 결제한다. 결제가 완료되면 주문 form을 외부로 전송한다. |
| 상위 상품 조회 | rank | 3일간 많이 팔린 상품을 조회한다 |



* Request
  
  | 구분 | method | Request Url | param | Body
  | ---- | ---- | ---------------- | ---- | ---- |
  | 잔액 충전 | PATCH | http://mall/user/{USER_ID}/charge | USER_ID : string | amount : number |
  | 잔액 조회 | GET | http://mall/user/{USER_ID}/point | USER_ID : string |  |
  | 상품 조회 | GET | http://mall/product/{PRODUCT_ID} | PRODUCT_ID : number |  |
  | 주문 | POST | http://mall/order/{USER_ID} | USER_ID : string | { product_id : number, count : number }[] |
  | 결제 | POST | http://mall/order/{USER_ID}/pay | USER_ID : string | { product_id : number, count : number }[] |
  | 상위 상품 조회 | GET | http://mall/product/ranked |  |  |



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
  
