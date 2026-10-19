// 화면 문구 단일 저장소. 당첨 관련 표현은 "당첨 수량 배정"으로만 표기 (금칙어 grep이 빌드를 막는다).
export const COLOR_NAME: Record<string, string> = { yellow: "영남루별", red: "아리랑별", white: "달빛별", teal: "밀양별", orange: "소원별" };
export const COLOR_ORDER = ["yellow", "red", "white", "teal", "orange"];
// 별 색 (2026-10-15 확정: 밀양별 청록 → 파랑. 내부 키 'teal'은 DB 호환을 위해 유지, 보이는 색만 파랑)
//   별 표식에 같은 색 스티커를 붙여 관람객이 멀리서도 색을 보고 찾아간다 (입장객 증가 대응 — "태그해야 색을 안다" 규칙 폐지)
export const COLOR_WORD: Record<string, string> = { yellow: "노랑", red: "빨강", white: "흰색", teal: "파랑", orange: "주황" };
export const COLOR_HEX: Record<string, string> = { yellow: "#F2C14E", red: "#E05A4E", white: "#E8E4D8", teal: "#2F6FE4", orange: "#F08A3C" };
export const withColor = (c: string) => `${COLOR_NAME[c] ?? c}(${COLOR_WORD[c] ?? ""})`;
export const PRIZE_NAME: Record<string, string> = { g1: "1등 순금 1g 골드바", g2: "2등 지역업체 상품권 4매", g3: "3등 지역업체 상품권 1매", card: "굿바비 행운부적" };
// 2·3등 상품권 안내 / 완료 화면 부대 프로그램 안내 (12차 확정)
export const VOUCHER_NOTE = "상품권은 권면에 적힌 업소에서만 사용할 수 있어요 · 거스름돈 미지급 · 유효기간 2026. 12. 31.";
export const AFTER_NOTE = "별조명 만들기 체험(해설사의 집 옆, 팔찌 소지자, 1인 2,000원) · 간이장터(10월 19:30~23:00 / 11월 19:00~23:00)도 둘러보세요.";
// 사전예약 (v4 2026-10-13): 금찾기는 100% 사전예약제. 예약은 참여 예약이지 입장권이 아니며, 예약자 전용 입구는 없다
export const RSV_URL = "https://goldreserve-pi.vercel.app/";
export const RSV_NOTE = "금찾기는 사전예약자만 참여할 수 있어요. 예약할 때 적은 본인 휴대폰번호를 입력하세요.";
export const RSV_NOTE2 = "동반자도 각자 휴대폰에서 본인 휴대폰번호로 시작합니다. 폰이 바뀌거나 화면이 사라졌을 때도 시작 표식에 다시 대고 본인 번호를 넣으면 그대로 이어져요.";
// (code 모드 — 예약앱 전환 전) 예약번호 6자리 안내
export const RSV_NOTE_CODE = "금찾기는 사전예약자만 참여할 수 있어요. 예약할 때 받은 본인 예약번호 6자리를 입력하세요.";
export const RSV_NOTE2_CODE = "동반자도 각자 휴대폰에서 본인 번호로 시작합니다. 번호는 예약 페이지 '예약 조회'에서 확인할 수 있어요.";
export const RSV_NOTE3 = "(별빛정원 입장권은 매표소에서 따로 구매하는 유료 입장권이며, 예약자 전용 입구는 없습니다.)";
export const OP_HOURS = "10. 18.~11. 8. 주말(토·일) 저녁 · 10월 20:30~23:00 / 11월 19:00~23:00 (최종 입장 22:00)";

export const ERR: Record<string, string> = {
  TAG_INVALID: "등록되지 않은 표식이에요.",
  TAG_INACTIVE: "이 표식은 지금 쉬고 있어요. 다른 별을 찾아보세요.",
  NOT_OP_DAY: "이벤트는 10. 18.~11. 8. 주말(토·일) 저녁에 운영됩니다 · 사전예약제 · 10월 20:30~23:00 / 11월 19:00~23:00 (최종 입장 22:00)",
  BEFORE_OPEN: "오늘 금찾기는 잠시 후 시작합니다. 그동안 별조명 만들기 체험과 간이장터를 즐겨 주세요.",   // 시각은 화면에서 open_at으로 보강
  ENTRY_CLOSED: "오늘 입장 시간이 끝났어요. 다음 운영일에 만나요.",
  CLOSED: "오늘 운영이 끝났어요. 다음 운영일에 만나요.",
  CAP_REACHED: "지금 정원 안에 사람이 많아요. 잠시 후 시작 표식을 다시 태그해 주세요.",
  NO_SESSION: "아직 시작하지 않았어요. 시작 표식에 휴대폰을 대고 본인 휴대폰번호를 넣으면 시작(또는 이어서)돼요.",
  SESSION_COMPLETED: "이미 출구를 지난 참여예요.",
  SESSION_ENDED: "종료된 참여예요. 입구에서 다시 시작할 수 있어요.",
  SESSION_EXPIRED: "시간이 지나 참여가 종료됐어요.",
  NO_QUIZ: "이 별의 이야기가 아직 준비 중이에요.",
  RATE_LIMITED: "잠시 후 다시 시도해 주세요.",
  NOT_FOUND: "오늘 참여 중 이 번호는 없어요. 다시 확인해 주세요.",
  WISH_PERSONAL_INFO: "전화번호·이메일 같은 개인정보는 남길 수 없어요.",
  WISH_BANNED_WORD: "남길 수 없는 표현이 들어 있어요.",
  WISH_LENGTH: "1~100자로 적어 주세요.",
  WISH_EXISTS: "소원은 한 번만 남길 수 있어요.",
  CODE_INVALID: "코드가 맞지 않아요. 수령소 화면의 코드를 다시 확인해 주세요 (3분마다 바뀝니다).",
  PIN_INVALID: "직원 PIN이 맞지 않아요.",
  NOT_DRAWN: "먼저 뽑기를 실행해 주세요.",
  ALREADY_REDEEMED: "이미 경품을 받은 뽑기권이에요.",
  G1_CHECKS_REQUIRED: "1등은 신분 확인과 서류 수령을 모두 체크해야 해요.",
  ALREADY_USED: "이미 뽑기를 마친 뽑기권이에요.",
  TICKET_EXPIRED: "뽑기권 유효시간이 지났어요. (당일 23:00까지)",
  TICKET_INVALID: "뽑기권 정보가 맞지 않아요.",
  ONE_PER_DAY: "오늘은 이미 참여하셨어요. 다음 운영일에 다시 만나요!",
  RSV_REQUIRED: "본인 번호를 정확히 입력해 주세요.",
  RSV_NOTFOUND: "오늘 날짜의 예약에 없는 번호입니다. 예약할 때 적은 본인 번호를 확인해 주세요.",
  RSV_USED: "이미 사용한 번호입니다. 참여는 1인 1일 1회입니다.",
  RSV_LOCKED: "잠시 후 다시 입력해 주세요. (5분)",
  SERVER_ERROR: "잠깐 연결이 매끄럽지 않았어요. 다시 시도해 주세요.",
  TESTER_REQUIRED: "테스트폰 등록이 필요해요 (만료됐을 수 있어요). 관리자 [테스트]에서 다시 등록하세요.",
  FORCE_NOT_ALLOWED: "실제 뽑기권은 결과를 지정할 수 없어요.",
};
export const errText = (code?: string) => (code && ERR[code]) || "다시 시도해 주세요.";
