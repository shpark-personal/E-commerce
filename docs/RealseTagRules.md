각 서버에서 Release를 할 때 tag 생성에서 다음의 규칙을 따릅니다.
- 1.0.0+dev : devel에서 test서버로 pr 생성 시 tag 생성
- 1.0.0+test : dev->test pr에 대한 test완료 후 stage로 pr 생성 시 tag 생성
- 1.0.0+stage : test->stage pr에 대한 test완료 후 main으로 pr 생성 시 tag 생성
- 1.0.0 : 최종 release tag 생성


```
[semantic versioning]
Major Version
- 이전 버전과 호환되지 않는 API 변경
- 증가할 경우 Minor, Patch 버전은 0으로 초기화

Minor Version
- 이전 버전과 호환되는 방식으로 새 기능 추가
- 일부 기능에 대한 제거 예고
- 증가할 경우 Patch 버전은 0으로 초기화

Patch Version
- 이전 버전과 호환되는 방식으로 버그 등 수정
```

Release Notes

// link 추가

```
[base]
- tag : v0.0.0
- 변경 사항
```

