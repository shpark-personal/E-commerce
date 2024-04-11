export function ValidIdChecker(id: string): boolean {
  if (id != '') return true
  console.log('올바르지 않은 id입니다.')
  return false
}

export function ValidPointChecker(point: number): boolean {
  if (point >= 0) return true
  console.log('올바르지 않은 point 값입니다.')
  return false
}
