# 동시성 문제
여러 트랜잭션이 동시에 실행될 수 있도록 허용하면서도 데이터의 일관성, 무결성이 유지될 수 있도록 하여 전반적인 데이터 정합성을 보장할 수 있도록 하고자 한다.

E-commerce 시스템에서 발생할 수 있는 문제
### 1. point 충전, 사용
- charge, use에서 update가 일어남
- update 중 read가 발생할 수 있다
    ```
    user table : 비관적 Lock 채택
        - 같은 row에 대해 순서를 지켜 정합성을 보장해야함
    ```

### 2. 상품의 재고 차감 및 복원
- 주문 가능 여부 확인
    - 상품 목록 중 한 개를 확인할 때, stock과 remainStock table에 순차적으로 update 발생
    - 상품의 개수(n) X 2 번 update 발생
    - user point 확인
    - 상품 하나의 재고가 부족하거나 point가 부족하면 이전의 commit들은 rollback 되어야함

- 주문목록의 결제
    - remainStock table update : 미수재고 테이블에서 목록 제거
    - user table update : point 사용
      
    ```
    재고, 미수재고 table : Redis Spin Lock 채택
        - 트랜잭션의 충돌이 예상될 때는 자원에 접근하기 전에 Spin Lock을 획득하고, 작업을 완료한 후에 락을 해제함
        - 트랜잭션의 경합 상황이 있더라도 자원에 대한 동시 접근을 제어함    
    ```



