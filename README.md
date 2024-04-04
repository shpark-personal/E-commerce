# E-commerce 상품 주문 서비스

### Milestone
<img width="365" alt="image" src="https://github.com/shpark-personal/E-commerce/assets/58277594/818f9c25-82c3-4b1b-adea-267f9163dfe7">


### 요구사항
* 상품 주문에 필요한 메뉴 정보들을 구성하고 조회가 가능하다
* 사용자는 상품을 여러개 선택하여 주문할 수 있고, 미리 충전한 잔액을 사용한다
* 상품 주문 내역을 통해 판매량이 가장 높은 상품을 추천한다

### 요구사항 분석
* 사용자를 식별하여 금액을 충전,조회,사용해야함
* 상품 조회 시 조회 시점의 상품별 잔여수량이 정확해야함
* 주문 시점에 상품 잔여 수량이 주문 수량에 비해 부족하거나 잔액이 부족하면 결제로 넘어갈 수 없음
* 주문이 가능하면 주문서를 생성함
* 주문서 생성 이후 일정 시간 이상 결제가 진행되지 않으면 이전 주문서는 사라지고, 다시 주문부터 시작해야함
* 결제를 성공할 때 결제서가 생성되며, 정보를 데이터 플랫폼에 전송함
* 결제를 성공할 때, 성공한 상품들의 rank를 저장한다. 
* 주문 시점에서, 재고 차감은 한 번에 한 건만 가능하다 (동시성 이슈 고려)
* 결제 시점에서, 미수 재고 차감은 한 번에 한 건만 가능하다 (동시성 이슈 고려)

### 시퀀스 다이어그램
* 잔액 충전
  
  <img src=https://github.com/shpark-personal/E-commerce/assets/58277594/5b907cfc-badc-4a53-87b3-61374e48e21e.png  width="500" height="350"/> 

* 잔액 조회
  
  <img src=https://github.com/shpark-personal/E-commerce/assets/58277594/61615479-7a93-4609-9d65-61df32862c4d.png  width="500" height="350"/> 

* 상품 조회
  
  <img src=https://github.com/shpark-personal/E-commerce/assets/58277594/fedc70f6-bc64-4f93-b5fb-0351a1fec982.png  width="500" height="350"/> 
  
* 주문

  <img src=https://github.com/shpark-personal/E-commerce/assets/58277594/1fe57b9e-1190-463d-bf33-5bcc64d3b040.png  width="500" height="350"/> 
  
* 결제

  <img src=https://github.com/shpark-personal/E-commerce/assets/58277594/1e344ad7-6b31-48b7-b9fb-778a3a07240b  width="500" height="350"/> 
  
* 상위 상품 조회
  
  <img src=https://github.com/shpark-personal/E-commerce/assets/58277594/bda715d0-b6a9-443d-95be-fd15fcaf2bba  width="500" height="350"/> 


  
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
  

### ERD 설계
![image](https://github.com/shpark-personal/E-commerce/assets/58277594/001a8db8-7d28-482d-a641-d280c3788029)


